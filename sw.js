const CACHE = 'distritogoo-v5-2-warm-20260626';
const ASSETS = [
  './','index.html','manifest.json',
  'css/base.css','css/layout.css','css/cards.css','css/modal.css','css/responsive.css',
  'js/app.js','js/cms.js','js/utils.js','js/modal.js','js/duty.js','js/events.js','js/apps.js','js/talent.js',
  'data/config.json','data/wfm.json','data/bt.json','data/ss.json','data/tbw.json','data/links.json','data/eventos.json','data/actividades_semanales.json','data/actividades_diarias.json','data/duty_roster.json','data/duty_detail.json','data/checklist_apertura.json','data/birthdays.json','data/anniversaries.json',
  'assets/logo/logo.svg','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/photos/kike-dm.jpeg','assets/photos/store-walk.png','assets/photos/10-pasos-turno.png','assets/photos/verificacion-cafe-espresso.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});
