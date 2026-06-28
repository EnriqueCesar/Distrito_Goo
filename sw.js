const CACHE_NAME = 'distrito-go-6-2-final';
const APP_SHELL = ['.', 'index.html', 'manifest.json', 'css/base.css', 'css/layout.css', 'css/cards.css', 'css/modal.css', 'css/responsive.css', 'js/app.js', 'js/cms.js', 'js/utils.js', 'assets/logo/logo.svg', 'assets/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    e.respondWith(fetch(e.request).then(r => { const clone = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
