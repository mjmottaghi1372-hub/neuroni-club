// =====================================================
// NAVIGATION - منوی دسته‌بندی‌شده و مدیریت صفحات
// =====================================================

let isNavigatingBack = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    
    updateMascotVisibility();
    refreshIcons();
}

function handlePopState() {
    const activeScreen = document.querySelector('.screen.active')?.id || '';
    if (activeScreen === 'screen-menu') {
        history.pushState({ page: 'menu' }, '');
        return;
    }
    if (gameActive) {
        history.pushState({ page: 'game' }, '');
        requestExit();
    } else {
        isNavigatingBack = true;
        goToMenu();
        isNavigatingBack = false;
        history.pushState({ page: 'menu' }, '');
    }
}

function goToMenu() {
    window.isInDailyWorkout = false; 
    window.isInAssessment = false; 
    window.forceAssessmentLevel1 = false;
    
    closeModal();
    updateStreak();
    if (!isNavigatingBack) history.pushState({ page: 'menu' }, '');
    
    clearAllGameTimers();
    gameActive = false;
    gameInProgress = false;
    isPaused = false;
    
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('interference-overlay').style.display = 'none';
    
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    showScreen('screen-menu');
    updateMenuDisplay();
}

function updateMenuDisplay() {
    document.getElementById('menu-total-score').innerText = toFa(state.totalScore);

    const streakVal = document.getElementById('streak-value');
    if (streakVal) streakVal.innerText = toFa(state.streak || 0);

    const readfreeBtn = document.getElementById('readfree-btn');
    if (readfreeBtn) readfreeBtn.classList.toggle('active', state.readFreeMode);
    
    renderAssessmentCard();
    renderDailyWorkoutCard();
    renderLumosityGrid();
    refreshIcons();

    setTimeout(() => {
        if (pendingStreakMessage) {
            showMascotMessage(pendingStreakMessage, 4000);
            pendingStreakMessage = null;
        } else {
            showMascotMessage('یه بازی انتخاب کن! 🎮', 3000);
        }
    }, 500);
}

// ==========================================
// ساخت منوی لوموسیتی
// ==========================================
function renderLumosityGrid() {
    const container = document.getElementById('menu-games-grid');
    if (!container) return;
    container.innerHTML = '';

    const domainOrder = ['working_memory', 'attention', 'processing_speed', 'flexibility', 'problem_solving'];

    domainOrder.forEach(domainKey => {
        const domain = DOMAINS[domainKey];
        let gamesInDomain = GAME_KEYS.filter(k => GAME_META[k].domain === domainKey);
        
        // فیلتر کردن بازی‌های متنی اگر حالت بدون خواندن فعال است
        if (state.readFreeMode) {
            gamesInDomain = gamesInDomain.filter(k => !GAME_META[k].needsText);
        }
        
        if (gamesInDomain.length === 0) return;

        const section = document.createElement('div');
        section.className = 'domain-section';
        
        const header = document.createElement('div');
        header.className = 'domain-header';
        header.innerHTML = `
            <i data-lucide="${domain.icon}" style="color:${domain.color};"></i>
            <span>${domain.name}</span>
        `;
        section.appendChild(header);

        gamesInDomain.forEach(key => {
            const meta = GAME_META[key];
            const lvl = getLevel(key);
            const best = getBest(key);
            const maxCfg = GAME_CONFIGS[key][4];
            const isMaxed = lvl === 4 && best >= maxCfg.threshold;

            let recordHtml = '';
            if (meta.timeBased) {
                const bestTime = state.games[key].bestTime;
                recordHtml = bestTime 
                    ? `<span class="lumo-badge">⏱️ ${toFa(bestTime)}s</span>`
                    : `<span class="lumo-badge">⏱️ —</span>`;
            } else {
                recordHtml = `<span class="lumo-badge">🏆 ${toFa(best)}</span>`;
            }

            const card = document.createElement('button');
            card.className = 'game-card-lumo';
            card.style.setProperty('--domain-color', domain.color);
            card.style.setProperty('--domain-bg', domain.bgColor);
            
            card.innerHTML = `
                <div class="lumo-card-img">
                    <i data-lucide="${meta.icon}"></i>
                </div>
                <div class="lumo-card-info">
                    <div class="lumo-card-title">${meta.name}</div>
                    <div class="lumo-card-desc">${meta.desc}</div>
                    <div class="lumo-card-badges">
                        <span class="lumo-badge ${isMaxed ? 'maxed' : ''}">
                            ${isMaxed ? '⭐ استاد' : 'سطح ' + toFa(lvl)}
                        </span>
                        ${recordHtml}
                    </div>
                </div>
            `;
            card.onclick = () => { playSound('click'); startGame(key); };
            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

// ==========================================
// بخش استریک
// ==========================================
function showStreakInfo() {
    const streak = state.streak || 0;
    const msg = streak >= 7
        ? `🔥 عالیه! ${toFa(streak)} روز پشت سرهم داری بازی می‌کنی!`
        : streak >= 3
        ? `🔥 خوب داری پیش می‌ری! ${toFa(streak)} روز پشت سرهم.`
        : streak >= 1
        ? `🔥 امروز ${toFa(streak)} روزه که اومدی!`
        : 'هنوز استریک نداری. اولین بازی امروز رو شروع کن!';
    showModal('🔥 استریک روزانه', msg + '<br><br>هر روز بازی کنی، استریکت بیشتر می‌شه!',
        [{ text: 'فهمیدم', class: 'primary', action: closeModal }]);
}

// ==========================================
// آلبوم نشان‌ها
// ==========================================
function showAlbum() {
    history.pushState({ page: 'album' }, '');
    showScreen('screen-album');
    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';
    let earnedCount = 0;
    const total = GAME_KEYS.length * 4;

    GAME_KEYS.forEach(key => {
        const meta = GAME_META[key];
        const domain = DOMAINS[meta.domain];
        const header = document.createElement('div');
        header.style.cssText = `grid-column:1/-1; text-align:right; font-weight:700; font-size:14px; color:${domain.color}; margin-top:10px; margin-bottom:4px; border-bottom:2px solid ${domain.bgColor}; padding-bottom:4px; display:flex; align-items:center; gap:6px;`;
        header.innerHTML = `<i data-lucide="${meta.icon}" style="color:${domain.color};"></i><span>${meta.name}</span>`;
        grid.appendChild(header);

        for (let lvl = 1; lvl <= 4; lvl++) {
            const earned = hasBadge(key, lvl);
            if (earned) earnedCount++;
            const cell = document.createElement('div');
            cell.className = 'album-cell';
            cell.innerHTML = `
                <div class="album-badge ${earned ? 'earned' : 'locked'}">${earned ? LEVEL_MEDALS[lvl] : '❓'}</div>
                <div class="album-label">سطح ${toFa(lvl)}</div>
            `;
            grid.appendChild(cell);
        }
    });
    document.getElementById('album-count').innerText = `${toFa(earnedCount)} از ${toFa(total)}`;
    refreshIcons();
}

// ==========================================
// گزارش والدی
// ==========================================
function requestParentReport() {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const correct = a * b;

    document.getElementById('modal-title').innerText = '👨‍👩‍👧 گزارش والدی';
    document.getElementById('modal-title').classList.remove('win-modal-title');
    document.getElementById('modal-text').innerHTML =
        `برای ورود، حاصل ضرب زیر را وارد کنید:<br><br>` +
        `<strong style="font-size:28px; color:#0984e3;">${toFa(a)} × ${toFa(b)} = ?</strong>`;

    const container = document.getElementById('modal-buttons');
    container.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text'; input.inputMode = 'numeric'; input.placeholder = 'جواب';
    input.style.cssText = 'padding:12px; font-size:22px; text-align:center; border:2px solid #b2bec3; border-radius:8px; width:100%; font-family:inherit; margin-bottom:10px;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'modal-btn primary';
    submitBtn.innerText = 'ورود به گزارش';
    submitBtn.onclick = () => {
        const ans = parseInt(fromFa(input.value), 10);
        if (ans === correct) { closeModal(); showParentReport(); }
        else { input.style.borderColor = '#d63031'; input.value = ''; input.focus(); }
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn secondary';
    cancelBtn.innerText = 'انصراف';
    cancelBtn.onclick = closeModal;

    container.appendChild(input);
    container.appendChild(submitBtn);
    container.appendChild(cancelBtn);
    document.getElementById('custom-modal').style.display = 'flex';
    setTimeout(() => input.focus(), 100);
}

function showParentReport() {
    history.pushState({ page: 'parent' }, '');
    showScreen('screen-parent-report');
    const report = document.getElementById('parent-report-content');

    const badgeCount = countBadges();
    const today = new Date().toISOString().slice(0, 10);
    const playSeconds = state.dailyPlayDate === today ? (state.dailyPlaySeconds || 0) : 0;
    const playMin = Math.floor(playSeconds / 60);
    const playSec = playSeconds % 60;

    let html = `
        <div class="report-stat"><span>⏰ زمان بازی امروز:</span><strong>${toFa(playMin)} دقیقه و ${toFa(playSec)} ثانیه</strong></div>
        <div class="report-stat"><span>🔥 روزهای پشت سرهم:</span><strong>${toFa(state.streak || 0)} روز</strong></div>
        <div class="report-stat"><span>⭐ امتیاز کل:</span><strong>${toFa(state.totalScore)}</strong></div>
        <div class="report-stat"><span>🏆 نشان‌ها:</span><strong>${toFa(badgeCount)} از ${toFa(GAME_KEYS.length * 4)}</strong></div>
        <h3 style="margin-top:20px; color:#0984e3;">پیشرفت هر بازی:</h3>
    `;

    GAME_KEYS.forEach(key => {
        const meta = GAME_META[key];
        const domain = DOMAINS[meta.domain];
        const lvl = getLevel(key);
        const best = getBest(key);
        const badges = [1,2,3,4].filter(l => hasBadge(key, l)).length;
        html += `
            <div class="report-game">
                <div style="font-weight:700; display:flex; align-items:center; gap:6px; color:${domain.color};">
                    <i data-lucide="${meta.icon}"></i>
                    <span>${meta.name}</span>
                </div>
                <div style="font-size:13px; color:#636e72;">سطح ${toFa(lvl)} | بهترین: ${toFa(best)} | نشان: ${toFa(badges)}/۴</div>
            </div>
        `;
    });

    report.innerHTML = html;
    refreshIcons();
}

// ==========================================
// DAILY WORKOUT
// ==========================================
function renderDailyWorkoutCard() {
    const card = document.getElementById('daily-workout-card');
    const preview = document.getElementById('dw-games-preview');
    const desc = document.getElementById('dw-desc');
    const btn = document.getElementById('dw-start-btn');
    if (!card) return;

    const today = new Date().toISOString().slice(0, 10);
    let dw = state.dailyWorkout;

    if (!dw || dw.date !== today) {
        const selected = generateSmartWorkout();
        state.dailyWorkout = {
            date: today,
            games: selected,
            completed: []
        };
        saveState();
        dw = state.dailyWorkout;
    }

    card.style.display = 'block';
    preview.innerHTML = '';
    
    const allCompleted = dw.completed.length === dw.games.length;
    
    if (allCompleted) {
        card.classList.add('finished');
        desc.innerText = 'آفرین! تمرین امروز رو با موفقیت تموم کردی. 🎉';
        btn.innerText = 'تمرین امروز انجام شد ✓';
        btn.disabled = true;
    } else {
        card.classList.remove('finished');
        desc.innerText = '۳ بازی برای تقویت مغزت آماده‌ست!';
        btn.innerText = 'شروع تمرین 🚀';
        btn.disabled = false;
    }

    dw.games.forEach((gameKey, index) => {
        const meta = GAME_META[gameKey];
        const isCompleted = dw.completed.includes(index);
        
        const div = document.createElement('div');
        div.className = `dw-game-icon ${isCompleted ? 'completed' : ''}`;
        div.innerHTML = `<i data-lucide="${meta.icon}"></i>`;
        preview.appendChild(div);
    });
}

function generateSmartWorkout() {
    let selected = [];
    let usedDomains = new Set();

    // فیلتر کردن بازی‌ها بر اساس حالت بدون خواندن
    let validGames = GAME_KEYS.filter(key => {
        if (state.readFreeMode && GAME_META[key].needsText) return false;
        return true;
    });

    let candidates = validGames.map(key => {
        const lvl = getLevel(key);
        const domain = GAME_META[key].domain;
        let priority = (4 - lvl) * 10 + Math.random() * 5;
        return { key, domain, priority };
    });

    candidates.sort((a, b) => b.priority - a.priority);

    for (let c of candidates) {
        if (selected.length >= 3) break;
        if (!usedDomains.has(c.domain)) {
            selected.push(c.key);
            usedDomains.add(c.domain);
        }
    }

    return selected;
}

function startDailyWorkout() {
    playSound('click');
    const dw = state.dailyWorkout;
    if (!dw || dw.completed.length >= dw.games.length) return;

    const nextIndex = dw.games.findIndex((_, i) => !dw.completed.includes(i));
    if (nextIndex === -1) return;

    window.isInDailyWorkout = true;
    window.isInAssessment = false;
    
    startGame(dw.games[nextIndex]);
}

// ==========================================
// STATS DASHBOARD
// ==========================================
function showStats() {
    history.pushState({ page: 'stats' }, '');
    showScreen('screen-stats');
    renderStatsPage();
}

function renderStatsPage() {
    document.getElementById('stats-bpi').innerText = toFa(state.totalScore);
    document.getElementById('stats-streak').innerText = toFa(state.streak || 0);
    
    let badgeCount = countBadges();
    document.getElementById('stats-badges').innerText = toFa(badgeCount);

    const domainContainer = document.getElementById('stats-domains');
    domainContainer.innerHTML = '';

    for (const domainKey in DOMAINS) {
        const domain = DOMAINS[domainKey];
        const gamesInDomain = GAME_KEYS.filter(k => GAME_META[k].domain === domainKey);
        
        let totalLvlProgress = 0;
        gamesInDomain.forEach(k => {
            totalLvlProgress += (getLevel(k) - 1);
        });
        
        const maxPossibleLvl = gamesInDomain.length * 3;
        const percent = maxPossibleLvl > 0 ? (totalLvlProgress / maxPossibleLvl) * 100 : 0;

        const row = document.createElement('div');
        row.className = 'domain-row';
        row.innerHTML = `
            <div class="domain-name" style="color:${domain.color};">
                <i data-lucide="${domain.icon}"></i>
                <span>${domain.name}</span>
            </div>
            <div class="domain-bar-bg">
                <div class="domain-bar-fill" style="background:${domain.color}; width:0%;" data-target="${percent}%"></div>
            </div>
        `;
        domainContainer.appendChild(row);
    }

    setTimeout(() => {
        document.querySelectorAll('.domain-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target;
        });
    }, 100);

    renderActivityChart();
    refreshIcons();
}

function renderActivityChart() {
    const container = document.getElementById('stats-activity');
    container.innerHTML = '';

    const days = [];
    const dayNames = ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayIndex = d.getDay();
        days.push({
            dateStr,
            label: dayNames[dayIndex],
            count: 0
        });
    }

    if (state.gameHistory) {
        state.gameHistory.forEach(entry => {
            if (!entry.date) return;
            const entryDate = new Date(entry.date).toISOString().slice(0, 10);
            const dayMatch = days.find(d => d.dateStr === entryDate);
            if (dayMatch) dayMatch.count++;
        });
    }

    const maxCount = Math.max(...days.map(d => d.count), 1);

    days.forEach(day => {
        const heightPercent = (day.count / maxCount) * 100;
        
        const dayEl = document.createElement('div');
        dayEl.className = 'activity-day';
        dayEl.innerHTML = `
            <div class="activity-count">${day.count > 0 ? toFa(day.count) : ''}</div>
            <div class="activity-bar-wrap">
                <div class="activity-bar" style="height:0%;" data-target="${heightPercent}%"></div>
            </div>
            <div class="activity-label">${day.label}</div>
        `;
        container.appendChild(dayEl);
    });

    setTimeout(() => {
        document.querySelectorAll('.activity-bar').forEach(bar => {
            bar.style.height = bar.dataset.target;
        });
    }, 100);
}

// ==========================================
// ASSESSMENT (ارزیابی اولیه)
// ==========================================
function renderAssessmentCard() {
    const card = document.getElementById('assessment-card');
    if (!card) return;
    
    if (state.assessmentCompleted) {
        card.style.background = 'linear-gradient(135deg, #00b894, #27ae60)';
        card.querySelector('.as-btn').innerText = 'مشاهده پروفایل';
        card.querySelector('.as-btn').onclick = () => { showAssessmentResult(); };
        card.querySelector('p').innerText = 'ارزیابی شما با موفقیت انجام شد.';
    } else {
        card.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
        card.querySelector('.as-btn').innerText = 'شروع ارزیابی';
        card.querySelector('.as-btn').onclick = () => { startAssessment(); };
        card.querySelector('p').innerText = 'سطح توانایی‌های شناختی خودت رو بسنج!';
    }
    card.style.display = 'flex';
}

function startAssessment() {
    if (state.assessmentCompleted) {
        showAssessmentResult();
        return;
    }
    
    playSound('click');
    window.isInAssessment = true;
    window.isInDailyWorkout = false;
    
    // انتخاب دقیقاً ۱ بازی از هر ۵ دامنه (با در نظر گرفتن حالت بدون خواندن)
    const availableDomains = Object.keys(DOMAINS);
    const assessmentGames = [];
    const selectedDomains = [];
    
    availableDomains.forEach(domain => {
        let domainGames = GAME_KEYS.filter(k => GAME_META[k].domain === domain);
        if (state.readFreeMode) {
            domainGames = domainGames.filter(k => !GAME_META[k].needsText);
        }
        
        if (domainGames.length > 0) {
            // اولویت با بازی‌هایی که سطح پایین‌تری دارند
            domainGames.sort((a, b) => getLevel(a) - getLevel(b));
            assessmentGames.push(domainGames[0]);
            selectedDomains.push(domain);
        }
    });
    
    // ریست پروفایل
    state.cognitiveProfile = { 
        working_memory: null, attention: null, 
        processing_speed: null, flexibility: null, 
        problem_solving: null 
    };
    
    state.assessmentDomains = selectedDomains;
    state.currentAssessmentQueue = assessmentGames;
    state.currentAssessmentIndex = 0;
    
    // ذخیره‌ی سطح‌های اصلی و اجبار به سطح ۱
    state._savedLevelsForAssessment = {};
    assessmentGames.forEach(key => {
        state._savedLevelsForAssessment[key] = state.games[key].level;
        state.games[key].level = 1;
    });
    
    window.forceAssessmentLevel1 = true;
    
    startGame(assessmentGames[0]);
}

function showAssessmentResult() {
    history.pushState({ page: 'assessment' }, '');
    showScreen('screen-assessment-result');
    
    const container = document.getElementById('assessment-profile-bars');
    container.innerHTML = '';
    
    const profile = state.cognitiveProfile || {};
    const testedDomains = state.assessmentDomains || Object.keys(DOMAINS);
    
    // هدر توضیحی
    const header = document.createElement('p');
    header.style.cssText = 'text-align:center; color:#636e72; font-size:13px; margin-bottom:15px;';
    header.innerText = `این ارزیابی بر اساس ${toFa(testedDomains.length)} دامنه انجام شده است.`;
    container.appendChild(header);
    
        // فقط دامنه‌های تست‌شده
    testedDomains.forEach(domainKey => {
        const domain = DOMAINS[domainKey];
        if (!domain) return;
        let percent = profile[domainKey] || 0; // از قبل درصد است
        
        const row = document.createElement('div');
        row.className = 'domain-row';
        row.innerHTML = `
            <div class="domain-name" style="color:${domain.color};">
                <i data-lucide="${domain.icon}"></i>
                <span>${domain.name}</span>
            </div>
            <div class="domain-bar-bg">
                <div class="domain-bar-fill" style="background:${domain.color}; width:0%;" data-target="${percent}%"></div>
            </div>
            <div style="font-size:13px; color:${domain.color}; min-width:40px; text-align:left; font-weight:800;">
                ${toFa(Math.round(percent))}٪
            </div>
        `;
        container.appendChild(row);
    });
    
    setTimeout(() => {
        document.querySelectorAll('.domain-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target;
        });
    }, 100);
    
    refreshIcons();
}