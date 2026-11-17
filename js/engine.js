// =====================================================
// ENGINE - موتور بازی + صفحه نتیجه
// =====================================================

let currentGame = "";
let currentGameScore = 0;
let gameActive = false;
let gameInProgress = false;
let currentWrongCount = 0;
let wrongsLimit = 5;
let _nextAction = null;

function startGame(gameKey) {
    const meta = GAME_META[gameKey];
    if (!meta) { console.error('Unknown game:', gameKey); return; }

    if (TUTORIALS[gameKey] && state.games[gameKey] && !state.games[gameKey].tutorialSeen) {
        showTutorial(gameKey, () => {
            state.games[gameKey].tutorialSeen = true;
            saveStateNow();
            _beginGame(gameKey);
        });
    } else {
        _beginGame(gameKey);
    }
}

function _beginGame(gameKey) {
    history.pushState({ page: 'game' }, '');
    currentGame = gameKey;
    currentGameScore = 0;
    gameActive = true;
    gameInProgress = false;
    isPaused = false;
    gameStartTime = Date.now();
    _nextAction = null;

    initWrongs();

    const meta = GAME_META[gameKey];
    const badge = document.getElementById(meta.prefix + '-level-badge');
    if (badge) badge.innerText = `سطح ${toFa(getLevel(gameKey))}`;

    if (GAME_STARTERS[gameKey]) GAME_STARTERS[gameKey]();
    else console.error('No starter for game:', gameKey);
}

// ============ سیستم جان‌ها ============
function initWrongs() {
    currentWrongCount = 0;
    const cfg = GAME_CONFIGS[currentGame] && GAME_CONFIGS[currentGame][getLevel(currentGame)];
    wrongsLimit = (cfg && cfg.maxWrong) || 5;
    renderWrongs();
}

function registerWrong() {
    if (!gameActive || !gameInProgress) return false;
    currentWrongCount++;
    renderWrongs();
    if (currentWrongCount >= wrongsLimit) {
        gameInProgress = false;
        clearAllGameTimers();
        const meta = GAME_META[currentGame];
        const snapshotGame = currentGame;
         gameTimeout(() => {
            if (!gameActive || currentGame !== snapshotGame) return;
            endSingleGame(meta.name, '😢 خیلی اشتباه کردی! بازی تموم شد.', true);
        }, 1200);
        return true;
    }
    return false;
}

function renderWrongs() {
    if (!currentGame) return;
    const meta = GAME_META[currentGame];
    const el = document.getElementById(meta.prefix + '-wrongs');
    if (!el) return;
    const remaining = Math.max(0, wrongsLimit - currentWrongCount);
    let html = '';
    for (let i = 0; i < wrongsLimit; i++) {
        html += i < remaining ? '❤️' : '🖤';
    }
    el.innerHTML = html;
    el.title = `${remaining} جان باقی‌مانده`;
}

function updateGameScore() {
    const meta = GAME_META[currentGame];
    if (!meta) return;
    const scoreEl = document.getElementById(meta.prefix + '-score');
    if (scoreEl) scoreEl.innerText = "امتیاز: " + toFa(currentGameScore);
}

// ============ تاریخچه ============
function addToHistory(gameKey, score, level, passed, heartsLeft, totalHearts) {
    if (!state.gameHistory) state.gameHistory = [];
    state.gameHistory.push({
        gameKey,
        score: Math.round(score),
        level,
        date: Date.now(),
        passed,
        heartsLeft: heartsLeft,
        totalHearts: totalHearts
    });
    if (state.gameHistory.length > 30) {
        state.gameHistory = state.gameHistory.slice(-30);
    }
}

function getPreviousScoreForGame(gameKey) {
    if (!state.gameHistory || state.gameHistory.length < 1) return null;
    for (let i = state.gameHistory.length - 1; i >= 0; i--) {
        if (state.gameHistory[i].gameKey === gameKey) return state.gameHistory[i].score;
    }
    return null;
}

// ============ پایان بازی ============
function endSingleGame(gameName, message, forceFail) {
    if (!gameActive) return;
    gameActive = false;
    gameInProgress = false;
    isPaused = false;
    clearAllGameTimers();

    const key = currentGame;
    const meta = GAME_META[key];
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const threshold = cfg.threshold;
    const passed = !forceFail && (currentGameScore >= threshold);

    const prevScore = getPreviousScoreForGame(key);

     state.totalScore += Math.round(currentGameScore);
    recordPlayTime();

    if (currentGameScore > getBest(key)) setBest(key, currentGameScore);
    const best = getBest(key);

    let unlocked = false;
    if (passed && lvl < 4 && !window.isInAssessment) {
        setLevel(key, lvl + 1);
        unlocked = true;
    }

    let newBadge = false;
    if (passed && !hasBadge(key, lvl) && !window.isInAssessment) {
        awardBadge(key, lvl);
        newBadge = true;
    }
    
    if (meta.timeBased && window._lastTimeSec !== undefined && window._lastTimeSec !== null) {
        if (state.games[key].bestTime === null || window._lastTimeSec < state.games[key].bestTime) {
            state.games[key].bestTime = Math.round(window._lastTimeSec * 10) / 10;
        }
        window._lastTimeSec = null;
    }

    const heartsLeft = Math.max(0, wrongsLimit - currentWrongCount);
    addToHistory(key, currentGameScore, lvl, passed, heartsLeft, wrongsLimit);
    saveState();

    showScreen('screen-result');
    displayResult(gameName, key, lvl, best, threshold, passed, forceFail, newBadge, prevScore, message, heartsLeft, wrongsLimit);
}

function displayResult(gameName, key, lvl, best, threshold, passed, forceFail, newBadge, prevScore, message, heartsLeft, totalHearts) {
    const meta = GAME_META[key];

    document.getElementById('sr-emoji').innerText = passed ? '🏆' : (forceFail ? '💔' : '💪');
    document.getElementById('sr-title').innerText = gameName + ' تموم شد!';

    const scoreEl = document.getElementById('sr-score');
    scoreEl.innerText = '۰';
    setTimeout(() => animateScore(currentGameScore), 150);

    const diffEl = document.getElementById('sr-score-diff');
    if (prevScore !== null) {
        const diff = Math.round(currentGameScore - prevScore);
        if (diff > 0) {
            diffEl.style.color = '#27ae60';
            diffEl.innerText = `+${toFa(diff)} بهتر از دور قبل ✨`;
        } else if (diff < 0) {
            diffEl.style.color = '#d63031';
            diffEl.innerText = `${toFa(diff)} نسبت به دور قبل`;
        } else {
            diffEl.style.color = '#636e72';
            diffEl.innerText = 'مثل دور قبل';
        }
    } else {
        diffEl.style.color = '#0984e3';
        diffEl.innerText = '🎉 اولین بار این بازی!';
    }

    const bestBar = document.getElementById('sr-best-bar');
    bestBar.style.width = '0%';
    document.getElementById('sr-best').innerText = toFa(best) + ' امتیاز';
    setTimeout(() => {
        const pct = best > 0 ? Math.min(100, (currentGameScore / best) * 100) : 0;
        bestBar.style.width = pct + '%';
    }, 300);

    const progressSection = document.getElementById('sr-progress-section');
    const progressBar = document.getElementById('sr-progress-bar');
    const progressText = document.getElementById('sr-progress-text');

    if (!passed) {
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => {
            const pct = threshold > 0 ? Math.min(100, (currentGameScore / threshold) * 100) : 0;
            progressBar.style.width = pct + '%';
        }, 400);
        progressText.innerText = `${toFa(Math.round(currentGameScore))} از ${toFa(threshold)}`;
    } else if (lvl < 4) {
        const newLvl = lvl + 1;
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => { progressBar.style.width = '100%'; }, 400);
        progressText.innerText = `✅ سطح ${toFa(newLvl)} باز شد!`;
    } else {
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => { progressBar.style.width = '100%'; }, 400);
        progressText.innerText = '👑 استاد این بازی!';
    }

    const badgeSection = document.getElementById('sr-badge-section');
    if (newBadge) {
        badgeSection.style.display = 'flex';
        document.getElementById('sr-badge-icon').innerText = LEVEL_MEDALS[lvl];
        document.getElementById('sr-badge-name').innerText = `سطح ${toFa(lvl)} — ${meta.name}`;
    } else {
        badgeSection.style.display = 'none';
    }

    const lvlMsg = document.getElementById('sr-level-msg');
    if (passed) {
        lvlMsg.style.color = '#f39c12';
        lvlMsg.innerText = lvl === 4
            ? '👑 وای! تو استادِ این بازی شدی!'
            : `🎉 به سطح ${toFa(getLevel(key))} راه پیدا کردی!`;
    } else {
        lvlMsg.innerText = '';
    }

    const msgEl = document.getElementById('sr-message');
    msgEl.className = passed ? 'pass-text result-message' : 'fail-text result-message';
    if (passed) {
        msgEl.innerText = message || 'آفرین قهرمان!';
    } else if (forceFail) {
        msgEl.innerText = message || 'خیلی اشتباه کردی! دوباره تلاش کن.';
    } else {
        msgEl.innerText = `تلاش خوبی بود! برای رفتن به سطح بعد به ${toFa(threshold)} امتیاز نیاز داری.`;
    }

    renderResultHistory();

    const heartsEl = document.getElementById('sr-hearts');
    if (heartsEl) {
        let html = '';
        for (let i = 0; i < totalHearts; i++) {
            html += i < heartsLeft ? '❤️' : '🖤';
        }
        heartsEl.innerHTML = html;
    }

    // تعیین عملیات بعدی (ارزیابی / تمرین روزانه / عادی)
    if (window.isInAssessment) {
        // فرمول سخت‌گیرانه‌تر: برای ۱۰۰٪ باید ۲.۵ برابر حد نصاب امتیاز بگیری
        const maxBenchmark = threshold * 2.5; 
        const scorePct = Math.min(100, (currentGameScore / maxBenchmark) * 100);
        const heartPct = (heartsLeft / totalHearts) * 100;
        
        // وزن: ۷۰٪ برای امتیاز، ۳۰٪ برای جان‌های باقی‌مانده
        const percentage = Math.round((scorePct * 0.7) + (heartPct * 0.3));
        
        state.cognitiveProfile[meta.domain] = percentage; 
        state.currentAssessmentIndex++;
        
        if (state.currentAssessmentIndex < state.currentAssessmentQueue.length) {
            const nextKey = state.currentAssessmentQueue[state.currentAssessmentIndex];
            _nextAction = { html: '<i data-lucide="play"></i><span>مرحله بعدی ارزیابی</span>', action: 'assessment_next', targetGame: nextKey };
            document.getElementById('sr-title').innerText = 'مرحله ارزیابی ثبت شد';
        } else {
            window.isInAssessment = false;
            state.assessmentCompleted = true;
            saveState();
            _nextAction = { html: '<i data-lucide="check-circle"></i><span>مشاهده پروفایل</span>', action: 'assessment_done' };
            document.getElementById('sr-title').innerText = '🎉 ارزیابی کامل شد!';
            showConfetti();
        }
    } else if (window.isInDailyWorkout) {
        const dw = state.dailyWorkout;
        if (dw) {
            const indexInWorkout = dw.games.indexOf(key);
            if (indexInWorkout !== -1 && !dw.completed.includes(indexInWorkout)) {
                dw.completed.push(indexInWorkout);
                saveState();
            }
            
            if (dw.completed.length >= dw.games.length) {
                window.isInDailyWorkout = false;
                _nextAction = { html: '<i data-lucide="check-circle"></i><span>پایان تمرین</span>', action: 'go_menu' };
                document.getElementById('sr-title').innerText = '🎉 تمرین امروز تموم شد!';
                showConfetti();
            } else {
                const nextIndex = dw.games.findIndex((_, i) => !dw.completed.includes(i));
                const nextKey = dw.games[nextIndex];
                const nMeta = GAME_META[nextKey];
                _nextAction = { html: `<i data-lucide="play"></i><span>بازی بعدی: ${nMeta.name}</span>`, action: 'workout_next', targetGame: nextKey };
            }
        }
    } else {
        _nextAction = determineNextAction(key, passed, forceFail, lvl);
    }

    document.getElementById('sr-next-btn').innerHTML = _nextAction.html;
    refreshIcons();

    if (passed) {
        playSound('win');
        showConfetti();
        showMascotMessage('آفرین قهرمان! 🌟', 4000);
    } else {
        playSound('wrong');
        showMascotMessage(forceFail ? 'نگران نباش، دوباره تلاش کن! 💪' : 'دفعه بعد بهتر می‌شی! 💪', 4000);
    }
    updateMascotVisibility();
}

function determineNextAction(key, passed, forceFail, lvl) {
    if (!passed) {
        return {
            html: '<i data-lucide="rotate-ccw"></i><span>تکرار بازی</span>',
            action: 'retry', targetGame: key
        };
    }

    if (lvl < 4) {
        return {
            html: '<i data-lucide="play"></i><span>مرحله بعد</span>',
            action: 'next_level', targetGame: key
        };
    }

    const domain = GAME_META[key].domain;
    const sameDomain = GAME_KEYS.filter(k => k !== key && GAME_META[k].domain === domain);
    const notMastered = sameDomain.filter(k => getLevel(k) < 4);

    let target = null;
    if (notMastered.length > 0) {
        target = notMastered[Math.floor(Math.random() * notMastered.length)];
    } else if (sameDomain.length > 0) {
        target = sameDomain[Math.floor(Math.random() * sameDomain.length)];
    }

    if (target) {
        const tMeta = GAME_META[target];
        return {
            html: `<i data-lucide="play"></i><span>${tMeta.name}</span>`,
            action: 'new_game', targetGame: target
        };
    }

    return { html: '<i data-lucide="home"></i><span>منو</span>', action: 'go_menu' };
}

function animateScore(target) {
    const el = document.getElementById('sr-score');
    if (!el) return;
    const targetVal = Math.round(target);
    const duration = 1000;
    const start = Date.now();

    function step() {
        const elapsed = Date.now() - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(targetVal * eased);
        el.innerText = toFa(current);
        if (t < 1) requestAnimationFrame(step);
        else el.innerText = toFa(targetVal) + ' امتیاز';
    }
    requestAnimationFrame(step);
}

function renderResultHistory() {
    const list = document.getElementById('sr-history-list');
    if (!list) return;
    const history = state.gameHistory || [];
    const last5 = history.slice(-5).reverse();

    if (last5.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#b2bec3; font-size:13px;">هنوز بازی نکردی</p>';
        return;
    }

    list.innerHTML = '';
    last5.forEach(entry => {
        const m = GAME_META[entry.gameKey];
        if (!m) return;
        const domain = DOMAINS[m.domain];
        
        let heartsStr = '';
        if (entry.heartsLeft !== undefined && entry.totalHearts !== undefined) {
            for (let i = 0; i < entry.totalHearts; i++) {
                heartsStr += i < entry.heartsLeft ? '❤️' : '🖤';
            }
        }
        
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-game">
                <i data-lucide="${m.icon}" style="color:${domain.color};"></i>
                <span>${m.name}</span>
                <span class="history-level">L${toFa(entry.level)}</span>
            </div>
            <div class="history-hearts" style="font-size:10px; direction:ltr; margin: 0 10px;">${heartsStr}</div>
            <div class="history-score ${entry.passed ? '' : 'failed'}">
                ${toFa(entry.score)} امتیاز
            </div>
        `;
        list.appendChild(item);
    });
    refreshIcons();
}

function handleNextGame() {
    if (!_nextAction) { goToMenu(); return; }
    const action = _nextAction;
    _nextAction = null;

    if (action.action === 'retry' || action.action === 'next_level' || action.action === 'new_game') {
        window.isInDailyWorkout = false;
        window.isInAssessment = false;
        startGame(action.targetGame);
    } else if (action.action === 'workout_next' || action.action === 'assessment_next') {
        startGame(action.targetGame);
    } else if (action.action === 'assessment_done') {
        showAssessmentResult();
    } else {
        window.isInDailyWorkout = false;
        window.isInAssessment = false;
        goToMenu();
    }
}

// ============ خروج ============
function requestExit() {
    if (!gameActive) { goToMenu(); return; }
    
    if (window.isInAssessment) {
        showModal('لغو ارزیابی؟', 'اگر الان خارج شی، ارزیابی ناقص می‌مونه و باید از اول شروع کنی.', [
            { text: 'ادامه ارزیابی', class: 'primary', action: closeModal },
            { text: 'خروج و لغو', class: 'secondary', action: () => { closeModal(); goToMenu(); } }
        ]);
        return;
    }

    if (gameInProgress) {
        showModal(
            'پایان بازی؟',
            `امتیاز فعلی: <strong style="color:#0984e3;">${toFa(Math.round(currentGameScore))}</strong><br>اگر الان خارج شی، این امتیاز ثبت می‌شه ولی به سطح بعد نمی‌ری.`,
            [
                { text: 'ادامه بدم', class: 'primary', action: closeModal },
                { text: 'پایان و ثبت', class: 'secondary', action: finishGameEarly }
            ]
        );
    } else {
        showModal(
            'خروج از بازی؟',
            currentGameScore > 0
                ? `امتیاز فعلی (${toFa(Math.round(currentGameScore))}) به امتیاز کل اضافه می‌شود.`
                : 'هنوز امتیازی کسب نکردی!',
            [
                { text: 'ادامه بازی', class: 'primary', action: closeModal },
                { text: 'خروج', class: 'secondary', action: saveCurrentScoreAndExit }
            ]
        );
    }
}

function finishGameEarly() {
    closeModal();
    gameInProgress = false;
    const meta = GAME_META[currentGame];
    endSingleGame(meta.name, 'بازی تموم شد!');
}

function saveCurrentScoreAndExit() {
    if (gameActive && currentGameScore > 0) {
        state.totalScore += Math.round(currentGameScore);
        currentGameScore = 0;
        saveState();
    }
    recordPlayTime();
    closeModal();
    gameActive = false; gameInProgress = false; isPaused = false;
    clearAllGameTimers();
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('interference-overlay').style.display = 'none';
    goToMenu();
}

function requestReset() {
    showModal(
        '⚠️ پاک کردن همه پیشرفت',
        'همه امتیازها، نشان‌ها و سطح‌ها پاک می‌شوند و قابل بازگشت نیستند.<br><strong>برای تأیید، دکمه قرمز را ۲ ثانیه نگه دار.</strong>',
        [{ text: 'نه، انصراف', class: 'secondary', action: closeModal }]
    );
    const container = document.getElementById('modal-buttons');
    const btn = document.createElement('button');
    btn.className = 'modal-btn hold-to-confirm';
    btn.innerHTML = '<div class="hold-fill"></div><span class="hold-text">🗑️ نگه دار تا پاک شود</span>';
    let holdTimer = null, holdActive = false;
    const startHold = (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (holdActive) return;
        holdActive = true;
        btn.classList.add('holding');
        holdTimer = setTimeout(doReset, 2000);
    };
    const cancelHold = () => {
        holdActive = false;
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        btn.classList.remove('holding');
    };
    if (window.PointerEvent) {
        btn.addEventListener('pointerdown', startHold);
        btn.addEventListener('pointerup', cancelHold);
        btn.addEventListener('pointerleave', cancelHold);
        btn.addEventListener('pointercancel', cancelHold);
    } else {
        btn.addEventListener('mousedown', startHold);
        btn.addEventListener('mouseup', cancelHold);
        btn.addEventListener('mouseleave', cancelHold);
        btn.addEventListener('touchstart', startHold, { passive: false });
        btn.addEventListener('touchend', cancelHold);
        btn.addEventListener('touchcancel', cancelHold);
    }
    container.appendChild(btn);
}

async function doReset() {
    await wipeAllData();
    location.reload();
}
