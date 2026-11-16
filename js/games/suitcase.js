// =====================================================
// GAME: SUITCASE (چمدان سفر - تجسم فضایی)
// =====================================================

const SCS_ITEMS = ['🧴', '🥣', '👓', '📼', '📜', '👕', '👟', '☕', '🔑'];
let suitcaseState = null;

function startSuitcase() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    suitcaseState = {
        key, lvl, cfg, prefix,
        currentRound: 1,
        maxRounds: cfg.rounds,
        active: true,
        phase: 'answering',
        timerId: null,
        timeLeft: cfg.timeLimit,
        direction: 'h'
    };

    document.getElementById(prefix + '-feedback').innerText = '';
    showScreen(GAME_META[key].screen);
    updateGameScore();
    setupSuitcaseRound();
}

function setupSuitcaseRound() {
    if (!suitcaseState) return;
    const { cfg, prefix } = suitcaseState;

    if (cfg.dir === 'random') {
        suitcaseState.direction = Math.random() > 0.5 ? 'h' : 'v';
    } else {
        suitcaseState.direction = cfg.dir;
    }

    const gridData = generateSuitcaseGrid(cfg, suitcaseState.direction);

    suitcaseState.grid = gridData;
    suitcaseState.phase = 'answering';
    suitcaseState.timeLeft = cfg.timeLimit;

    let dirText = suitcaseState.direction === 'h' ? 'از وسط افقی (بالا روی پایین)' : 'از وسط عمودی (راست روی چپ)';
    let instr = `راند ${toFa(suitcaseState.currentRound)} از ${toFa(suitcaseState.maxRounds)} - چمدان ${dirText} تا می‌شود.`;
    
    if (cfg.timeLimit > 0) {
        instr += `<br><span style="color:#d63031; font-size:13px;">⏱️ زمان: <span id="${prefix}-timer-text">${toFa(cfg.timeLimit)}</span> ثانیه</span>`;
    }
    document.getElementById(prefix + '-instruction').innerHTML = instr;

    renderSuitcaseGrid();
    startSuitcaseTimer();
}

function startSuitcaseTimer() {
    const { cfg, prefix } = suitcaseState;
    if (suitcaseState.timerId) clearInterval(suitcaseState.timerId);
    
    if (cfg.timeLimit > 0) {
        suitcaseState.timerId = gameInterval(() => {
            if (isPaused || !suitcaseState || !suitcaseState.active || suitcaseState.phase !== 'answering') return;
            
            suitcaseState.timeLeft--;
            const timerEl = document.getElementById(prefix + '-timer-text');
            if (timerEl) timerEl.innerText = toFa(suitcaseState.timeLeft);

            if (suitcaseState.timeLeft <= 0) {
                clearInterval(suitcaseState.timerId);
                handleSuitcaseTimeout();
            }
        }, 1000);
    }
}

function generateSuitcaseGrid(cfg, dir) {
    const { cols, rows, maxEmpty } = cfg;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    
    const shuffledItems = [...SCS_ITEMS].sort(() => Math.random() - 0.5);
    let itemIndex = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c] = shuffledItems[itemIndex % shuffledItems.length];
            itemIndex++;
        }
    }

    const isH = dir === 'h';
    const activeRows = isH ? rows / 2 : rows;
    const activeCols = isH ? cols : cols / 2;

    let validR, validC;
    do {
        validR = Math.floor(Math.random() * activeRows);
        validC = Math.floor(Math.random() * activeCols);
    } while (grid[validR][validC] === null);

    grid[validR][validC] = null;
    const validMR = isH ? rows - 1 - validR : validR;
    const validMC = isH ? validC : cols - 1 - validC;
    grid[validMR][validMC] = null;

    let trapsNeeded = maxEmpty - 1;
    let attempts = 0;

    while (trapsNeeded > 0 && attempts < 100) {
        let r = Math.floor(Math.random() * activeRows);
        let c = Math.floor(Math.random() * activeCols);
        
        if (grid[r][c] !== null) {
            const mr = isH ? rows - 1 - r : r;
            const mc = isH ? c : cols - 1 - c;
            
            grid[r][c] = null; 
            if (grid[mr][mc] === null) {
                grid[mr][mc] = shuffledItems[Math.floor(Math.random() * shuffledItems.length)];
            }
            trapsNeeded--;
        }
        attempts++;
    }

    return grid;
}

function renderSuitcaseGrid() {
    if (!suitcaseState) return;
    const { grid, cfg, prefix, direction } = suitcaseState;
    
    const container = document.querySelector('.suitcase-container');
    if(!container) return;
    
    container.className = `suitcase-container ${direction === 'h' ? 'horizontal' : 'vertical'}`;
    
    // نام کلاس‌ها برای هماهنگی با CSS جدید
    if (direction === 'h') {
        container.innerHTML = `
            <div id="${prefix}-grid-a" class="suitcase-half suitcase-a"></div>
            <div class="suitcase-fold-line"></div>
            <div id="${prefix}-grid-b" class="suitcase-half suitcase-b"></div>
        `;
    } else {
        container.innerHTML = `
            <div id="${prefix}-grid-a" class="suitcase-half suitcase-a"></div>
            <div class="suitcase-fold-line"></div>
            <div id="${prefix}-grid-b" class="suitcase-half suitcase-b"></div>
        `;
    }

    const halfA = document.getElementById(prefix + '-grid-a');
    const halfB = document.getElementById(prefix + '-grid-b');
    
    const cols = direction === 'h' ? cfg.cols : cfg.cols / 2;
    halfA.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    halfB.style.gridTemplateColumns = `repeat(${cols}, 50px)`;

    for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
            const isHalfA = direction === 'h' ? (r < cfg.rows / 2) : (c >= cfg.cols / 2);
            // در حالت RTL، ستون‌های سمت راست نیمه A هستند
            const targetHalf = isHalfA ? halfA : halfB;

            const cell = document.createElement('div');
            cell.className = 'suitcase-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            const item = grid[r][c];
            if (item) {
                cell.innerText = item;
                cell.classList.add('occupied');
            } else {
                if (isHalfA) {
                    cell.onclick = () => handleSuitcaseClick(r, c, cell);
                }
            }
            targetHalf.appendChild(cell);
        }
    }
}

function handleSuitcaseClick(r, c, cell) {
    if (!suitcaseState || !suitcaseState.active || isPaused || suitcaseState.phase !== 'answering') return;
    
    const { cfg, grid, prefix, direction } = suitcaseState;
    
    let mirrorR = r, mirrorC = c;
    if (direction === 'h') mirrorR = (cfg.rows - 1) - r;
    if (direction === 'v') mirrorC = (cfg.cols - 1) - c;

    const mirrorItem = grid[mirrorR][mirrorC];
    const fb = document.getElementById(prefix + '-feedback');
    const halfAEl = document.getElementById(prefix + '-grid-a');

    suitcaseState.phase = 'checking';
    if (suitcaseState.timerId) clearInterval(suitcaseState.timerId);
    
    cell.innerText = '📷';
    document.querySelectorAll(`#${prefix}-grid-a .suitcase-cell`).forEach(el => el.onclick = null);

    halfAEl.classList.add('folding');

    gameTimeout(() => {
        if (mirrorItem === null) {
            playSound('correct');
            currentGameScore += 10;
            updateGameScore();
            
            cell.classList.add('correct');
            fb.style.color = '#27ae60';
            fb.innerText = '✅ آفرین! چمدان بسته شد.';
            
            gameTimeout(() => {
                if (suitcaseState.currentRound >= suitcaseState.maxRounds) {
                    suitcaseState.active = false;
                    gameInProgress = false;
                    endSingleGame(GAME_META[suitcaseState.key].name, 'تجسم فضایی فوق‌العاده‌ای داری!');
                } else {
                    suitcaseState.currentRound++;
                    setupSuitcaseRound();
                }
            }, 1200);

        } else {
            playSound('wrong');
            currentGameScore = Math.max(0, currentGameScore - 5);
            updateGameScore();
            
            const mirrorCell = document.querySelector(`#${prefix}-grid-b .suitcase-cell[data-r="${mirrorR}"][data-c="${mirrorC}"]`);
            if (mirrorCell) {
                mirrorCell.classList.add('wrong');
                mirrorCell.style.zIndex = '20';
            }
            
            fb.style.color = '#d63031';
            fb.innerText = '❌ تداخل! دوربین روی وسیله دیگری افتاد.';
            
            if (registerWrong()) return;

            gameTimeout(() => {
                if (!suitcaseState) return;
                halfAEl.classList.remove('folding');
                cell.classList.remove('wrong');
                cell.innerText = '';
                if (mirrorCell) {
                    mirrorCell.classList.remove('wrong');
                    mirrorCell.style.zIndex = '';
                }
                
                gameTimeout(() => {
                    if (!suitcaseState) return;
                    suitcaseState.phase = 'answering';
                    fb.innerText = '';
                    renderSuitcaseGrid();
                    startSuitcaseTimer();
                }, 300);

            }, 1500); 
        }
    }, 800); 
}

function handleSuitcaseTimeout() {
    if (!suitcaseState || suitcaseState.phase !== 'answering') return;
    
    const { prefix } = suitcaseState;
    const fb = document.getElementById(prefix + '-feedback');
    
    playSound('wrong');
    fb.style.color = '#d63031';
    fb.innerText = '⏰ زمان تموم شد!';
    
    if (registerWrong()) return;

    gameTimeout(() => {
        if (!suitcaseState) return;
        suitcaseState.phase = 'answering';
        fb.innerText = '';
        renderSuitcaseGrid(); 
        startSuitcaseTimer();
    }, 1500);
}

GAME_STARTERS.suitcase = startSuitcase;
GAME_PAUSE_HOOKS.suitcase = () => {
    if (suitcaseState && suitcaseState.timerId) clearInterval(suitcaseState.timerId);
};
GAME_RESUME_HOOKS.suitcase = () => {
    if (suitcaseState && suitcaseState.active && suitcaseState.phase === 'answering') {
        startSuitcaseTimer();
    }
};