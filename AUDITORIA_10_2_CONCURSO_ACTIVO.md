# Auditoría Distrito Go 10.2 — Concurso Activo

## Validación principal
- Link validado en módulos activos: https://enriquecesar.github.io/concurso_venta/
- Visible desde la parte inicial con franja superior, hero, tarjeta de centro operativo, actividad diaria, evento y favorito.
- Vigencia corregida: 2026-07-03 a 2026-08-10.
- Maquila actualizada: `assets/photos/maquila_abril.png`.

## Limpieza
- Retirados módulos legacy no usados por `index.html`: carpetas `css/`, `js/`, `tools/`, `docs/`.
- Retiradas imágenes no referenciadas por HTML/CSS/JS/JSON/SW.
- Se conservan solo assets necesarios para PWA, Duty Roster, Informativo, Eventos, Hero y herramientas activas.

## Archivos críticos conservados
- `index.html`
- `modules/`
- `styles/`
- `data/*.v10.json`
- `assets/icons/icon-192.png`, `assets/icons/icon-512.png`
- `assets/photos/` e imágenes Duty referenciadas
- `manifest.json` y `sw.js`

## Depuración adicional
- Eliminados JSON legacy no cargados por `modules/state.js`.
- Eliminada carpeta duplicada `assets/duty/premium/`; se conserva `assets/duty/` como fuente activa del Duty Roster.
