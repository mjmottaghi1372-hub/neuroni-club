// =====================================================
// TUTORIAL - آموزش تعاملی (بصری، قدم‌به‌قدم)
// =====================================================

// ============ Helpers ============
function runTutSteps(container, steps, onComplete) {
    let currentStep = 0;
    function render() {
        if (currentStep >= steps.length) { onComplete(); return; }
        const step = steps[currentStep];
        container.innerHTML = '';

        if (steps.length > 1) {
            const prog = document.createElement('div');
            prog.className = 'tut-progress';
            prog.innerText = `مرحله ${toFa(currentStep + 1)} از ${toFa(steps.length)}`;
            container.appendChild(prog);
        }

        if (step.guide) {
            const g = document.createElement('div');
            g.className = 'tut-guide-bubble';
            g.innerHTML = `🦉 ${step.guide}`;
            container.appendChild(g);
        }

        if (step.show) {
            const s = document.createElement('div');
            s.className = 'tut-show-big';
            s.innerHTML = step.show;
            container.appendChild(s);
        }

        const opts = document.createElement('div');
        opts.className = 'tut-demo-grid';
        opts.style.gridTemplateColumns = `repeat(${Math.min(step.options.length, 4)}, 1fr)`;
        container.appendChild(opts);

        const fb = document.createElement('div');
        fb.className = 'tut-feedback';
        container.appendChild(fb);

        step.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'tut-demo-item';
            btn.innerHTML = opt.label;
            if (opt.correct) btn.classList.add('tut-hint-pulse');
            if (opt.bg) { btn.style.background = opt.bg; btn.style.color = 'white'; }
            if (opt.fontSize) btn.style.fontSize = opt.fontSize;
            btn.onclick = () => {
                if (opt.correct) {
                    playSound('correct');
                    btn.classList.remove('tut-hint-pulse');
                    btn.classList.add('correct');
                    fb.style.color = '#27ae60';
                    fb.innerText = opt.feedback || '✅ آفرین!';
                    setTimeout(() => { currentStep++; render(); }, 600);
                } else {
                    playSound('wrong');
                    btn.classList.add('wrong');
                    fb.style.color = '#d63031';
                    fb.innerText = '❌ دوباره تلاش کن!';
                    setTimeout(() => btn.classList.remove('wrong'), 500);
                }
            };
            opts.appendChild(btn);
        });
    }
    render();
}

function runTutHunt(container, opts) {
    let topHtml = `<div class="tut-guide-bubble">🦉 ${opts.guide}</div>`;
    if (opts.targetHtml) topHtml += `<div class="tut-show-big">${opts.targetHtml}</div>`;
    container.innerHTML = `
        ${topHtml}
        <div class="tut-demo-grid" style="grid-template-columns: repeat(${opts.cols || 3}, 1fr);"></div>
        <div class="tut-feedback"></div>
    `;
    const grid = container.querySelector('.tut-demo-grid');
    const fb = container.querySelector('.tut-feedback');
    const totalTargets = opts.items.filter(i => i.target).length;
    let found = 0;

    opts.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'tut-demo-item';
        btn.innerHTML = item.label;
        if (item.target) btn.classList.add('tut-hint-pulse');
        if (opts.itemFontSize) btn.style.fontSize = opts.itemFontSize;
        btn.onclick = () => {
            if (btn.disabled) return;
            if (item.target) {
                playSound('correct');
                btn.classList.remove('tut-hint-pulse');
                btn.classList.add('correct');
                btn.disabled = true;
                found++;
                fb.style.color = '#27ae60';
                fb.innerText = `✅ آفرین! (${toFa(found)} از ${toFa(totalTargets)})`;
                if (found >= totalTargets) setTimeout(() => opts.onComplete(), 700);
            } else {
                playSound('wrong');
                btn.classList.add('wrong');
                fb.style.color = '#d63031';
                fb.innerText = '❌ این هدف نبود!';
                setTimeout(() => btn.classList.remove('wrong'), 500);
            }
        };
        grid.appendChild(btn);
    });
}

// ============ TUTORIALS ============
const TUTORIALS = {
    // ====== استروپ روز/شب ======
    stroop_junior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutSteps(container, [
                {
                    guide: 'خورشید می‌بینی؟ باید بگی «شب»!',
                    show: '☀️',
                    options: [
                        { label: 'روز', correct: false },
                        { label: 'شب 🌙', correct: true, feedback: '✅ آفرین! خورشید یعنی بگو شب!' }
                    ]
                },
                {
                    guide: 'حالا ماه! این بار بگو «روز»!',
                    show: '🌙',
                    options: [
                        { label: 'روز ☀️', correct: true, feedback: '✅ عالیه! ماه یعنی بگو روز!' },
                        { label: 'شب', correct: false }
                    ]
                }
            ], onCorrect);
        }
    },

    // ====== استروپ رنگ/کلمه ======
    stroop_senior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutSteps(container, [
                {
                    guide: 'رنگ جوهرِ کلمه رو بزن، نه اسمش رو!',
                    show: '<span style="color:#e74c3c; font-weight:900;">آبی</span>',
                    options: [
                        { label: 'قرمز', correct: true, bg: '#e74c3c', feedback: '✅ آفرین! رنگ جوهر قرمزه!' },
                        { label: 'آبی', correct: false, bg: '#3498db' },
                        { label: 'سبز', correct: false, bg: '#27ae60' },
                        { label: 'نارنجی', correct: false, bg: '#e67e22' }
                    ]
                }
            ], onCorrect);
        }
    },

    // ====== شکار حیوانات ======
    numhunt_junior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutHunt(container, {
                guide: 'این ۲ تا گربه رو پیدا کن و بزن! 🐱',
                items: [
                    { label: '🐱', target: true },
                    { label: '🚗', target: false },
                    { label: '🐱', target: true },
                    { label: '🌻', target: false },
                    { label: '⚽', target: false }
                ],
                cols: 3, itemFontSize: '40px',
                onComplete: onCorrect
            });
        }
    },

    // ====== شکار اعداد ======
    numhunt_senior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutHunt(container, {
                guide: 'این ۲ تا عدد ۷ رو پیدا کن و بزن!',
                items: [
                    { label: '۴', target: false },
                    { label: '۷', target: true },
                    { label: '۲', target: false },
                    { label: '۷', target: true },
                    { label: '۹', target: false },
                    { label: '۳', target: false }
                ],
                cols: 3, itemFontSize: '32px',
                onComplete: onCorrect
            });
        }
    },

    // ====== شکار میوه‌ها ======
    wordhunt_junior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutHunt(container, {
                guide: 'فقط میوه‌ها رو بزن! 🍎🍌',
                items: [
                    { label: '🍎', target: true },
                    { label: '🚗', target: false },
                    { label: '🍌', target: true },
                    { label: '🌻', target: false }
                ],
                cols: 4, itemFontSize: '40px',
                onComplete: onCorrect
            });
        }
    },

    // ====== شکار کلمات ======
    wordhunt_senior: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutHunt(container, {
                guide: 'فقط اسم حیوان‌ها رو بزن! 🐾',
                items: [
                    { label: 'گربه', target: true },
                    { label: 'کتاب', target: false },
                    { label: 'شیر', target: true },
                    { label: 'میز', target: false }
                ],
                cols: 2, itemFontSize: '20px',
                onComplete: onCorrect
            });
        }
    },

    // ====== شکل‌های مخفی ======
    shapehunt: {
        rules: [],
        demo: (container, onCorrect) => {
            const target = { type: 'circle', color: '#e74c3c' };
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 فقط روی این شکل بزن:</div>
                <div class="tut-show-big">${getShapeSVG(target)}</div>
                <div class="tut-demo-grid" style="grid-template-columns: repeat(4, 1fr);"></div>
                <div class="tut-feedback"></div>
            `;
            const grid = container.querySelector('.tut-demo-grid');
            const fb = container.querySelector('.tut-feedback');
            let solved = false;

            [
                { svg: getShapeSVG(target), correct: true },
                { svg: getShapeSVG({ type: 'circle', color: '#3498db' }), correct: false },
                { svg: getShapeSVG({ type: 'square', color: '#e74c3c' }), correct: false },
                { svg: getShapeSVG({ type: 'circle', color: '#e74c3c' }), correct: true }
            ].forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerHTML = item.svg;
                if (item.correct) btn.classList.add('tut-hint-pulse');
                btn.onclick = () => {
                    if (solved) return;
                    if (item.correct) {
                        solved = true;
                        playSound('correct');
                        btn.classList.remove('tut-hint-pulse');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => { b.disabled = true; if (b !== btn) b.style.opacity = '0.4'; });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین!';
                        setTimeout(onCorrect, 700);
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ این شکل درست نیست!';
                        setTimeout(() => btn.classList.remove('wrong'), 500);
                    }
                };
                grid.appendChild(btn);
            });
        }
    },

    // ====== حافظه فوق‌العاده ======
    memory: {
        rules: [],
        demo: (container, onCorrect) => {
            const visuals = ['👓', '🎩'];
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 این تصاویر رو حفظ کن!</div>
                <div class="tut-show-big">${visuals.join('  ')}</div>
                <div class="tut-feedback">👀 خوب نگاه کن...</div>
            `;
            setTimeout(() => {
                container.innerHTML = `
                    <div class="tut-guide-bubble">🦉 کدوم یکی رو دیدی؟</div>
                    <div class="tut-demo-grid" style="grid-template-columns: repeat(2, 1fr);"></div>
                    <div class="tut-feedback"></div>
                `;
                const grid = container.querySelector('.tut-demo-grid');
                const fb = container.querySelector('.tut-feedback');
                [
                    { label: '👓', correct: true },
                    { label: '🍕', correct: false }
                ].forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'tut-demo-item';
                    btn.innerText = opt.label;
                    btn.style.fontSize = '48px';
                    btn.style.minHeight = '90px';
                    if (opt.correct) btn.classList.add('tut-hint-pulse');
                    btn.onclick = () => {
                        if (opt.correct) {
                            playSound('correct');
                            btn.classList.remove('tut-hint-pulse');
                            btn.classList.add('correct');
                            fb.style.color = '#27ae60';
                            fb.innerText = '✅ آفرین! عینک رو دیدی!';
                            setTimeout(onCorrect, 700);
                        } else {
                            playSound('wrong');
                            btn.classList.add('wrong');
                            fb.style.color = '#d63031';
                            fb.innerText = '❌ این تصویر نبود!';
                            setTimeout(() => btn.classList.remove('wrong'), 500);
                        }
                    };
                    grid.appendChild(btn);
                });
            }, 2500);
        }
    },

    // ====== تفاوت نمادها ======
    symboldiff: {
        rules: [],
        demo: (container, onCorrect) => {
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 کدوم نماد توی جدول پایین با بالا فرق داره؟</div>
                <div style="margin-bottom:15px;">
                    <div style="font-size:12px; color:#636e72; margin-bottom:5px; font-weight:600;">جدول بالا (مرجع)</div>
                    <div class="tut-demo-grid" style="grid-template-columns: repeat(3, 1fr); opacity:0.7;"></div>
                </div>
                <div>
                    <div style="font-size:12px; color:#636e72; margin-bottom:5px; font-weight:600;">جدول پایین (روی تفاوت کلیک کن)</div>
                    <div class="tut-demo-grid" style="grid-template-columns: repeat(3, 1fr);"></div>
                </div>
                <div class="tut-feedback"></div>
            `;
            const grids = container.querySelectorAll('.tut-demo-grid');
            const refGrid = grids[0], tgtGrid = grids[1];
            const fb = container.querySelector('.tut-feedback');

            ['★', '●', '■'].forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = s;
                btn.disabled = true;
                refGrid.appendChild(btn);
            });

            ['★', '●', '▲'].forEach((s, i) => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = s;
                const isDiff = i === 2;
                if (isDiff) btn.classList.add('tut-hint-pulse');
                btn.onclick = () => {
                    if (isDiff) {
                        playSound('correct');
                        btn.classList.remove('tut-hint-pulse');
                        btn.classList.add('correct');
                        tgtGrid.querySelectorAll('button').forEach(b => b.disabled = true);
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! این نماد فرق داشت!';
                        setTimeout(onCorrect, 700);
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ این یکی همون شکله!';
                        setTimeout(() => btn.classList.remove('wrong'), 500);
                    }
                };
                tgtGrid.appendChild(btn);
            });
        }
    },

    // ====== چی کجا بود؟ ======
    scattermem: {
        rules: [],
        demo: (container, onCorrect) => {
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 این‌ها رو ببین و حفظ کن!</div>
                <div class="tut-show-big">🍎 🐱</div>
                <div class="tut-feedback">👀 خوب نگاه کن...</div>
            `;
            setTimeout(() => {
                container.innerHTML = `
                    <div class="tut-guide-bubble">🦉 کدوم یکی از این‌ها رو دیدی؟</div>
                    <div class="tut-demo-grid" style="grid-template-columns: repeat(2, 1fr);"></div>
                    <div class="tut-feedback"></div>
                `;
                const grid = container.querySelector('.tut-demo-grid');
                const fb = container.querySelector('.tut-feedback');
                [
                    { label: '🍕', correct: false },
                    { label: '🍎', correct: true }
                ].forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'tut-demo-item';
                    btn.innerText = opt.label;
                    btn.style.fontSize = '48px';
                    btn.style.minHeight = '90px';
                    if (opt.correct) btn.classList.add('tut-hint-pulse');
                    btn.onclick = () => {
                        if (opt.correct) {
                            playSound('correct');
                            btn.classList.remove('tut-hint-pulse');
                            btn.classList.add('correct');
                            fb.style.color = '#27ae60';
                            fb.innerText = '✅ آفرین! سیب بود!';
                            setTimeout(onCorrect, 700);
                        } else {
                            playSound('wrong');
                            btn.classList.add('wrong');
                            fb.style.color = '#d63031';
                            fb.innerText = '❌ این نبود!';
                            setTimeout(() => btn.classList.remove('wrong'), 500);
                        }
                    };
                    grid.appendChild(btn);
                });
            }, 2500);
        }
    },

    // ====== رودخانه ======
    riverranger: {
        rules: [],
        demo: (container, onCorrect) => {
            runTutSteps(container, [
                {
                    guide: 'قبلی 🐢 بود. حالا 🐢 اومده (یکسانه!). روی همین یکی کلیک کن!',
                    show: '<span style="font-size:60px;">🐢 ➡️ 🐢</span>',
                    options: [
                        { label: '🐢', correct: true, feedback: '✅ آفرین! چون با قبلی یکسان بود!', fontSize: '48px' }
                    ]
                },
                {
                    guide: 'قبلی 🐢 بود. حالا 🐟 اومده. حالا این رو باید بزنی؟',
                    show: '<span style="font-size:60px;">🐢 ➡️ 🐟</span>',
                    options: [
                        { label: '❌ نه، روش نمی‌زنم', correct: true, feedback: '✅ آفرین! چون با قبلی فرق داره، نباید بزنی!', fontSize: '18px' },
                        { label: '✅ بله، بزنم', correct: false, fontSize: '18px' }
                    ]
                }
            ], onCorrect);
        }
    },

    // ====== تطابق سرعت ======
    speedmatch: {
        rules: [],
        demo: (container, onCorrect) => {
            const lvl = getLevel('speedmatch');
            const is2Back = lvl >= 3;
            runTutSteps(container, [
                {
                    guide: is2Back ? 'مرحله اول: شکل جدید رو با دو مرحله قبل مقایسه کن. آیا یکسانن؟' : 'مرحله اول: شکل جدید با شکل قبلی یکسانه؟',
                    show: is2Back
                        ? '<span style="font-size:40px;">🔴 ➡️ 🔵 ➡️ 🔴</span><br><span style="font-size:13px;color:#636e72;margin-top:10px;display:block;">شکل سوم (🔴) با شکل اول (🔴) یکسانه.</span>'
                        : '<span style="font-size:40px;">🔴 ➡️ 🔴</span><br><span style="font-size:13px;color:#636e72;margin-top:10px;display:block;">این دو تا دقیقا یکسانن.</span>',
                    options: [
                        { label: '✅ بله (یکسان است)', correct: true, feedback: '✅ آفرین! دقیقاً یکسان هستن!' }
                    ]
                },
                {
                    guide: 'مرحله دوم: حالا این دو تا یکسانن؟',
                    show: is2Back
                        ? '<span style="font-size:40px;">🔴 ➡️ 🔴 ➡️ 🔵</span><br><span style="font-size:13px;color:#636e72;margin-top:10px;display:block;">شکل سوم (🔵) با شکل اول (🔴) فرق داره.</span>'
                        : '<span style="font-size:40px;">🔴 ➡️ 🔵</span><br><span style="font-size:13px;color:#636e72;margin-top:10px;display:block;">این دو تا یکسان نیستن.</span>',
                    options: [
                        { label: '❌ نه (فرق دارد)', correct: true, feedback: '✅ عالی! چون فرق دارن، دکمه نه رو می‌زنیم.' }
                    ]
                }
            ], onCorrect);
        }
    },
        // ====== چمدان سفر ======
    suitcase: {
        rules: [],
        demo: (container, onCorrect) => {
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 چمدان از وسط تا می‌شه. دوربین رو کجا بذاریم که روی وسیله نیفته؟</div>
                <div style="display:flex; flex-direction:column; align-items:center; margin:15px 0; background:#f1f2f6; padding:12px; border-radius:10px; width:fit-content; margin:15px auto; direction:ltr;">
                    <!-- نیمه بالا (دوربین سمت چپ) -->
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <div style="width:50px; height:50px; background:#e9f5ff; border:2px dashed #0984e3; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">📷</div>
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">🧴</div>
                    </div>
                    <div style="color:#f39c12; font-weight:bold; font-size:12px; margin-bottom:5px;">⬇️ خط تا شدن ⬇️</div>
                    <!-- نیمه پایین (سیب سمت چپ) -->
                    <div style="display:flex; gap:10px;">
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">🍎</div>
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">👓</div>
                    </div>
                </div>
                <div class="tut-demo-grid" style="grid-template-columns:repeat(2,1fr); direction:rtl;"></div>
                <div class="tut-feedback"></div>
            `;
            const grid = container.querySelector('.tut-demo-grid');
            const fb = container.querySelector('.tut-feedback');
            let solved = false;

            [
                { label: '❌ روی عینک 👓', val: false },
                { label: '✅ روی میوه 🍎', val: true } // سیب سمت چپ قرار داره
            ].forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = opt.label;
                btn.style.fontSize = '16px';
                btn.style.minHeight = '60px';
                if (opt.val === true) btn.classList.add('tut-hint-pulse');
                btn.onclick = () => {
                    if (solved) return;
                    if (opt.val) {
                        solved = true;
                        playSound('correct');
                        btn.classList.remove('tut-hint-pulse');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => { b.disabled = true; if (b !== btn) b.style.opacity = '0.4'; });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! دوربین دقیقاً روی میوه می‌افته!';
                        setTimeout(onCorrect, 700);
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ دقت کن! دوربین سمت چپه، باید ببینی زیرش چیه.';
                        setTimeout(() => btn.classList.remove('wrong'), 500);
                    }
                };
                grid.appendChild(btn);
            });
        }
    }
};

// =====================================================
// نمایش صفحه آموزش
// =====================================================

let _tutorialOnComplete = null;

function showTutorial(gameKey, onComplete) {
    const meta = GAME_META[gameKey];
    const domain = DOMAINS[meta.domain];
    const tut = TUTORIALS[gameKey];

    if (!tut) { onComplete(); return; }

    _tutorialOnComplete = onComplete;
    showScreen('screen-tutorial');

    // 🔧 نمایش صحیح آیکون (قبلاً innerText = "sun" بود → متن نمایش می‌داد)
    const iconEl = document.getElementById('tut-icon');
    iconEl.innerHTML = `<i data-lucide="${meta.icon}" style="width:60px;height:60px;color:${domain.color};"></i>`;
    document.getElementById('tut-title').innerText = meta.name;

    const badge = document.getElementById('tut-domain-badge');
    badge.innerText = domain.name;
    badge.style.background = domain.color;

    // مخفی کردن بخش قوانین (CSS هم پنهانش می‌کنه، ولی برای امنیت)
    const rulesEl = document.getElementById('tut-rules');
    if (rulesEl) rulesEl.innerHTML = '';

    const demoContainer = document.getElementById('tut-demo-container');
    const startBtn = document.getElementById('tut-start-btn');
    demoContainer.style.display = 'none';
    demoContainer.innerHTML = '';
    startBtn.disabled = true;
    startBtn.innerText = '👀 اول تمرین رو انجام بده...';

    startBtn.onclick = () => {
        if (startBtn.disabled) return;
        playSound('click');
        const cb = _tutorialOnComplete;
        _tutorialOnComplete = null;
        if (cb) cb();
    };

    const enableStart = () => {
        startBtn.disabled = false;
        startBtn.innerText = '🎮 شروع بازی اصلی!';
    };

    if (tut.demo) {
        demoContainer.style.display = 'block';
        tut.demo(demoContainer, enableStart);
    } else {
        enableStart();
    }

    refreshIcons();
}