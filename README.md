# Distrito Go v10.3.3 Audit Optimizada

Versión lista para GitHub Pages desde `main` / `/root`.

## Cambios aplicados
- Se conservó la experiencia actual: navegación, módulos, datos, filtros, PWA, manifest, service worker, assets activos e informativos.
- Se auditó la estructura activa del proyecto y se retiraron carpetas no conectadas de la versión en producción (`css/`, `js/`, `docs/`, `tools/`) para evitar redundancia.
- Se mantuvieron únicamente los JSON v10 que alimentan la app modular actual.
- Se limpiaron assets no referenciados y se conservaron los recursos usados por `index.html`, `manifest.json`, `sw.js`, módulos y datos activos.
- Se agregó `.nojekyll` en raíz.
- Se actualizó `manifest.json` con `start_url: "./"`, `scope: "./"` y `display: "standalone"`.
- Se actualizó el cache del service worker a `distrito-go-v10-3-3-audit-optimizacion`.
- Se agregaron accesos rápidos en el hero para mejorar navegación sin romper la estructura actual.

## Estructura final
- `index.html`
- `manifest.json`
- `sw.js`
- `.nojekyll`
- `README.md`
- `styles/`
- `modules/`
- `data/`
- `assets/`

## Publicación
Configurar GitHub Pages en branch `main` y folder `/root`.

Commit sugerido: `Audit and optimize Distrito Goo structure`
