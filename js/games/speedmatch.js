// =====================================================
// GAME: SPEED MATCH
// =====================================================

const SM_SHAPES = ['square', 'circle', 'triangle', 'star', 'diamond', 'hexagon'];
const SM_COLORS = ['#e74c3c', '#3498db', '#27ae60', '#e67e22', '#9b59b6', '#f1c40f'];

let speedMatchState = null;

function startSpeedMatch() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    // ساخت دنباله‌ی اشکال از قبل بر اساس قانون سطح
    const sequence = generateSMSequence(cfg);
    
    speedMatchState = {
        key, lvl, cfg, prefix,
        sequence: sequence,
        currentIndex: -1, 
        active: true,
        timerId: null,
        phase: 'showing' 
    };

    document.getElementById(prefix + '-feedback').innerText = '';
    document.getElementById(prefix + '-display').innerHTML = '';
    document.getElementById(prefix + '-instruction').innerText = 'آماده باش...';

    showScreen(GAME_META[key].screen);
    updateGameScore();

    gameTimeout(() => {
        nextSpeedMatchRound();
    }, 1000);
}

function generateSMSequence(cfg) {
    const seq = [];
    const offset = cfg.rule === '1back' ? 1 : 2;

    for (let i = 0; i < cfg.itemsCount; i++) {
        if (i < offset) {
            // شکل‌های ابتدایی که مبنای مقایسه هستند
            seq.push({
                shape: SM_SHAPES[Math.floor(Math.random() * cfg.shapes)],
                color: SM_COLORS[Math.floor(Math.random() * cfg.colors)]
            });
        } else {
            const target = seq[i - offset];
            const isMatch = Math.random() < 0.5; // ۵۰٪ شانس تطابق

            if (isMatch) {
                seq.push({ shape: target.shape, color: target.color });
            } else {
                let newShape, newColor;
                do {
                    newShape = SM_SHAPES[Math.floor(Math.random() * cfg.shapes)];
                    newColor = SM_COLORS[Math.floor(Math.random() * cfg.colors)];
                } while (newShape === target.shape && newColor === target.color);
                seq.push({ shape: newShape, color: newColor });
            }
        }
    }
    return seq;
}

function nextSpeedMatchRound() {
    if (!speedMatchState || !speedMatchState.active) return;

    const { sequence, cfg, prefix } = speedMatchState;
    speedMatchState.currentIndex++;

    if (speedMatchState.currentIndex >= sequence.length) {
        speedMatchState.active = false;
        gameInProgress = false;
        endSingleGame(GAME_META[speedMatchState.key].name, 'تمرین سرعت و تطابق عالی بود!');
        return;
    }

    const currentItem = sequence[speedMatchState.currentIndex];
    
    // نمایش شکل
    const display = document.getElementById(prefix + '-display');
    display.innerHTML = getSMSVG(currentItem.shape, currentItem.color);
    display.classList.add('pop');
    setTimeout(() => display.classList.remove('pop'), 150);

    const rule = cfg.rule;
    const offset = rule === '1back' ? 1 : 2;
    const isSkippable = speedMatchState.currentIndex < offset;

    const btnYes = document.querySelector('.sm-btn-yes');
    const btnNo = document.querySelector('.sm-btn-no');
    
    if (isSkippable) {
        document.getElementById(prefix + '-instruction').innerText = 
            (offset === 2 && speedMatchState.currentIndex === 0) ? 'شکل اول را به خاطر بسپار...' :
            (offset === 2 && speedMatchState.currentIndex === 1) ? 'شکل دوم را هم به خاطر بسپار...' :
            'شکل اول را به خاطر بسپار...';

        btnYes.disabled = true;
        btnNo.disabled = true;
        speedMatchState.phase = 'advance';
        gameTimeout(nextSpeedMatchRound, cfg.timePerItem / 1.5); 
    } else {
        // نمایش راهنمای ثابت و واضح در طول بازی
        if (rule === '2back') {
            document.getElementById(prefix + '-instruction').innerHTML = `
                آیا با شکل <strong style="color:#d63031; font-size:18px;">دو مرحله قبل</strong> یکسان است؟
                <br><span style="font-size:12px; color:#636e72;">(به شکل قبلی کاری نداشته باش!)</span>
            `;
        } else {
            document.getElementById(prefix + '-instruction').innerHTML = `
                آیا این شکل با شکل <strong>قبلی</strong> یکسان است؟
            `;
        }

        btnYes.disabled = false;
        btnNo.disabled = false;
        speedMatchState.phase = 'answering';
        
        startTimerBar(prefix + '-timer-bar', cfg.timePerItem);
        
        clearGameTimeout(speedMatchState.timerId);
        speedMatchState.timerId = gameTimeout(() => {
            if (!speedMatchState || !speedMatchState.active || speedMatchState.phase !== 'answering' || isPaused) return;
            handleSMMiss();
        }, cfg.timePerItem);
    }
}

function answerSpeedMatch(userSaidMatch) {
    if (!speedMatchState || !speedMatchState.active || isPaused || speedMatchState.phase !== 'answering') return;
    
    clearGameTimeout(speedMatchState.timerId);
    speedMatchState.phase = 'advance';

    const { sequence, currentIndex, cfg, prefix } = speedMatchState;
    const currentItem = sequence[currentIndex];
    
    const offset = cfg.rule === '1back' ? 1 : 2;
    const targetItem = sequence[currentIndex - offset];

    const isActuallyMatch = (currentItem.shape === targetItem.shape && currentItem.color === targetItem.color);
    const isCorrect = (userSaidMatch === isActuallyMatch);

    const fb = document.getElementById(prefix + '-feedback');
    const display = document.getElementById(prefix + '-display');

    document.querySelector('.sm-btn-yes').disabled = true;
    document.querySelector('.sm-btn-no').disabled = true;

    if (isCorrect) {
        playSound('correct');
        currentGameScore += 10;
        fb.style.color = '#27ae60';
        fb.innerText = '✅ آفرین!';
        display.style.borderColor = '#00b894';
    } else {
        playSound('wrong');
        currentGameScore = Math.max(0, currentGameScore - 5);
        fb.style.color = '#d63031';
        fb.innerText = '❌ اشتباه بود!';
        display.style.borderColor = '#d63031';
        
        if (registerWrong()) return;
    }

    updateGameScore();
    setTimeout(() => { display.style.borderColor = '#dfe6e9'; }, 500);

    gameTimeout(nextSpeedMatchRound, 600);
}

function handleSMMiss() {
    if (!speedMatchState || !speedMatchState.active) return;
    speedMatchState.phase = 'advance';
    
    const { prefix } = speedMatchState;
    const fb = document.getElementById(prefix + '-feedback');
    const display = document.getElementById(prefix + '-display');

    document.querySelector('.sm-btn-yes').disabled = true;
    document.querySelector('.sm-btn-no').disabled = true;

    playSound('wrong');
    fb.style.color = '#d63031';
    fb.innerText = '⏰ زمان تموم شد!';
    display.style.borderColor = '#d63031';
    setTimeout(() => { display.style.borderColor = '#dfe6e9'; }, 500);

    if (registerWrong()) return;

    gameTimeout(nextSpeedMatchRound, 600);
}

function getSMSVG(shape, color) {
    const size = 100;
    let content = '';
    if (shape === 'square') content = `<rect x="20" y="20" width="60" height="60" fill="${color}"/>`;
    else if (shape === 'circle') content = `<circle cx="50" cy="50" r="35" fill="${color}"/>`;
    else if (shape === 'triangle') content = `<polygon points="50,15 85,85 15,85" fill="${color}"/>`;
    else if (shape === 'diamond') content = `<polygon points="50,10 90,50 50,90 10,50" fill="${color}"/>`;
    else if (shape === 'star') content = `<polygon points="50,5 61,38 95,38 67,59 78,92 50,71 22,92 33,59 5,38 39,38" fill="${color}"/>`;
    else if (shape === 'hexagon') content = `<polygon points="25,10 75,10 100,50 75,90 25,90 0,50" fill="${color}" transform="translate(0,0) scale(0.9) translate(5,5)"/>`;
    return `<svg viewBox="0 0 ${size} ${size}" class="sm-shape-svg">${content}</svg>`;
}

GAME_STARTERS.speedmatch = startSpeedMatch;
GAME_PAUSE_HOOKS.speedmatch = () => {
    clearGameTimeout(speedMatchState.timerId);
};
GAME_RESUME_HOOKS.speedmatch = () => {
    if (!speedMatchState || !speedMatchState.active || speedMatchState.phase !== 'answering') return;
    startTimerBar(speedMatchState.prefix + '-timer-bar', speedMatchState.cfg.timePerItem);
    speedMatchState.timerId = gameTimeout(handleSMMiss, speedMatchState.cfg.timePerItem);
};