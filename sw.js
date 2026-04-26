/* EMLA Portal — Service Worker — Cache-First for offline-first medical tool */

const CACHE_NAME = 'emla-v22-20260426';

const PRECACHE_URLS = [
  './',
  'index.html',
  'kalkulatory.html',
  'protokoly.html',
  'farmakologia.html',
  'karta-zlecen.html',
  'zalecenia-neurologiczne.html',
  'zgody-master.html',
  'transport-sanitarny.html',
  'centrum-urazowe.html',
  'chirurgia-dziecieca.html',
  'chirurgia-naczyniowa.html',
  'chirurgia-szczekowa.html',
  'choroba-dekompresyjna.html',
  'choroby-zakazne.html',
  'ciala-obce.html',
  'ciezka-hipotermia.html',
  'ecmo.html',
  'ginekologia.html',
  'hemodynamika-pci.html',
  'kardiochirurgia.html',
  'komory-hiperbaryczne.html',
  'masywna-pe.html',
  'neonatologia.html',
  'neurochirurgia.html',
  'okulistyka.html',
  'oparzenia.html',
  'plazmafereza.html',
  'psychiatria.html',
  'radiologia-interwencyjna.html',
  'replantacja.html',
  'toksykologia.html',
  'torakochirurgia.html',
  'transplantologia.html',
  'udar-trombektomia.html',
  'ukaszenie-zmiji.html',
  'urologia.html',
  'css/styles.css',
  'js/app.js',
  'js/radio.js',
  'data/stations.json',
  'manifest.json',
  'logo.png',
  'img/herb-szpitala.png',
  'data/leki_sor.json',
  'data/badania.json',
  'data/all-categories.json',
  'icons/icon.png',
  'icons/icon-32x32.png',
  'icons/icon-64x64.png',
  'icons/icon-128x128.png',
  'icons/icon-180x180.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  // 3D icons + backgrounds (Leonardo generated)
  'img/bg/space-01.webp', 'img/bg/space-02.webp', 'img/bg/space-03.webp', 'img/bg/space-04.webp',
  'img/bg/space-05.webp', 'img/bg/space-06.webp', 'img/bg/space-07.webp', 'img/bg/space-08.webp',
  'img/bg/landscape-01.webp', 'img/bg/landscape-02.webp', 'img/bg/landscape-03.webp', 'img/bg/landscape-04.webp',
  'img/bg/landscape-05.webp', 'img/bg/landscape-06.webp', 'img/bg/landscape-07.webp', 'img/bg/landscape-08.webp',
  'img/bg/helicopter-day.webp', 'img/bg/helicopter-night.webp',
  'img/video/helicopter-day.mp4', 'img/video/helicopter-night.mp4',
  'img/video/helicopter-day.webm', 'img/video/helicopter-night.webm'
];

/* Install — pre-cache all critical assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activate — clean up old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch — cache-first, fallback to network, then cache the response */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip Google Fonts — optional, system fonts are fallback */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return;
  }

  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        /* Don't cache opaque or error responses */
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      });
    })
  );
});
