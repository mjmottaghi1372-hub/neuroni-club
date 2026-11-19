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
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 حیوان‌ها از بالای رودخانه میان پایین. اگر حیوان جدید با حیوان <strong>قبلی</strong> یکسان بود، روش کلیک کن!</div>
                
                <div style="background: linear-gradient(to bottom, #74b9ff, #0984e3); height: 250px; border-radius: 15px; position: relative; overflow: hidden; margin: 15px 0;" id="tut-river-area">
                    <!-- انیمیشن اینجا اجرا میشه -->
                </div>
                
                <div class="tut-feedback" id="tut-river-feedback" style="text-align:center; font-weight:700; font-size:16px; min-height:40px; padding:10px; background:#fff; border-radius:10px;">...</div>
            `;
            
            const area = document.getElementById('tut-river-area');
            const fb = document.getElementById('tut-river-feedback');
            let clicked = false;
            let currentTimeout = null;

            function showAnimal(emoji, isMatch) {
                clicked = false;
                const el = document.createElement('div');
                el.innerText = emoji;
                el.style.cssText = 'position:absolute; font-size:50px; top:-60px; left:40%; transition: top 2.5s linear; cursor:pointer; padding:15px;';
                area.appendChild(el);
                
                setTimeout(() => { el.style.top = '140px'; }, 50);

                // زمان انتظار برای کلیک
                currentTimeout = setTimeout(() => {
                    if (!clicked) {
                        if (isMatch) {
                            // اگر هدف بود و کلیک نکرد
                            fb.style.color = '#d63031';
                            fb.innerText = '❌ این یکی رو از دست دادی! باید روش کلیک می‌کردی.';
                        } else {
                            // اگر هدف نبود و کلیک نکرد (کار درست)
                            fb.style.color = '#27ae60';
                            fb.innerText = '✅ آفرین! درست بود که کلیک نکردی.';
                        }
                        
                        // بعد از پیام، برو مرحله بعد
                        setTimeout(() => {
                            el.remove();
                            goToNextStep(isMatch ? 'missed_target' : 'ignored_wrong');
                        }, 2000);
                    }
                }, 2500);

                el.onclick = () => {
                    if (clicked) return;
                    clicked = true;
                    clearTimeout(currentTimeout);
                    
                    if (isMatch) {
                        playSound('correct');
                        el.style.transform = 'scale(1.5)';
                        el.style.opacity = '0';
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! این دقیقاً مثل لاک‌پشت قبلیه!';
                        setTimeout(() => {
                            el.remove();
                            goToNextStep('correct_click');
                        }, 1500);
                    } else {
                        playSound('wrong');
                        el.style.filter = 'grayscale(1)';
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ اشتباه بود! این با لاک‌پشت فرق داره. نباید می‌زدی!';
                        setTimeout(() => {
                            el.remove();
                            goToNextStep('wrong_click');
                        }, 2000);
                    }
                };
            }

            let step = 1;
            function goToNextStep(action) {
                step++;
                if (step === 2) {
                    // مرحله ۲: ماهی (اشتباه)
                    fb.style.color = '#636e72';
                    fb.innerText = '👀 حیوان جدید: ماهی 🐟';
                    showAnimal('🐟', false);
                } else if (step === 3) {
                    // مرحله ۳: لاک‌پشت (درست)
                    fb.style.color = '#636e72';
                    fb.innerText = '👀 حیوان جدید: لاک‌پشت 🐢 (یکسان با قبلی!)';
                    showAnimal('🐢', true);
                } else if (step === 4) {
                    // پایان آموزش
                    fb.style.color = '#27ae60';
                    fb.innerText = '🎉 عالی! حالا بریم بازی اصلی!';
                    setTimeout(onCorrect, 2000);
                }
            }

            // شروع: لاک‌پشت اول
            fb.innerText = '👀 اولین حیوان: لاک‌پشت 🐢';
            const firstAnimal = document.createElement('div');
            firstAnimal.innerText = '🐢';
            firstAnimal.style.cssText = 'position:absolute; font-size:50px; top:-60px; left:40%; transition: top 2.5s linear;';
            area.appendChild(firstAnimal);
            setTimeout(() => { firstAnimal.style.top = '140px'; }, 50);
            
            setTimeout(() => {
                firstAnimal.remove();
                step = 1;
                goToNextStep('first_done');
            }, 3000);
        }
    },

    // ====== تطابق سرعت ======
    speedmatch: {
        rules: [],
        demo: (container, onCorrect) => {
            const lvl = getLevel('speedmatch');
            const is2Back = lvl >= 3;
            
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 ${is2Back ? 'شکل جدید رو با <strong>دو مرحله قبل</strong> مقایسه کن!' : 'شکل جدید رو با <strong>شکل قبلی</strong> مقایسه کن!'}</div>
                
                <div style="text-align:center; margin: 20px 0;">
                    <div id="tut-sm-display" style="font-size:80px; min-height:100px; display:flex; justify-content:center; align-items:center; transition: transform 0.2s;">🔴</div>
                    <div id="tut-sm-text" style="font-weight:700; font-size:15px; color:#636e72; margin-top:10px; min-height:30px;">شکل اول...</div>
                </div>

                <div id="tut-sm-buttons" style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                    <button class="tut-demo-item" style="font-size:16px; min-height:50px; flex:1;" onclick="window._tutSmAns(true)">✅ بله</button>
                    <button class="tut-demo-item" style="font-size:16px; min-height:50px; flex:1;" onclick="window._tutSmAns(false)">❌ نه</button>
                </div>

                <div class="tut-feedback" id="tut-sm-feedback" style="text-align:center; font-weight:700; font-size:16px; min-height:40px; padding:10px; background:#fff; border-radius:10px;"></div>
            `;

            const display = document.getElementById('tut-sm-display');
            const text = document.getElementById('tut-sm-text');
            const btns = document.getElementById('tut-sm-buttons');
            const fb = document.getElementById('tut-sm-feedback');
            
            let currentStep = 1; // 1: تست اشتباه، 2: تست درست
            let solved = false;

            window._tutSmAns = (ans) => {
                if (solved) return;

                if (currentStep === 1) {
                    // مرحله اشتباه (بین 🔴 و 🔵)
                    if (ans === false) {
                        playSound('correct');
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ درسته! این دو تا فرق دارن.';
                        btns.style.display = 'none';
                        
                        setTimeout(() => {
                            // مرحله درست: نمایش توالی 🔴 ➡️ 🔵 ➡️ 🔴
                            currentStep = 2;
                            fb.innerText = '';
                            text.innerHTML = 'حالا دقت کن... (شکل سوم)';
                            display.innerText = '🔴';
                            btns.style.display = 'flex';
                        }, 1500);
                    } else {
                        playSound('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ اشتباه بود! این دو تا فرق دارن (🔴 با 🔵).';
                    }
                } else if (currentStep === 2) {
                    // مرحله درست (بین 🔴 و 🔴)
                    if (ans === true) {
                        playSound('correct');
                        solved = true;
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! این دو تا دقیقاً یکسان هستن!';
                        btns.style.display = 'none';
                        setTimeout(onCorrect, 1500);
                    } else {
                        playSound('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ دقت کن! این دو تا دقیقاً یکسان هستن.';
                    }
                }
            };

            // شروع: نمایش شکل اول 🔴 و بعد شکل دوم 🔵
            setTimeout(() => {
                text.innerText = 'شکل دوم با قبلی یکسانه؟ (🔴 با 🔵)';
                display.innerText = '🔵';
            }, 1500);
        }
    },
     // ====== چمدان سفر ======
    suitcase: {
        rules: [],
        demo: (container, onCorrect) => {
            container.innerHTML = `
                <div class="tut-guide-bubble">🦉 چمدان از وسط تا می‌شه. باید دوربین 📷 رو جایی بذاری که بعد از تا شدن، روی وسیله‌ها نیفته.</div>
                
                <div style="display:flex; flex-direction:column; align-items:center; margin:15px 0; background:#f1f2f6; padding:15px; border-radius:10px; width:fit-content; margin:15px auto; direction:ltr;">
                    <!-- نیمه بالا -->
                    <div style="display:flex; gap:15px; margin-bottom:5px;">
                        <div style="width:60px; height:60px; background:#e9f5ff; border:2px dashed #0984e3; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:28px; cursor:pointer;" id="tut-suitcase-top">📷</div>
                        <div style="width:60px; height:60px; background:#fdf5e6; border:2px solid #5c442c; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:28px;">🧴</div>
                    </div>
                    <div style="color:#f39c12; font-weight:bold; font-size:14px; margin-bottom:5px; letter-spacing:2px;">⬇️ خط تا شدن ⬇️</div>
                    <!-- نیمه پایین -->
                    <div style="display:flex; gap:15px;">
                        <div style="width:60px; height:60px; background:#fdf5e6; border:2px solid #5c442c; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:28px;" id="tut-suitcase-bottom">🍎</div>
                        <div style="width:60px; height:60px; background:#fdf5e6; border:2px solid #5c442c; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:28px;">👓</div>
                    </div>
                </div>

                <p style="font-weight:700; font-size:15px; margin:20px 0 10px 0;">اگر چمدان رو ببندیم، دوربین روی چی می‌افته؟</p>
                <div class="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                <div class="tut-feedback"></div>
            `;
            const grid = container.querySelector('.tut-demo-grid');
            const fb = container.querySelector('.tut-feedback');
            let solved = false;

            [
                { label: '✅ روی سیب 🍎', val: true },
                { label: '❌ روی عینک 👓', val: false }
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
                        
                        // انیمیشن بسته شدن چمدان
                        const topHalf = document.getElementById('tut-suitcase-top');
                        const bottomHalf = document.getElementById('tut-suitcase-bottom');
                        topHalf.style.transform = 'translateY(70px) scale(0.5)';
                        topHalf.style.opacity = '0.5';
                        bottomHalf.style.background = '#f8d7da';
                        bottomHalf.style.borderColor = '#d63031';

                        btn.classList.remove('tut-hint-pulse');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => { b.disabled = true; if (b !== btn) b.style.opacity = '0.4'; });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! دوربین دقیقاً روی سیب می‌افته. پس اینجا جای اشتباهیه!';
                        setTimeout(onCorrect, 1500);
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ دوباره نگاه کن! دوربین بالای سیبه.';
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