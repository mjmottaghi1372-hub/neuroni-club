const CACHE_NAME = 'neuron-club-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
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
  './js/games/suitcase.js'
];

// منابع خارجی: با نسخه‌پین تا @latest هر بار کش رو خراب نکنه
const EXTERNAL_ASSETS = [
  'https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap'
];

// نصب: هر asset جدا کش می‌شه تا یکی خراب کل SW رو fail نکنه
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // core assets: باید موفق بشن، وگرنه SW نصب نمی‌شه
      await cache.addAll(CORE_ASSETS);
      // external: best effort — اگه فیل بشن نادیده بگیر
      await Promise.allSettled(
        EXTERNAL_ASSETS.map(url => cache.add(url).catch(() => console.warn('Skip cache:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// فعال‌سازی: کش‌های قدیمی پاک بشن
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

// استراتژی:
// - ناوبری (HTML): network-first، با fallback به کش
// - assetها: cache-first با background update
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // ناوبری: network-first
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // سایر: cache-first + background update
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});