// =====================================================
// GAME: RIVER RANGER (River of Animals - N-Back)
// =====================================================

const RR_ANIMALS = [
    { emoji: '🐟', type: 'fish' },
    { emoji: '🐢', type: 'turtle' },
    { emoji: '🦆', type: 'duck' },
    { emoji: '🦀', type: 'crab' },
    { emoji: '🐊', type: 'croc' }
];

let riverRangerState = null;

function startRiverRanger() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    // تعیین قانون بر اساس سطح
       // تعیین قانون بر اساس سطح
    let ruleText = '';
    if (cfg.rule === '1back') {
        ruleText = '🧠 اگر حیوان جدید با حیوان <strong>قبلی</strong> یکسان بود، کلیک کن!';
        if (lvl === 1) ruleText += '<br><span style="font-size:12px; color:#636e72;">(مثال: اگر 🐢 دیدی و بعدش دوباره 🐢 آمد، کلیک کن)</span>';
    } else if (cfg.rule === '2back') {
        ruleText = '🧠 به حیوان قبلی کاری نداشته باش! اگر حیوان جدید با <strong>دو تا قبل از این</strong> یکسان بود، کلیک کن!';
        ruleText += '<br><span style="font-size:12px; color:#636e72;">(مثال: 🐟 سپس 🐢 سپس 🐟 ← حالا این ماهی رو کلیک کن!)</span>';
    }

    document.getElementById(prefix + '-instruction').innerHTML = `<span style="color:#d63031;">${ruleText}</span>`;
    document.getElementById(prefix + '-feedback').innerText = '';
    document.getElementById(prefix + '-area').innerHTML = '';
    updateGameScore();

    riverRangerState = {
        key, lvl, cfg, prefix,
        active: true,
        sequence: [], 
        spawnInterval: null,
        countdownInterval: null,
        timeLeft: cfg.durationSec,
        activeAnimals: new Set()
    };

    riverRangerState.spawnInterval = gameInterval(() => {
        if (isPaused || !riverRangerState || !riverRangerState.active) return;
        spawnRiverAnimal();
    }, cfg.spawnDelayMs);

    riverRangerState.countdownInterval = gameInterval(() => {
        if (isPaused || !riverRangerState || !riverRangerState.active) return;
        riverRangerState.timeLeft--;
        
        if (riverRangerState.timeLeft <= 0) {
            endRiverRanger();
        }
    }, 1000);

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function spawnRiverAnimal() {
    if (!riverRangerState || !riverRangerState.active) return;
    const { prefix, cfg, activeAnimals, sequence } = riverRangerState;
    const area = document.getElementById(prefix + '-area');
    
    let targetIndex = -1;
    if (cfg.rule === '1back') {
        targetIndex = sequence.length - 1;
    } else if (cfg.rule === '2back') {
        targetIndex = sequence.length - 2;
    }

    // ۴۰٪ شانس ایجاد تطابق عمدی
    const isMatch = targetIndex >= 0 && Math.random() < 0.4;

    let animalData;
    if (isMatch) {
        animalData = sequence[targetIndex];
    } else {
        let randomAnimal;
        do {
            randomAnimal = RR_ANIMALS[Math.floor(Math.random() * RR_ANIMALS.length)];
        } while (targetIndex >= 0 && randomAnimal.type === sequence[targetIndex].type);
        animalData = randomAnimal;
    }
    
    sequence.push(animalData);
    
    const randomX = 10 + Math.random() * 70;
    
    const el = document.createElement('div');
    el.className = 'rr-animal';
    el.style.left = randomX + '%';
    el.style.animationDuration = cfg.swimSpeedSec + 's';
    el.dataset.type = animalData.type;
    
    const span = document.createElement('span');
    span.innerText = animalData.emoji;
    span.style.display = 'block';
    span.style.transition = 'all 0.4s ease-in';
    el.appendChild(span);
    
    el.animalInfo = {
        type: animalData.type,
        shouldClick: isMatch,
        clicked: false
    };

    el.onclick = (e) => {
        e.stopPropagation();
        handleRiverClick(el, randomX);
    };

    area.appendChild(el);
    activeAnimals.add(el);

    // زمان‌بندی برای شیرجه زدن (فقط جنبه بصری دارد)
    const diveTimeMs = (cfg.swimSpeedSec * 1000) * 0.6;
    gameTimeout(() => {
        if (!riverRangerState || !riverRangerState.active) return;
        el.classList.add('dived');
    }, diveTimeMs);

    // زمان‌بندی اعلام Miss درست در لحظه رسیدن به پایین
    const missTimeMs = (cfg.swimSpeedSec * 1000) - 100; 
    gameTimeout(() => {
        if (el.parentNode && el.animalInfo.shouldClick && !el.animalInfo.clicked) {
            // اعلام Miss دقیقاً در پایین صفحه
            showRiverFeedback(randomX, false, 'از دست دادی!', 85);
            
            if (registerWrong()) {
                endRiverRanger();
                return;
            }
        }
    }, missTimeMs);

    // حذف فیزیکی المان
    const removeTimeMs = (cfg.swimSpeedSec * 1000) + 200;
    gameTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        activeAnimals.delete(el);
    }, removeTimeMs);
}

function handleRiverClick(el, xPercent) {
    if (!riverRangerState || !riverRangerState.active || isPaused) return;
    
    const info = el.animalInfo;
    if (info.clicked) return;
    info.clicked = true;

    const isCorrect = info.shouldClick;

    // اعلام نتیجه در لحظه کلیک (وسط صفحه)
    showRiverFeedback(xPercent, isCorrect, '', 50);

    if (isCorrect) {
        playSound('correct');
        currentGameScore += 10;
        updateGameScore();
    } else {
        playSound('wrong');
        currentGameScore = Math.max(0, currentGameScore - 5);
        updateGameScore();
        
        if (registerWrong()) {
            endRiverRanger();
            return;
        }
    }
}

// اضافه شدن پارامتر yPercent برای کنترل ارتفاع بازخورد
function showRiverFeedback(xPercent, isCorrect, text = '', yPercent = 50) {
    const area = document.getElementById(riverRangerState.prefix + '-area');
    const feedback = document.createElement('div');
    feedback.className = 'rr-click-feedback';
    feedback.innerText = isCorrect ? '✅' : '❌';
    
    if (!isCorrect && text) {
        feedback.innerHTML = `❌<br><span style="font-size:12px; color:#d63031; background:rgba(255,255,255,0.9); padding:2px 5px; border-radius:5px; white-space:nowrap;">${text}</span>`;
    }

    feedback.style.left = (xPercent - 5) + '%';
    feedback.style.top = yPercent + '%';
    
    area.appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);
}

function endRiverRanger() {
    if (!riverRangerState || !riverRangerState.active) return;
    riverRangerState.active = false;
    gameInProgress = false;

    clearInterval(riverRangerState.spawnInterval);
    clearInterval(riverRangerState.countdownInterval);

    const area = document.getElementById(riverRangerState.prefix + '-area');
    if (area) area.innerHTML = '';

    const { key } = riverRangerState;
    gameTimeout(() => {
        endSingleGame(GAME_META[key].name, 'واکنش و حافظه کاری فوق‌العاده‌ای داری!');
        riverRangerState = null;
    }, 1000);
}

GAME_STARTERS.riverranger = startRiverRanger;
GAME_PAUSE_HOOKS.riverranger = () => {};
GAME_RESUME_HOOKS.riverranger = () => {};