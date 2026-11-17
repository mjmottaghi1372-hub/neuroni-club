// =====================================================
// TUTORIAL - سیستم آموزش بصری و تعاملی
// =====================================================

let _tutorialOnComplete = null;
let _tutorialAnimTimeout = null;

// تابع کمکی برای ساخت دموهای کلیکی
function createSimpleDemo(instruction, items, isCorrectFn) {
    return function(container, onCorrect) {
        container.innerHTML = `
            <p style="font-weight:700; font-size:16px; margin-top:0; text-align:center; color:#0984e3;">${instruction}</p>
            <div class="tut-demo-grid" id="tut-demo-grid" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:10px;"></div>
            <div class="tut-feedback" id="tut-feedback" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
        `;
        const grid = container.querySelector('#tut-demo-grid');
        const fb = container.querySelector('#tut-feedback');
        let solved = false;

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'tut-demo-item';
            btn.innerText = item.value;
            btn.onclick = () => {
                if (solved) return;
                if (isCorrectFn(item.value)) {
                    solved = true;
                    playSound('correct');
                    btn.classList.add('correct');
                    grid.querySelectorAll('button').forEach(b => { b.disabled = true; if(b!==btn) b.style.opacity='0.3'; });
                    fb.style.color = '#27ae60';
                    fb.innerText = '✅ آفرین!';
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

const TUTORIALS = {
    // ============ ۱. استروپ روز و شب ============
    stroop_junior: {
        demo: function(container, onCorrect) {
            // به جای دموی کلیکی، یک انیمیشن نمایشی کوچک نشان می‌دهیم
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">وقتی خورشید ☀️ دیدی، بگو شب! و برعکس!</p>
                <div style="display:flex; justify-content:center; gap:20px; margin-top:15px;">
                    <button class="tut-demo-item" onclick="this.classList.add('correct'); playSound('correct'); setTimeout(()=>arguments[0](), 500);">🌙 شب</button>
                    <button class="tut-demo-item" onclick="this.classList.add('wrong'); playSound('wrong');">☀️ روز</button>
                </div>
                <div style="font-size:50px; text-align:center; margin-top:20px;">☀️</div>
            `;
            // اصلاح منطق دمو
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">خورشید ☀️ آمده! تو باید چی بگی؟</p>
                <div style="font-size:60px; text-align:center; margin:10px 0;">☀️</div>
                <div style="display:flex; justify-content:center; gap:15px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [{n: 'روز ☀️', v: 'day'}, {n: 'شب 🌙', v: 'night'}].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.n;
                b.onclick = () => {
                    if (opt.v === 'night') {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! برعکس گفتی!';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ دقت کن! خورشید یعنی باید بگی شب.';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۲. استروپ رنگ/کلمه ============
    stroop_senior: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">به رنگ جوهر نگاه کن، نه اسم کلمه!</p>
                <div style="font-size:50px; font-weight:900; color:#e74c3c; text-align:center; margin:15px 0;">آبی</div>
                <div style="display:flex; justify-content:center; gap:10px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [{n: 'آبی', c: '#3498db'}, {n: 'قرمز', c: '#e74c3c'}].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.n;
                b.onclick = () => {
                    if (opt.n === 'قرمز') {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! رنگ جوهر قرمز بود!';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ گول اسمش رو نخور! رنگش چیه؟';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۳. شکار حیوانات ============
    numhunt_junior: {
        demo: createSimpleDemo(
            'فقط روی گربه 🐱 کلیک کن:',
            [{ value: '🚗' }, { value: '🐱' }, { value: '⚽' }],
            (val) => val === '🐱'
        )
    },

    // ============ ۴. شکار اعداد ============
    numhunt_senior: {
        demo: createSimpleDemo(
            'فقط روی عدد ۷ کلیک کن:',
            [{ value: '۴' }, { value: '۷' }, { value: '۲' }],
            (val) => val === '۷'
        )
    },

    // ============ ۵. شکار میوه‌ها ============
    wordhunt_junior: {
        demo: createSimpleDemo(
            'فقط روی میوه کلیک کن:',
            [{ value: '🚗' }, { value: '🍎' }, { value: '🌻' }],
            (val) => val === '🍎'
        )
    },

    // ============ ۶. شکار کلمات ============
    wordhunt_senior: {
        demo: createSimpleDemo(
            'فقط روی اسم حیوان کلیک کن:',
            [{ value: 'کتاب' }, { value: 'گربه' }, { value: 'میز' }],
            (val) => val === 'گربه'
        )
    },

    // ============ ۷. شکل‌های مخفی ============
    shapehunt: {
        demo: function(container, onCorrect) {
            const target = getShapeSVG({ type: 'circle', color: '#e74c3c' });
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">فقط روی این شکل کلیک کن:</p>
                <div style="display:flex; justify-content:center; margin:10px 0;"><span class="target-display-box" style="width:50px; height:50px;">${target}</span></div>
                <div style="display:flex; justify-content:center; gap:10px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [
                { svg: getShapeSVG({ type: 'circle', color: '#3498db' }), ok: false },
                { svg: target, ok: true }
            ].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerHTML = opt.svg;
                b.onclick = () => {
                    if (opt.ok) {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین!';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ رنگش فرق داره!';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۸. حافظه فوق‌العاده ============
    memory: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">تصاویر و اعداد رو به خاطر بسپار!</p>
                <div style="display:flex; justify-content:center; gap:10px; font-size:40px; margin:15px 0;">🍎 🚗</div>
                <button class="tut-demo-item" style="width:100%; font-size:16px;" onclick="this.classList.add('correct'); playSound('correct'); arguments[0]();">فهمیدم! 🚀</button>
            `;
            container.querySelector('button').onclick = (e) => {
                e.target.classList.add('correct'); playSound('correct'); onCorrect();
            };
        }
    },

    // ============ ۹. تفاوت نمادها ============
    symboldiff: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">کدوم شکل با بالا فرق داره؟</p>
                <div style="display:flex; gap:10px; justify-content:center; margin-bottom:10px; opacity:0.5;">
                    <div class="tut-demo-item">★</div><div class="tut-demo-item">●</div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [
                { icon: '★', ok: false },
                { icon: '▲', ok: true }
            ].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.icon;
                b.onclick = () => {
                    if (opt.ok) {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! شکل دوم عوض شده!';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ این یکی تغییر نکرده!';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۱۰. چی کجا بود؟ ============
    scattermem: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">فرض کن اینا رو دیدی: 🍎 🐱</p>
                <p style="font-size:14px; text-align:center; margin:5px 0;">کدوم توی تصویر بود؟</p>
                <div style="display:flex; justify-content:center; gap:15px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [
                { icon: '🍕', ok: false },
                { icon: '🍎', ok: true }
            ].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.icon;
                b.onclick = () => {
                    if (opt.ok) {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! سیب توی تصویر بود.';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ این توی تصویر نبود!';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۱۱. رودخانه (River Ranger) ============
    riverranger: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">اگر حیوان جدید با قبلی یکسان بود، کلیک کن!</p>
                <div style="display:flex; justify-content:center; gap:10px; font-size:40px; margin:15px 0;">
                    <span>🐟</span> <span>➡️</span> <span id="demo-target" style="cursor:pointer; transition:0.2s; border:2px dashed #0984e3; border-radius:10px; padding:0 5px;">🐟</span>
                </div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;">روی ماهی دوم کلیک کن!</div>
            `;
            const target = container.querySelector('#demo-target');
            const fb = container.querySelector('#demo-fb');
            target.onclick = () => {
                playSound('correct'); target.style.background = '#d4edda'; target.style.borderColor = '#00b894';
                fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! چون هر دو یکسان بودن!';
                setTimeout(onCorrect, 1000);
            };
        }
    },

    // ============ ۱۲. تطابق سرعت (Speed Match) ============
    speedmatch: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">آیا این دو شکل یکسانند؟</p>
                <div style="display:flex; justify-content:center; gap:10px; margin:15px 0;">
                    <div style="background:#fff; border:3px solid #dfe6e9; padding:10px; border-radius:10px;">
                        <svg viewBox="0 0 100 100" style="width:50px; height:50px;"><circle cx="50" cy="50" r="40" fill="#e74c3c"/></svg>
                    </div>
                    <div style="background:#fff; border:3px solid #dfe6e9; padding:10px; border-radius:10px;">
                        <svg viewBox="0 0 100 100" style="width:50px; height:50px;"><circle cx="50" cy="50" r="40" fill="#e74c3c"/></svg>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:10px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [
                { n: '✅ بله', ok: true },
                { n: '❌ نه', ok: false }
            ].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.n;
                b.onclick = () => {
                    if (opt.ok) {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! دقیقاً یکسان هستند.';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ دقت کن! این دو کاملاً یکسانند.';
                    }
                };
                btns.appendChild(b);
            });
        }
    },

    // ============ ۱۳. چمدان سفر (Suitcase) ============
    suitcase: {
        demo: function(container, onCorrect) {
            container.innerHTML = `
                <p style="font-weight:700; font-size:15px; text-align:center; color:#0984e3;">دوربین 📷 را کجا بگذاریم که بعد از تا شدن، روی وسیله‌ای نیفتد؟</p>
                <div style="display:flex; flex-direction:column; align-items:center; background:#f1f2f6; padding:10px; border-radius:10px; width:fit-content; margin:15px auto;">
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <div style="width:40px; height:40px; background:#e9f5ff; border:2px dashed #0984e3; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:20px;">📷</div>
                        <div style="width:40px; height:40px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:20px;">🧴</div>
                    </div>
                    <div style="color:#f39c12; font-weight:bold; font-size:12px; margin-bottom:5px;">--- خط تا ---</div>
                    <div style="display:flex; gap:10px;">
                        <div style="width:40px; height:40px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:20px;">👓</div>
                        <div style="width:40px; height:40px; background:#fdf5e6; border:2px solid #5c442c; border-radius:5px; display:flex; justify-content:center; align-items:center; font-size:20px;">🥣</div>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:10px;" id="demo-btns"></div>
                <div id="demo-fb" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
            `;
            const btns = container.querySelector('#demo-btns');
            const fb = container.querySelector('#demo-fb');
            
            [
                { n: '👓 روی عینک', ok: true },
                { n: '🥣 روی کاسه', ok: false }
            ].forEach(opt => {
                const b = document.createElement('button');
                b.className = 'tut-demo-item'; b.innerText = opt.n; b.style.fontSize = '16px';
                b.onclick = () => {
                    if (opt.ok) {
                        playSound('correct'); b.classList.add('correct'); 
                        fb.style.color = '#27ae60'; fb.innerText = '✅ آفرین! این جای درستی نیست چون روی عینک می‌افتد.';
                        btns.innerHTML = ''; onCorrect();
                    } else {
                        playSound('wrong'); b.classList.add('wrong');
                        fb.style.color = '#d63031'; fb.innerText = '❌ دقت کن! اگر تا شود، دوربین روی عینک می‌افتد نه کاسه!';
                    }
                };
                btns.appendChild(b);
            });
        }
    }
};

// =====================================================
// نمایش صفحه آموزش
// =====================================================
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

    document.getElementById('tut-title').innerText = meta.name;

    const badge = document.getElementById('tut-domain-badge');
    badge.innerText = `${domain.name}`;
    badge.style.background = domain.color;

    const demoContainer = document.getElementById('tut-demo-container');
    const startBtn = document.getElementById('tut-start-btn');
    const skipBtn = document.getElementById('tut-skip-btn');
    
    demoContainer.style.display = 'block';
    demoContainer.innerHTML = '';
    
    startBtn.disabled = true;
    startBtn.innerText = 'اول تمرین رو کامل کن! 🚀';
    
    const enableStart = () => {
        startBtn.disabled = false;
        startBtn.innerText = '🚀 شروع بازی';
    };

    // دکمه شروع
    startBtn.onclick = () => {
        if (startBtn.disabled) return;
        playSound('click');
        const cb = _tutorialOnComplete;
        _tutorialOnComplete = null;
        if (cb) cb();
    };

    // دکمه رد کردن (Skip)
    skipBtn.onclick = () => {
        playSound('click');
        const cb = _tutorialOnComplete;
        _tutorialOnComplete = null;
        if (cb) cb();
    };

    // اجرای دموی تعاملی
    if (tut.demo) {
        tut.demo(demoContainer, enableStart);
    } else {
        enableStart();
    }
}
