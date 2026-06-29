# Distrito GO 6.6

Versión corregida con rutinas, eventos, links, actividades semanales, AutoICA y celebraciones por fecha actual.

Ver `CAMBIOS_APLICADOS.md` para el detalle.

# Distrito GO 6.5 Producción

Versión corregida para GitHub Pages.

## Qué se corrigió
- Error de sintaxis en `js/app.js` que detenía la carga de Mi Día Operativo, Eventos y Herramientas.
- CMS regenerado desde `Distrito_Go_CMS(17).xlsx` hacia archivos JSON en `/data`.
- Versionado actualizado a `v=6.6.0` para forzar actualización en navegador.
- Service Worker actualizado a `distrito-go-v6-6-0` y con estrategia `no-store`.
- Sin archivos `.txt` de auditoría.

## Cómo actualizar a futuro
1. Edita el Excel CMS.
2. Convierte cada pestaña a su JSON correspondiente dentro de `/data`.
3. Sube el proyecto completo a GitHub.
4. Cambia la versión en `index.html`, `js/app.js` y `sw.js` cuando haya cambios importantes.

## Archivos clave
- `index.html`: estructura principal.
- `js/app.js`: render principal.
- `js/cms.js`: rutas de JSON.
- `/data`: información editable del CMS.
- `sw.js`: control de caché.
