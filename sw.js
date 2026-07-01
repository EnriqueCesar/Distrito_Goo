const CACHE_NAME = 'distrito-go-x-entrega-3-v10-0-3';
const APP_SHELL = [
  "./",
  "./index.html",
  "./README.md",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./data/actividades-diarias.v10.json",
  "./data/actividades-semanales.v10.json",
  "./data/altas-curso.v10.json",
  "./data/categorias.v10.json",
  "./data/checklist-apertura.v10.json",
  "./data/config.v10.json",
  "./data/dashboard.v10.json",
  "./data/duty-detail.v10.json",
  "./data/duty-roster.v10.json",
  "./data/eventos.v10.json",
  "./data/favoritos.v10.json",
  "./data/herramientas.v10.json",
  "./data/operacional.v10.json",
  "./data/version.v10.json",
  "./manifest.json",
  "./modules/app.js",
  "./modules/cards.js",
  "./modules/components.js",
  "./modules/data.js",
  "./modules/native-apps.js",
  "./modules/navigation.js",
  "./modules/operational.js",
  "./modules/pwa.js",
  "./modules/quick-actions.js",
  "./modules/search.js",
  "./modules/state.js",
  "./modules/storage.js",
  "./modules/toast.js",
  "./modules/utils.js",
  "./styles/app.css",
  "./styles/variables.css"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  if(request.mode === 'navigate'){
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if(response && response.ok){
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => cached)));
});
