// =====================================================
// TUTORIAL - سیستم آموزش بازی‌ها
// =====================================================

// Helper: ساخت دموی ساده‌ی یکسان
function createSimpleDemo(instruction, items, isCorrectFn, correctFeedback) {
    return function(container, onCorrect) {
        container.innerHTML = `
            <p style="font-weight:700; font-size:15px; margin-top:0;">${instruction}</p>
            <div class="tut-demo-grid" id="tut-demo-grid"></div>
            <div class="tut-feedback" id="tut-feedback"></div>
        `;
        const grid = container.querySelector('#tut-demo-grid');
        const fb = container.querySelector('#tut-feedback');
        let solved = false;

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'tut-demo-item';
            if (item.isHtml) btn.innerHTML = item.value;
            else btn.innerText = item.value;
            btn.onclick = () => {
                if (solved) return;
                if (isCorrectFn(item.value, item)) {
                    solved = true;
                    playSound('correct');
                    btn.classList.add('correct');
                    grid.querySelectorAll('button').forEach(b => {
                        b.disabled = true;
                        if (b !== btn) b.style.opacity = '0.4';
                    });
                    fb.style.color = '#27ae60';
                    fb.innerText = correctFeedback || '✅ آفرین!';
                    onCorrect();
                } else {
                    playSound('wrong');
                    btn.classList.add('wrong');
                    fb.style.color = '#d63031';
                    fb.innerText = '❌ دوباره تلاش کن!';
                    setTimeout(() => btn.classList.remove('wrong'), 600);
                }
            };
            grid.appendChild(btn);
        });
    };
}

// =====================================================
// داده‌های آموزش هر بازی
// =====================================================

const TUTORIALS = {
    // ============ استروپ روز و شب (junior) ============
    stroop_junior: {
        rules: [
            '☀️ وقتی خورشید می‌بینی، بگو «شب»',
            '🌙 وقتی ماه می‌بینی، بگو «روز»',
            '🤔 همیشه برعکس جواب بده!'
        ],
        demo: function(container, onCorrect) {
            const correct = 'night';
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">این چیه؟ (یادت باشه برعکس بگو!)</p>
                <div style="font-size:90px; text-align:center; margin:15px 0;">☀️</div>
                <div class="tut-demo-grid" id="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const grid = container.querySelector('#tut-demo-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            [
                { name: 'روز ☀️', val: 'day' },
                { name: 'شب 🌙', val: 'night' }
            ].forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = opt.name;
                btn.style.aspectRatio = 'auto';
                btn.style.minHeight = '60px';
                btn.style.fontSize = '20px';
                btn.style.padding = '15px';
                btn.onclick = () => {
                    if (solved) return;
                    if (opt.val === correct) {
                        solved = true;
                        playSound('correct');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            if (b !== btn) b.style.opacity = '0.4';
                        });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! خورشید یعنی باید بگی شب!';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ دقت کن! خورشید یعنی باید بگی شب';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
                    }
                };
                grid.appendChild(btn);
            });
        }
    },

    // ============ استروپ رنگ یا کلمه (senior) ============
    stroop_senior: {
        rules: [
            '🎨 کلمه‌ای که می‌بینی، اسم یک رنگه',
            '👀 ولی رنگ جوهرش ممکنه فرق کنه',
            '✅ باید رنگ جوهر رو انتخاب کنی، نه اسم کلمه رو!'
        ],
        demo: function(container, onCorrect) {
            const word = 'آبی';
            const inkColor = '#e74c3c';
            const correct = 'قرمز';

            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">رنگ جوهر این کلمه چیه؟ (نه اسمش!)</p>
                <div style="font-size:70px; font-weight:900; color:${inkColor}; text-align:center; margin:15px 0; min-height:90px; display:flex; align-items:center; justify-content:center;">${word}</div>
                <div class="tut-demo-grid" id="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const grid = container.querySelector('#tut-demo-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            [
                { name: 'آبی', color: '#3498db' },
                { name: 'قرمز', color: '#e74c3c' },
                { name: 'سبز', color: '#27ae60' },
                { name: 'نارنجی', color: '#e67e22' }
            ].forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = opt.name;
                btn.style.background = opt.color;
                btn.style.color = 'white';
                btn.style.aspectRatio = 'auto';
                btn.style.minHeight = '55px';
                btn.style.fontSize = '18px';
                btn.style.padding = '15px';
                btn.onclick = () => {
                    if (solved) return;
                    if (opt.name === correct) {
                        solved = true;
                        playSound('correct');
                        grid.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            b.style.background = '';
                            b.style.color = '';
                            if (b !== btn) b.style.opacity = '0.4';
                        });
                        btn.classList.add('correct');
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! رنگ جوهر قرمزه!';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ به رنگ نوشته نگاه کن، نه اسمش!';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
                    }
                };
                grid.appendChild(btn);
            });
        }
    },

    // ============ شکار حیوانات ============
    numhunt_junior: {
        rules: [
            '👀 اول چند ثانیه تصاویر رو نگاه کن و جاهاشون رو حفظ کن',
            '🎯 بعد فقط روی حیوون‌های هدف کلیک کن',
            '⏱️ زمان محدوده، سریع باش!'
        ],
        demo: createSimpleDemo(
            'روی 🐱 (گربه) کلیک کن:',
            [{ value: '🚗' }, { value: '🐱' }, { value: '🌻' }, { value: '⚽' }],
            (val) => val === '🐱'
        )
    },

    // ============ شکار اعداد ============
    numhunt_senior: {
        rules: [
            '👀 اول اعداد رو ببین و جاهاشون رو حفظ کن',
            '🎯 بعد فقط روی جای عدد هدف کلیک کن',
            '⚠️ هر کلیک اشتباه، امتیاز منفی داره!',
            '⏱️ زمان محدوده!'
        ],
        demo: createSimpleDemo(
            'روی عدد ۷ کلیک کن:',
            [{ value: '۴' }, { value: '۷' }, { value: '۲' }, { value: '۹' }],
            (val) => val === '۷'
        )
    },

    // ============ شکار میوه‌ها ============
    wordhunt_junior: {
         rules: [
        '🍎 فقط روی میوه‌ها کلیک کن.',
        '⏱️ این بازی زمان‌محور است! هرچه سریع‌تر همه را پیدا کنی، امتیاز بالاتری می‌گیری.',
        '❌ هر کلیک اشتباه، ۲ ثانیه به زمان تو اضافه می‌کند!'
    ],
        demo: createSimpleDemo(
            'روی میوه کلیک کن:',
            [{ value: '🍎' }, { value: '🚗' }, { value: '🌻' }, { value: '⚽' }],
            (val) => ['🍎','🍌','🍇','🍉','🍓','🍒','🍑','🍍'].includes(val)
        )
    },

    // ============ شکار کلمات ============
    wordhunt_senior: {
        rules: [
        '🐾 فقط روی اسم حیوانات کلیک کن.',
        '⏱️ سرعتِ عمل تو رکورد اصلی این بازی است. هرچه سریع‌تر، بهتر!',
        '❌ هر کلیک اشتباه، ۲ ثانیه جریمه دارد.'
    ],
        demo: createSimpleDemo(
            'روی اسم حیوان کلیک کن:',
            [{ value: 'گربه' }, { value: 'کتاب' }, { value: 'میز' }, { value: 'توپ' }],
            (val) => ['میمون','گربه','شیر','خرس','اسب','ماهی','پلنگ','گرگ','روباه','زنبور','عقاب','دلفین','خرگوش','آهو'].includes(val)
        )
    },

    // ============ شکل‌های مخفی ============
    shapehunt: {
        rules: [
            '🔍 فقط روی شکلی که در بالا نشون داده می‌شه کلیک کن',
            '🎯 مثلاً اگه دایره قرمز بود، فقط دایره‌های قرمز رو بزن',
            '⏱️ زمان محدوده!'
        ],
        demo: function(container, onCorrect) {
            const target = { type: 'circle', color: '#e74c3c' };
            const items = [
                { svg: getShapeSVG({ type: 'circle', color: '#e74c3c' }), correct: true },
                { svg: getShapeSVG({ type: 'circle', color: '#3498db' }), correct: false },
                { svg: getShapeSVG({ type: 'square', color: '#e74c3c' }), correct: false },
                { svg: getShapeSVG({ type: 'circle', color: '#e74c3c' }), correct: true }
            ];
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">فقط روی این شکل کلیک کن: <span class="target-display-box">${getShapeSVG(target)}</span></p>
                <div class="tut-demo-grid" id="tut-demo-grid"></div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const grid = container.querySelector('#tut-demo-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerHTML = item.svg;
                btn.onclick = () => {
                    if (solved) return;
                    if (item.correct) {
                        solved = true;
                        playSound('correct');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            if (b !== btn) b.style.opacity = '0.4';
                        });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین!';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ این شکل درست نیست!';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
                    }
                };
                grid.appendChild(btn);
            });
        }
    },

    // ============ تفاوت نمادها ============
    symboldiff: {
        rules: [
            '🔍 دو جدول می‌بینی: جدول بالا (مرجع) و جدول پایین',
            '🎯 در جدول پایین، نمادهایی که با بالا فرق دارن رو پیدا کن',
            '⏱️ زمان محدوده!'
        ],
        demo: function(container, onCorrect) {
            const refSymbols = ['★', '●', '■', '◆'];
            const targetSymbols = ['★', '●', '▲', '◆'];
            const diffIdx = 2;
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">کدام نماد در جدول پایین با بالا فرق داره؟</p>
                <div style="margin-bottom:15px;">
                    <div style="font-size:12px; color:#636e72; margin-bottom:5px; font-weight:600;">جدول بالا (مرجع)</div>
                    <div class="tut-demo-grid" id="tut-ref-grid" style="opacity:0.7;"></div>
                </div>
                <div>
                    <div style="font-size:12px; color:#636e72; margin-bottom:5px; font-weight:600;">جدول پایین (روی تفاوت کلیک کن)</div>
                    <div class="tut-demo-grid" id="tut-tgt-grid"></div>
                </div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const refGrid = container.querySelector('#tut-ref-grid');
            const tgtGrid = container.querySelector('#tut-tgt-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            refSymbols.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = s;
                btn.disabled = true;
                refGrid.appendChild(btn);
            });
            targetSymbols.forEach((s, i) => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = s;
                btn.onclick = () => {
                    if (solved) return;
                    if (i === diffIdx) {
                        solved = true;
                        playSound('correct');
                        btn.classList.add('correct');
                        tgtGrid.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            if (b !== btn) b.style.opacity = '0.4';
                        });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! این نماد تغییر کرده بود';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ این یکی تغییر نکرده!';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
                    }
                };
                tgtGrid.appendChild(btn);
            });
        }
    },

    // ============ چی کجا بود؟ ============
    scattermem: {
        rules: [
            '👀 چند ثانیه تصاویر و اعداد روی صفحه ظاهر می‌شن',
            '🧠 باید جاهاشون و چیزهایی که دیدی رو به خاطر بسپاری',
            '❓ بعدش چند سوال ازت می‌پرسم'
        ],
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">فرض کن اینا رو دیدی: 🍎 🐱</p>
                <p style="font-size:14px; color:#636e72; margin:8px 0;">حالا کدوم یکی از اینا توی تصویر بود؟</p>
                <div class="tut-demo-grid" id="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const grid = container.querySelector('#tut-demo-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            [
                { value: '🍕', correct: false },
                { value: '🍎', correct: true }
            ].forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = opt.value;
                btn.style.aspectRatio = 'auto';
                btn.style.minHeight = '70px';
                btn.style.fontSize = '40px';
                btn.onclick = () => {
                    if (solved) return;
                    if (opt.correct) {
                        solved = true;
                        playSound('correct');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            if (b !== btn) b.style.opacity = '0.4';
                        });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! سیب توی تصویر بود';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ این توی تصویر نبود!';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
                    }
                };
                grid.appendChild(btn);
            });
        }
    },
        riverranger: {
        rules: [
            '🌊 حیوانات از بالای رودخانه ظاهر می‌شوند و به پایین حرکت می‌کنند.',
            '🧠 قانون ۱-عقب: اگر حیوان جدید با حیوان قبلی یکسان بود، روی آن کلیک کن!',
            '🎯 مثال: اگر 🐢 دیدی و بعد از آن دوباره 🐢 آمد، روی دومی کلیک کن.'
        ],
        demo: createSimpleDemo(
            'حیوان قبلی 🐢 بود. حالا کدام را باید کلیک کنی؟',
            [
                { value: '🐟' },
                { value: '🐢' }, // این درسته
                { value: '🦆' }
            ],
            (val) => val === '🐢'
        )
    },
    speedmatch: {
        rules: [],
        demo: function(container, onCorrect) {
            const lvl = getLevel('speedmatch');
            const is2Back = lvl >= 3;

            if (!is2Back) {
                // آموزش 1-Back برای سطوح پایین
                container.innerHTML = `
                    <p style="font-weight:700; font-size:15px; margin-top:0;">در این مرحله، شکل جدید را با <strong>شکل قبلی</strong> مقایسه کن:</p>
                    <div style="text-align:center; font-size:40px; margin:15px 0;">
                        🔴 ➡️ 🔴
                    </div>
                    <p style="font-size:14px; color:#636e72; margin-bottom:15px;">اگر مثل هم بودند دکمه «بله»، اگر فرق داشتند دکمه «نه» را بزن.</p>
                    <div class="tut-demo-grid" id="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                    <div class="tut-feedback" id="tut-feedback"></div>
                `;
                const grid = container.querySelector('#tut-demo-grid');
                const fb = container.querySelector('#tut-feedback');
                let solved = false;

                [
                    { name: '✅ بله', val: true },
                    { name: '❌ نه', val: false }
                ].forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'tut-demo-item';
                    btn.innerText = opt.name;
                    btn.style.fontSize = '18px';
                    btn.onclick = () => {
                        if (solved) return;
                        if (opt.val === true) {
                            solved = true;
                            playSound('correct');
                            btn.classList.add('correct');
                            grid.querySelectorAll('button').forEach(b => { b.disabled = true; if(b!==btn) b.style.opacity='0.4'; });
                            fb.style.color = '#27ae60';
                            fb.innerText = '✅ آفرین! دقیقاً یکسان هستند.';
                            onCorrect();
                        } else {
                            playSound('wrong');
                            btn.classList.add('wrong');
                            fb.style.color = '#d63031';
                            fb.innerText = '❌ دقت کن! این دو تا با هم یکسان هستند.';
                            setTimeout(() => btn.classList.remove('wrong'), 600);
                        }
                    };
                    grid.appendChild(btn);
                });
            } else {
                // آموزش 2-Back برای سطوح بالا
                container.innerHTML = `
                    <div class="intro-box" style="margin-bottom:10px; padding:15px;">
                        <p style="font-weight:700; font-size:15px; margin-top:0; color:#d63031;">⚠️ هشدار: در این مرحله قانون سخت‌تر می‌شود!</p>
                        <p style="font-size:14px; margin-bottom:10px;">شما باید شکل جدید را با <strong>دو مرحله قبل</strong> مقایسه کنید (به شکل قبلی کاری نداشته باشید).</p>
                        
                        <div style="display:flex; justify-content:space-around; align-items:center; background:#f1f2f6; padding:10px; border-radius:10px; margin-bottom:10px; direction:ltr;">
                            <div style="text-align:center;"><div style="font-size:30px;">🔴</div><div style="font-size:10px;">مرحله ۱</div></div>
                            <div style="font-size:20px; color:#b2bec3;">➡️</div>
                            <div style="text-align:center;"><div style="font-size:30px;">🔵</div><div style="font-size:10px;">مرحله ۲</div></div>
                            <div style="font-size:20px; color:#b2bec3;">➡️</div>
                            <div style="text-align:center; background:#d4edda; padding:5px; border-radius:5px; border:2px solid #00b894;"><div style="font-size:30px;">🔴</div><div style="font-size:10px;">مرحله ۳</div></div>
                        </div>
                        <p style="font-size:13px; color:#0984e3; font-weight:700; text-align:center;">اینجا شکل ۳ (🔴) با شکل ۱ (🔴) یکسان است. پس دکمه بله را می‌زنیم!</p>
                    </div>
                    <button onclick="window._smTutComplete()" style="margin-top:10px;">فهمیدم، آماده‌ام! 🚀</button>
                `;
                window._smTutComplete = () => {
                    playSound('click');
                    onCorrect();
                };
            }
        }
    },
        suitcase: {
        rules: [
            '🧳 در چمدان تعدادی وسیله وجود دارد.',
            '📷 باید دوربین را در یک خانه خالی بگذاری.',
            '🔽 چمدان از وسط (خط‌چین زرد) تا می‌شود و نیمه بالایی روی نیمه پایینی می‌افتد.',
            '⚠️ اگر دوربین روی وسیله‌ای بیفتد، خطا می‌کنی!'
        ],
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; margin-top:0;">فرض کن می‌خواهیم نیمه بالای چمدان را روی نیمه پایین ببندیم.</p>
                <div style="display:flex; flex-direction:column; align-items:center; margin:15px 0; background:#f1f2f6; padding:10px; border-radius:10px; width:fit-content; margin:15px auto;">
                    <!-- نیمه بالا -->
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <div style="width:50px; height:50px; background:#e9f5ff; border:2px dashed #0984e3; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">📷</div>
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">🧴</div>
                    </div>
                    <div style="color:#f39c12; font-weight:bold; font-size:12px; margin-bottom:5px;">⬇️ خط تا شدن ⬇️</div>
                    <!-- نیمه پایین -->
                    <div style="display:flex; gap:10px;">
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">👓</div>
                        <div style="width:50px; height:50px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:24px;">🥣</div>
                    </div>
                </div>
                <p style="font-size:14px; margin-bottom:10px; font-weight:700;">اگر نیمه بالا را تا کنیم، دوربین 📷 روی چه چیزی می‌افتد؟</p>
                <div class="tut-demo-grid" id="tut-demo-grid" style="grid-template-columns:repeat(2,1fr);"></div>
                <div class="tut-feedback" id="tut-feedback"></div>
            `;
            const grid = container.querySelector('#tut-demo-grid');
            const fb = container.querySelector('#tut-feedback');
            let solved = false;

            [
                { name: '✅ روی عینک 👓', val: true }, // این درسته
                { name: '❌ روی کاسه 🥣', val: false }
            ].forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tut-demo-item';
                btn.innerText = opt.name;
                btn.style.fontSize = '16px';
                btn.onclick = () => {
                    if (solved) return;
                    if (opt.val === true) {
                        solved = true;
                        playSound('correct');
                        btn.classList.add('correct');
                        grid.querySelectorAll('button').forEach(b => { b.disabled = true; if(b!==btn) b.style.opacity='0.4'; });
                        fb.style.color = '#27ae60';
                        fb.innerText = '✅ آفرین! دوربین دقیقاً روی عینک می‌افتد. پس این جای اشتباهی است!';
                        onCorrect();
                    } else {
                        playSound('wrong');
                        btn.classList.add('wrong');
                        fb.style.color = '#d63031';
                        fb.innerText = '❌ دقت کن! ستون سمت چپ را نگاه کن.';
                        setTimeout(() => btn.classList.remove('wrong'), 600);
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

    if (!tut) {
        onComplete();
        return;
    }

    _tutorialOnComplete = onComplete;
    showScreen('screen-tutorial');

    document.getElementById('tut-icon').innerText = meta.icon;
    document.getElementById('tut-title').innerText = meta.name;

    const badge = document.getElementById('tut-domain-badge');
    badge.innerText = `${domain.name}`;
    badge.style.background = domain.color;

    const rulesEl = document.getElementById('tut-rules');
    rulesEl.innerHTML = '';
    tut.rules.forEach(r => {
        const li = document.createElement('li');
        li.innerText = r;
        rulesEl.appendChild(li);
    });

    const demoContainer = document.getElementById('tut-demo-container');
    const startBtn = document.getElementById('tut-start-btn');
    demoContainer.style.display = 'none';
    demoContainer.innerHTML = '';
    startBtn.disabled = true;
    startBtn.innerText = 'اول تمرین رو کامل کن! 🚀';
    
    startBtn.onclick = () => {
        if (startBtn.disabled) return;
        playSound('click');
        const cb = _tutorialOnComplete;
        _tutorialOnComplete = null;
        if (cb) cb();
    };

    const enableStart = () => {
        startBtn.disabled = false;
        startBtn.innerText = '🚀 شروع بازی';
    };

    if (tut.demo) {
        demoContainer.style.display = 'block';
        tut.demo(demoContainer, enableStart);
    } else {
        enableStart();
    }
}