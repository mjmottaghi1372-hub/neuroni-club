const CACHE_NAME = 'neuron-club-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/storage.js',
  './js/state.js',
  './js/core.js',
  './js/tutorial.js',
  './js/engine.js',
  './js/navigation.js',
  './js/app.js',
  './js/games/stroop.js',
  './js/games/numhunt.js',
  './js/games/wordhunt.js',
  './js/games/shapehunt.js',
  './js/games/memory.js',
  './js/games/symboldiff.js',
  './js/games/scattermem.js',
  './js/games/riverranger.js',
  './js/games/speedmatch.js',
  './js/games/suitcase.js',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap'
];

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// فعال‌سازی و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// استراتژی آفلاین: اول از کش بخوان، بعد برو سراغ اینترنت
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
