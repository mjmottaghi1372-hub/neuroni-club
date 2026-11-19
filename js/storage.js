// =====================================================
// STORAGE - IndexedDB + مدیریت پروفایل‌های خانوادگی
// =====================================================

const DB_NAME = 'brainClubDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const STATE_KEY = 'main';

let _dbPromise = null;

function openDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
    return _dbPromise;
}

async function dbGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbSet(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function dbDelete(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// ساخت یک پروفایل جدید بر اساس نقش (مامان، بابا و...)
function createDefaultState(roleId, name = '', avatar = '👤', ageGroup = 'child') {
    const games = {};
    for (const key of GAME_KEYS) {
        games[key] = {
            level: 1,
            best: 0,
            bestTime: null,
            badges: { 1: false, 2: false, 3: false, 4: false },
            tutorialSeen: false,
            introSeen: false
        };
    }
    return {
        profileId: roleId,
        profileName: name,
        avatar: avatar,
        ageGroup: ageGroup, // 👈 گروه سنی جدید
        version: 3,
        totalScore: 0,
        dailyScore: 0,      // 👈 امتیاز روزانه جدید
        dailyScoreDate: null, // 👈 تاریخ امتیاز روزانه
        streak: 0,
        lastPlayDate: null,
        readFreeMode: false,
        dailyPlaySeconds: 0,
        dailyPlayDate: null,
        soundEnabled: true,
        games,
        gameHistory: [],
        dailyWorkout: { date: null, games: [], completed: [] },
        cognitiveProfile: { working_memory: null, attention: null, processing_speed: null, flexibility: null, problem_solving: null },
        assessmentCompleted: false,
        currentAssessmentIndex: 0,
        currentAssessmentQueue: [],
        assessmentDomains: [],
        _savedLevelsForAssessment: null
    };
}

// مهاجرت از دیتای قدیمی که توی localStorage ذخیره شده بود
function migrateFromLocalStorage() {
    try {
        const totalScore = parseInt(localStorage.getItem('brainTotalScore') || '0', 10);
        const levelsRaw = localStorage.getItem('brainLevels_v2') || localStorage.getItem('brainLevels');
        const bestRaw = localStorage.getItem('brainBestScores_v2') || localStorage.getItem('brainBestScores');
        const badgesRaw = localStorage.getItem('brainBadges');
        
        // اگر هیچ دیتایی نبود، یعنی کاربر جدیده
        if (!levelsRaw && !bestRaw && !badgesRaw && totalScore === 0) return null;

        // دیتای قبلی رو به عنوان پروفایل "فرزند اول" ذخیره می‌کنیم تا از بین نره
        const migratedProfile = createDefaultState('child1', 'فرزند اول', '🦁');
        migratedProfile.totalScore = totalScore;
        
        if (levelsRaw) {
            const levels = JSON.parse(levelsRaw);
            for (const key in levels) if (migratedProfile.games[key]) migratedProfile.games[key].level = levels[key];
        }
        if (bestRaw) {
            const best = JSON.parse(bestRaw);
            for (const key in best) if (migratedProfile.games[key]) migratedProfile.games[key].best = best[key];
        }
        if (badgesRaw) {
            const badges = JSON.parse(badgesRaw);
            for (const key in badges) {
                if (migratedProfile.games[key] && typeof badges[key] === 'object') {
                    migratedProfile.games[key].badges = { ...migratedProfile.games[key].badges, ...badges[key] };
                }
            }
        }

        return {
            version: 3,
            activeProfileId: 'child1',
            profiles: { 'child1': migratedProfile }
        };
    } catch(e) {
        console.warn('Migration from localStorage failed:', e);
        return null;
    }
}

// بارگذاری کل دیتابیس
async function loadDatabase() {
    try {
        const stored = await dbGet(STATE_KEY);
        
        if (stored && stored.version === 3) {
            // 👈 اعتبارسنجی داده‌ها
            return validateDatabase(stored);
        }

        if (stored && stored.version === 2) {
            const newDB = {
                version: 3,
                activeProfileId: 'child1',
                profiles: {
                    'child1': { ...stored, profileId: 'child1', profileName: 'فرزند اول', avatar: '🦁', version: 3 }
                }
            };
            await saveDatabase(newDB);
            return validateDatabase(newDB);
        }

        const migrated = migrateFromLocalStorage();
        if (migrated) {
            await saveDatabase(migrated);
            return validateDatabase(migrated);
        }

        const freshDB = {
            version: 3,
            activeProfileId: null,
            profiles: {}
        };
        await saveDatabase(freshDB);
        return freshDB;
    } catch(e) {
        console.error('DB load failed:', e);
        return { version: 3, activeProfileId: null, profiles: {} };
    }
}

// 👈 تابع جدید اعتبارسنجی
function validateDatabase(dbData) {
    if (!dbData.profiles) dbData.profiles = {};
    
    for (const roleId in dbData.profiles) {
        const p = dbData.profiles[roleId];
        if (!p.games) p.games = {};
        
        // چک کردن تمام بازی‌ها
        for (const key of GAME_KEYS) {
            if (!p.games[key]) {
                p.games[key] = { level: 1, best: 0, bestTime: null, badges: { 1: false, 2: false, 3: false, 4: false }, tutorialSeen: false, introSeen: false };
            }
            if (!p.games[key].badges) p.games[key].badges = { 1: false, 2: false, 3: false, 4: false };
        }
        
        if (!p.gameHistory) p.gameHistory = [];
        if (p.totalScore === undefined) p.totalScore = 0;
        if (p.streak === undefined) p.streak = 0;
        if (p.ageGroup === undefined) p.ageGroup = 'child';
        if (p.dailyScore === undefined) p.dailyScore = 0;
        if (!p.dailyWorkout) p.dailyWorkout = { date: null, games: [], completed: [] };
        if (!p.cognitiveProfile) p.cognitiveProfile = { working_memory: null, attention: null, processing_speed: null, flexibility: null, problem_solving: null };
    }
    return dbData;
}

async function saveDatabase(dbData) {
    try { await dbSet(STATE_KEY, dbData); }
    catch(e) { console.error('DB save failed:', e); }
}

async function wipeAllData() {
    try { await dbDelete(STATE_KEY); } catch(e) {}
    try {
        ['brainTotalScore','brainLevels','brainLevels_v2','brainBestScores','brainBestScores_v2',
         'brainStreak','brainLastPlayDate','brainBadges','brainNoTimer','brainDailyPlay','brainDailyPlayDate'
        ].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
}