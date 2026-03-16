/* sw.js — PIXELPET service worker */
var CACHE_NAME = 'pixelpet-v1';

/* Core app shell — always cache on install */
var CORE_ASSETS = [
  '/pixelpet/',
  '/pixelpet/index.html',
  '/pixelpet/sprites.js',
  '/pixelpet/manifest.json'
];

/* Sprite PNGs — cached on first fetch (may not exist at install time) */
var SPRITE_NAMES = [
  'egg',
  'baby_a', 'baby_b',
  'child_a', 'child_b',
  'teen_a', 'teen_b',
  'adult_a', 'adult_b',
  'sleeping', 'sick', 'dead',
  'happy', 'hungry', 'play', 'feed'
];
var SPRITE_ASSETS = SPRITE_NAMES.map(function (n) { return '/sprites/' + n + '.png'; });

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      /* Cache core shell; ignore failures for individual files */
      return Promise.allSettled(
        CORE_ASSETS.map(function (url) {
          return cache.add(url).catch(function () { /* ignore */ });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;

  /* Network-first for API calls */
  if (url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* Cache-first for core assets + sprites */
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;

      return fetch(e.request).then(function (response) {
        if (!response || !response.ok) return response;

        /* Cache sprites and core assets as they are fetched */
        var shouldCache =
          CORE_ASSETS.some(function (a) { return url.endsWith(a); }) ||
          SPRITE_ASSETS.some(function (a) { return url.endsWith(a); });

        if (shouldCache) {
          var cloned = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, cloned);
          });
        }

        return response;
      }).catch(function () {
        /* Offline fallback — return cached index.html for navigation */
        if (e.request.mode === 'navigate') {
          return caches.match('/pixelpet/index.html');
        }
      });
    })
  );
});
