const CACHE_NAME = 'distrito-go-x-entrega-1-v10';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './styles/variables.css',
  './styles/app.css',
  './modules/app.js',
  './data/config.v10.json',
  './data/categorias.v10.json',
  './data/herramientas.v10.json',
  './data/dashboard.v10.json',
  './data/favoritos.v10.json',
  './data/version.v10.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  event.respondWith(
    fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});
