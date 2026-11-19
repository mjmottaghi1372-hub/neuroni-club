// =====================================================
// GAME: WORDHUNT (junior: میوه/حیوان | senior: کلمات) - زمان‌محور
// =====================================================

const WH_FRUITS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍'];
const WH_ANIMALS_EMOJI = ['🐱', '🐶', '🐰', '🐻', '🦊', '🐸', '🐷'];
const WH_RED_FRUITS = ['🍎', '🍓', '🍒'];
const WH_JUNIOR_POOL = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🚗', '🚀', '⚽', '🎈', '🐱', '🐶', '🌻', '🍕', '🐰', '🐻', '🦊'];

const WH_RED_SIMILAR_POOL = [
    '🍎', '🍓', '🍒', '🍅', '🍑', '🌶️', '🍉',
    '🥩', '🍟', '🥫', '🎈', '🚗', '🏀'
];

const WH_ANIMALS_WORDS = ['میمون', 'گربه', 'شیر', 'خرس', 'اسب', 'ماهی', 'پلنگ', 'گرگ', 'روباه', 'زنبور', 'عقاب', 'دلفین', 'خرگوش', 'آهو'];
const WH_ALL_WORDS = ['میمون', 'کتاب', 'سیب', 'گربه', 'پنجره', 'شیر', 'دفتر', 'خرس', 'میز', 'ماهی', 'توپ', 'اسب', 'پلنگ', 'درخت', 'گرگ', 'قفل', 'روباه', 'زنبور', 'خانه', 'عقاب', 'دلفین', 'کفش', 'برگ', 'خرگوش', 'آب', 'قاشق', 'نور', 'شمع', 'موز', 'لیوان', 'آهو', 'مدرسه', 'دریا'];

const WH_SIMILAR_LETTER_PAIRS = {
    'کتاب': ['کباب', 'حساب', 'شتاب', 'سحاب'],
    'سیب': ['سیب', 'تیر', 'شیر', 'پیر'],
    'شیر': ['شیر', 'سیر', 'تیر', 'پیر'],
    'برگ': ['برگ', 'مرگ', 'بزرگ', 'بنگ'],
    'قفل': ['قفل', 'نقل', 'عقل', 'فقل'],
    'نور': ['نور', 'دور', 'زور', 'سور'],
    'میز': ['میز', 'ریز', 'نیز', 'خیز'],
    'توپ': ['توپ', 'توت', 'توب', 'نوپ'],
    'دفتر': ['دفتر', 'دفتری', 'دفتر', 'بستر'],
    'قاشق': ['قاشق', 'عاشق', 'فاشق', 'قشق'],
    'دریا': ['دریا', 'دنیا', 'درید', 'دری'],
    'ماهی': ['ماهی', 'مایه', 'مادی', 'ماهی'],
    'پنجره': ['پنجره', 'پنجر', 'پنجری', 'پنچره']
};

let wordhuntState = null;

function startWordhunt() {
    const key = currentGame;
    const isJunior = key === 'wordhunt_junior';
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;
    window._lastTimeSec = null;

    let isTargetFunc;
    let instructionText;

    if (isJunior) {
        if (cfg.type === 'fruit') {
            instructionText = 'فقط روی <strong>میوه‌ها</strong> کلیک کن! 🍎🍌<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            speak('فقط روی میوه ها کلیک کن. سریع باش!');
            isTargetFunc = (item) => WH_FRUITS.includes(item);
        } else if (cfg.type === 'animal') {
            instructionText = 'فقط روی <strong>حیوانات</strong> کلیک کن! 🐱🐶<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            speak('فقط روی حیوانات کلیک کن. سریع باش!');
            isTargetFunc = (item) => WH_ANIMALS_EMOJI.includes(item);
        } else if (cfg.type === 'redfruit') {
            instructionText = 'فقط روی میوه‌های <strong>قرمز</strong> کلیک کن! 🍎🍓🍒<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            speak('فقط روی میوه های قرمز کلیک کن. سریع باش!');
            isTargetFunc = (item) => WH_RED_FRUITS.includes(item);
        } else if (cfg.type === 'redfruit_similar') {
            instructionText = 'فقط روی میوه‌های <strong>قرمز</strong> کلیک کن!<br><span style="color:#d63031; font-size:13px;">⚠️ بعضی چیزهای دیگه هم قرمز یا نزدیک قرمزن! (هر اشتباه ۲ ثانیه جریمه داره)</span>';
            speak('فقط روی میوه های قرمز کلیک کن. مراقب باش!');
            isTargetFunc = (item) => WH_RED_FRUITS.includes(item);
        }
    } else {
        if (cfg.type === 'animal') {
            instructionText = 'فقط روی اسم <strong>حیوانات</strong> کلیک کن! 🐾<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            isTargetFunc = (w) => WH_ANIMALS_WORDS.includes(w);
        } else if (cfg.type === 'letter') {
            instructionText = 'فقط روی کلماتی کلیک کن که حرف <strong>«د»</strong> یا <strong>«ر»</strong> دارند!<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            isTargetFunc = (w) => w.includes('د') || w.includes('ر');
        } else if (cfg.type === 'dual') {
            instructionText = 'فقط روی اسم <strong>حیواناتی</strong> کلیک کن که حرف <strong>«ر»</strong> دارند!<br><span style="color:#0984e3; font-size:13px;">⏱️ هرچی سریع‌تر، امتیاز بیشتر!</span>';
            isTargetFunc = (w) => WH_ANIMALS_WORDS.includes(w) && w.includes('ر');
        } else if (cfg.type === 'similar_letter') {
            instructionText = 'فقط روی کلماتی کلیک کن که حرف <strong>«ر»</strong> دارند!<br><span style="color:#d63031; font-size:13px;">⚠️ بعضی کلمات شبیه هستن ولی «ر» ندارن! (هر اشتباه ۲ ثانیه جریمه داره)</span>';
            isTargetFunc = (w) => w.includes('ر');
        }
    }

    document.getElementById(prefix + '-instruction').innerHTML = instructionText;

    let arr;
    if (isJunior) {
        let pool = (cfg.type === 'redfruit_similar') ? WH_RED_SIMILAR_POOL : WH_JUNIOR_POOL;
        arr = [...pool].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);
        
        const cnt = arr.filter(isTargetFunc).length;
        if (cnt < 3) {
            const targets = (cfg.type === 'redfruit' || cfg.type === 'redfruit_similar') ? WH_RED_FRUITS :
                            cfg.type === 'animal' ? WH_ANIMALS_EMOJI : WH_FRUITS;
            for (let i = 0; i < 3 - cnt && i < targets.length; i++) arr[i] = targets[i];
            arr.sort(() => Math.random() - 0.5);
        }
    } else {
        if (cfg.type === 'similar_letter') {
            const similarPool = [];
            const targetWords = Object.keys(WH_SIMILAR_LETTER_PAIRS).filter(w => w.includes('ر'));
            const nonTargetWords = Object.keys(WH_SIMILAR_LETTER_PAIRS).filter(w => !w.includes('ر'));
            
            targetWords.forEach(w => similarPool.push(w));
            targetWords.forEach(w => {
                WH_SIMILAR_LETTER_PAIRS[w].forEach(v => { if (v !== w) similarPool.push(v); });
            });
            nonTargetWords.forEach(w => similarPool.push(w));
            
            arr = [...similarPool].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);

            const cnt = arr.filter(isTargetFunc).length;
            if (cnt < 3) {
                const extra = targetWords.filter(w => !arr.includes(w));
                for (let i = 0; i < 3 - cnt && i < extra.length; i++) arr[i] = extra[i];
                arr.sort(() => Math.random() - 0.5);
            }
        } else {
            arr = [...WH_ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);
            const cnt = arr.filter(isTargetFunc).length;
            if (cnt < 3) {
                const extra = WH_ALL_WORDS.filter(w => isTargetFunc(w) && !arr.includes(w));
                for (let i = 0; i < 3 - cnt && i < extra.length; i++) arr[i] = extra[i];
                arr.sort(() => Math.random() - 0.5);
            }
        }
    }

    wordhuntState = {
        key, isJunior, cfg, prefix,
        isTargetFunc,
        totalTargets: arr.filter(isTargetFunc).length,
        found: 0,
        wrongClicks: 0,
        startTime: Date.now(),
        elapsedSec: 0,
        timerId: null,
        active: true
    };

    const grid = document.getElementById(prefix + '-grid');
    grid.innerHTML = '';
    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'word-btn';
        btn.innerText = item;
        if (!isJunior) btn.classList.add('text-mode');
        btn.onclick = () => handleWordhuntClick(btn, item);
        grid.appendChild(btn);
    });

    document.getElementById(prefix + '-feedback').innerText = '';

    // نمایش کرنومتر
    const stopwatch = document.getElementById(prefix + '-stopwatch');
    if (stopwatch) stopwatch.style.display = 'inline-flex';
    updateWordhuntStopwatch();

    // شروع کرنومتر رو به جلو
    if (wordhuntState.timerId) clearInterval(wordhuntState.timerId);
    wordhuntState.timerId = gameInterval(() => {
        if (isPaused || !wordhuntState || !wordhuntState.active) return;
        
        wordhuntState.elapsedSec = (Date.now() - wordhuntState.startTime) / 1000;
        updateWordhuntStopwatch();
        
        // رسیدن به سقف زمانی
        if (wordhuntState.elapsedSec >= cfg.maxTimeSec) {
            endWordhunt(false);
        }
    }, 100);

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function updateWordhuntStopwatch() {
    if (!wordhuntState) return;
    const { prefix, cfg, elapsedSec, wrongClicks } = wordhuntState;
    
    const el = document.getElementById(prefix + '-stopwatch-time');
    const container = document.getElementById(prefix + '-stopwatch');
    if (!el || !container) return;
    
    // محاسبه‌ی زمان موثر (با جریمه‌ی کلیک‌های اشتباه)
    const effectiveTime = elapsedSec + (wrongClicks * 2);
    
    el.innerText = toFa(effectiveTime.toFixed(1));
    
    // رنگ‌بندی بر اساس زمان
    container.classList.remove('warning', 'danger');
    if (effectiveTime > cfg.targetTimeSec * 1.5) {
        container.classList.add('danger');
    } else if (effectiveTime > cfg.targetTimeSec) {
        container.classList.add('warning');
    }
}

function clearWordhuntTimer() {
    if (wordhuntState && wordhuntState.timerId) {
        clearGameInterval(wordhuntState.timerId);
        wordhuntState.timerId = null;
    }
}

function handleWordhuntClick(btn, item) {
    if (!wordhuntState || !wordhuntState.active || btn.disabled || isPaused) return;
    const { key, isJunior, cfg, prefix, isTargetFunc } = wordhuntState;

    if (isTargetFunc(item)) {
        playSound('correct');
        btn.classList.add('correct');
        wordhuntState.found++;
        const fb = document.getElementById(prefix + '-feedback');
        fb.style.color = '#27ae60';
        fb.innerText = `✅ درست! (${toFa(wordhuntState.found)} از ${toFa(wordhuntState.totalTargets)})`;

        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 300);

        if (wordhuntState.found === wordhuntState.totalTargets) {
            // پیدا کردن همه‌ی هدف‌ها → محاسبه‌ی امتیاز بر اساس سرعت
            endWordhunt(true);
            return;
        }
    } else {
        playSound('wrong');
        btn.classList.add('wrong');
        wordhuntState.wrongClicks++;
        const fb = document.getElementById(prefix + '-feedback');
        fb.style.color = '#d63031';
        fb.innerText = '❌ اشتباه بود! (۲ ثانیه جریمه)';
        
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 400);
        updateWordhuntStopwatch();

        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            clearWordhuntTimer();
            return;
        }
    }
}

function endWordhunt(completed) {
    if (!wordhuntState || !wordhuntState.active) return;
    wordhuntState.active = false;
    gameInProgress = false;
    clearWordhuntTimer();

    const { key, cfg, prefix, totalTargets, found, startTime, wrongClicks } = wordhuntState;
    
    // محاسبه‌ی زمان واقعی
    const elapsed = (Date.now() - startTime) / 1000;
    const effectiveTime = elapsed + (wrongClicks * 2);
    
    document.querySelectorAll('#' + prefix + '-grid .word-btn').forEach(b => b.disabled = true);
    
    let message;
    if (completed) {
        // محاسبه‌ی امتیاز بر اساس سرعت
        const speedRatio = Math.min(3, cfg.targetTimeSec / effectiveTime);
        currentGameScore = Math.round(cfg.points * speedRatio);
        
        // ذخیره‌ی زمان برای رکورد
        window._lastTimeSec = elapsed;
        
        const speedText = speedRatio >= 2.5 ? '🚀 خیلی سریع بودی!' 
                        : speedRatio >= 1.5 ? '⚡ سریع بودی!' 
                        : '✅ خوب بود!';
        message = `${speedText} زمان: ${toFa(elapsed.toFixed(1))} ثانیه`;
    } else {
        // زمان تموم شد - امتیاز جزئی
        currentGameScore = Math.round((found / totalTargets) * cfg.points * 0.3);
        message = `⏰ زمان تموم شد! ${toFa(found)} از ${toFa(totalTargets)} پیدا کردی.`;
    }
    
    updateGameScore();
    
    gameTimeout(() => {
        endSingleGame(GAME_META[key].name, message);
        wordhuntState = null;
    }, 1500);
}

GAME_STARTERS.wordhunt_junior = startWordhunt;
GAME_STARTERS.wordhunt_senior = startWordhunt;

GAME_PAUSE_HOOKS.wordhunt_junior = () => clearWordhuntTimer();
GAME_PAUSE_HOOKS.wordhunt_senior = () => clearWordhuntTimer();

GAME_RESUME_HOOKS.wordhunt_junior = () => {
    if (!wordhuntState || !wordhuntState.active) return;
    if (!wordhuntState.timerId) {
        // ادامه‌ی کرنومتر از زمان فعلی
        wordhuntState.startTime = Date.now() - (wordhuntState.elapsedSec * 1000);
        wordhuntState.timerId = gameInterval(() => {
            if (isPaused || !wordhuntState || !wordhuntState.active) return;
            wordhuntState.elapsedSec = (Date.now() - wordhuntState.startTime) / 1000;
            updateWordhuntStopwatch();
            if (wordhuntState.elapsedSec >= wordhuntState.cfg.maxTimeSec) {
                endWordhunt(false);
            }
        }, 100);
    }
};
GAME_RESUME_HOOKS.wordhunt_senior = GAME_RESUME_HOOKS.wordhunt_junior;