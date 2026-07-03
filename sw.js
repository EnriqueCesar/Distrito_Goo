const CACHE_NAME = 'distrito-go-v10-3-1-premium-mundialista';
const APP_SHELL = [
  "./",
  "./index.html",
  "./data/categorias.v10.json",
  "./data/herramientas.v10.json",
  "./data/favoritos.v10.json",
  "./data/dashboard.v10.json",
  "./data/config.v10.json",
  "./data/version.v10.json",
  "./data/operacional.v10.json",
  "./data/informativo.v10.json",
  "./data/eventos.v10.json",
  "./data/actividades-diarias.v10.json",
  "./data/actividades-semanales.v10.json",
  "./data/duty-roster.v10.json",
  "./data/duty-detail.v10.json",
  "./data/checklist-apertura.v10.json",
  "./data/altas-curso.v10.json",
  "./modules/utils.js",
  "./modules/storage.js",
  "./modules/state.js",
  "./modules/data.js",
  "./modules/toast.js",
  "./modules/native-apps.js",
  "./modules/components.js",
  "./modules/cards.js",
  "./modules/search.js",
  "./modules/navigation.js",
  "./modules/quick-actions.js",
  "./modules/pwa.js",
  "./modules/app.js",
  "./modules/operational.js",
  "./styles/variables.css",
  "./styles/app.css",
  "./assets/icons/icon-72.png",
  "./assets/icons/icon-96.png",
  "./assets/icons/icon-128.png",
  "./assets/icons/icon-144.png",
  "./assets/icons/icon-152.png",
  "./assets/icons/icon-180.png",
  "./assets/icons/icon-384.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/photos/kike-dm.jpeg",
  "./assets/photos/soporte-directo.jpg",
  "./assets/photos/Rutina_apertura.jpeg",
  "./assets/photos/10-pasos-turno.png",
  "./assets/photos/store-walk.png",
  "./assets/photos/verificacion-cafe-espresso.png",
  "./assets/photos/cdd_3Q_2026.png",
  "./assets/photos/pinpad-atb-cambios.png",
  "./assets/photos/hugo-barista-champion.jpeg",
  "./assets/photos/limpieza_back.jpeg",
  "./assets/photos/concurso_venta_dona_julio.jpeg",
  "./assets/photos/cortado_leche.jpeg",
  "./assets/photos/maquila_abril.png",
  "./assets/photos/ysisi.jpeg",
  "./assets/photos/y-si-si-inicio.jpeg",
  "./assets/duty/domingo_drive_thru.png",
  "./assets/duty/domingo_lobby.png",
  "./assets/duty/jueves_espresso.png",
  "./assets/duty/jueves_lobby.png",
  "./assets/duty/lunes_food.png",
  "./assets/duty/lunes_showcase.png",
  "./assets/duty/martes_lobby.png",
  "./assets/duty/martes_pic.png",
  "./assets/duty/miercoles_boh.png",
  "./assets/duty/sabado_cbs.png",
  "./assets/duty/viernes_cafe_filtrado.png",
  "./manifest.json",
  "./README.md"
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
