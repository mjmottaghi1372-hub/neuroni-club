// =====================================================
// STORAGE - IndexedDB + مهاجرت از localStorage
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

// مهم: این تابع اینجا defin شده تا state.js به storage.js وابسته نباشه
function createDefaultState() {
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
        version: 2,
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

// مهاجرت از localStorage (نسخه‌های قدیمی)
function migrateFromLocalStorage() {
    try {
        const totalScore = parseInt(localStorage.getItem('brainTotalScore') || '0', 10);
        const levelsRaw = localStorage.getItem('brainLevels_v2') || localStorage.getItem('brainLevels');
        const bestRaw = localStorage.getItem('brainBestScores_v2') || localStorage.getItem('brainBestScores');
        const badgesRaw = localStorage.getItem('brainBadges');
        const streak = parseInt(localStorage.getItem('brainStreak') || '0', 10);
        const lastPlay = localStorage.getItem('brainLastPlayDate');
        const dailyPlay = parseInt(localStorage.getItem('brainDailyPlay') || '0', 10);
        const dailyPlayDate = localStorage.getItem('brainDailyPlayDate');

        // اگر هیچ داده‌ای نبود، یعنی کاربر جدید
        if (!levelsRaw && !bestRaw && !badgesRaw && totalScore === 0 && streak === 0) {
            return null;
        }

        const levels = levelsRaw ? JSON.parse(levelsRaw) : {};
        const best = bestRaw ? JSON.parse(bestRaw) : {};
        const badges = badgesRaw ? JSON.parse(badgesRaw) : {};

        const state = createDefaultState();
        state.totalScore = totalScore || 0;
        state.streak = streak || 0;
        state.lastPlayDate = lastPlay || null;
        state.dailyPlaySeconds = dailyPlay || 0;
        state.dailyPlayDate = dailyPlayDate || null;

        for (const key of GAME_KEYS) {
            if (levels[key] !== undefined) state.games[key].level = levels[key];
            if (best[key] !== undefined) state.games[key].best = best[key];
            if (badges[key] && typeof badges[key] === 'object') {
                state.games[key].badges = { ...state.games[key].badges, ...badges[key] };
            }
        }
        return state;
    } catch(e) {
        console.warn('Migration from localStorage failed:', e);
        return null;
    }
}

async function loadStateFromDB() {
    try {
        const stored = await dbGet(STATE_KEY);
        if (stored && stored.version === 2) return stored;

        const migrated = migrateFromLocalStorage();
        if (migrated) {
            await dbSet(STATE_KEY, migrated);
            return migrated;
        }

        const fresh = createDefaultState();
        await dbSet(STATE_KEY, fresh);
        return fresh;
    } catch(e) {
        console.error('DB load failed:', e);
        return createDefaultState();
    }
}

async function saveStateToDB(s) {
    try { await dbSet(STATE_KEY, s); }
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