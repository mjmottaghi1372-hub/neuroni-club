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
function createDefaultState(roleId, name = '', avatar = '👤') {
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
        profileId: roleId, // آیدی نقش (مثلا child1, mom, dad)
        profileName: name,
        avatar: avatar,
        version: 3,
        totalScore: 0,
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
        
        // اگر دیتابیس نسخه ۳ (چند کاربره با نقش) بود
        if (stored && stored.version === 3) {
            return stored;
        }

        // اگر دیتابیس نسخه ۲ (تک کاربره قدیمی) بود -> مهاجرت به نسخه ۳
        if (stored && stored.version === 2) {
            const newDB = {
                version: 3,
                activeProfileId: 'child1',
                profiles: {
                    'child1': { ...stored, profileId: 'child1', profileName: 'فرزند اول', avatar: '🦁', version: 3 }
                }
            };
            await saveDatabase(newDB);
            return newDB;
        }

        // اگر هیچی نبود، از localStorage چک کن
        const migrated = migrateFromLocalStorage();
        if (migrated) {
            await saveDatabase(migrated);
            return migrated;
        }

        // اگر کاربر کاملاً جدید بود، دیتابیس خالی با ساختار نقش‌ها بساز
        const freshDB = {
            version: 3,
            activeProfileId: null,
            profiles: {} // خالی شروع می‌شه تا کاربر نقش‌ها رو پر کنه
        };
        await saveDatabase(freshDB);
        return freshDB;
    } catch(e) {
        console.error('DB load failed:', e);
        return { version: 3, activeProfileId: null, profiles: {} };
    }
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