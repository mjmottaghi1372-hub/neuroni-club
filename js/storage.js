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

function createDefaultState() {
    const games = {};
    for (const key of GAME_KEYS) {
        games[key] = { 
            level: 1, 
            best: 0, 
            bestTime: null,
            badges: { 1: false, 2: false, 3: false, 4: false },
            tutorialSeen: false 
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
        gameHistory: []
    };
}

function migrateFromLocalStorage() {
    // ... (کدهای مهاجرت بدون تغییر است، همان قبلی را بگذارید)
    // برای اطمینان می‌توانید همان فایل قبلی را نگه دارید، فقط مطمئن شوید createDefaultState بالا باشد
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