const CACHE_NAME = 'distrito-go-v6-3';
const APP_SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/base.css',
  'css/layout.css',
  'css/cards.css',
  'css/modal.css',
  'css/responsive.css',
  'js/app.js',
  'js/apps.js',
  'js/cms.js',
  'js/duty.js',
  'js/events.js',
  'js/modal.js',
  'js/utils.js',
  'assets/logo/logo.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
