# Distrito Go v12 Green Apron Dashboard

Versión funcional enfocada en diseño, experiencia de usuario y limpieza visual para uso diario del District Manager.

## Objetivo

Elevar Distrito Go como un dashboard operativo más limpio, ejecutivo e intuitivo sin rehacer la arquitectura ni romper la compatibilidad existente con GitHub Pages y PWA.

## Cambios principales

- **Mi día operativo** queda como prioridad visual después del encabezado principal.
- Se agregó una franja de enfoque diario con `#GreenApronService`, `#DistritoKike🚀` y `#OrgulloCN`.
- Navegación ajustada a estilo **Corporate Monoline Sidebar** en escritorio y navegación inferior en móvil.
- Actividades del Día, WFM y Duty Roster tienen mayor jerarquía visual.
- Herramientas disponibles se mantienen por categorías con búsqueda y filtros menos invasivos.
- Se agregó control para mostrar u ocultar filtros de herramientas.
- Tarjetas rediseñadas con más espacio en blanco, bordes uniformes y menos saturación visual.
- Duplicados antiguos de Duty Roster retirados; se conserva la ruta activa `assets/premium/duty-roster/`.
- Concurso de Venta conserva presentación ejecutiva con acceso directo al ranking.
- Duty Roster Premium, imágenes y enlaces existentes se conservaron.
- Favoritos y Recientes continúan fuera de la vista principal.
- No se modificó el CMS porque la estructura actual ya estaba alineada.

## Data activa

La aplicación sigue consumiendo los JSON definidos en `modules/state.js`:

- `data/config.v10.json`
- `data/categorias.v10.json`
- `data/herramientas.v10.json`
- `data/dashboard.v10.json`
- `data/favoritos.v10.json`
- `data/version.v10.json`
- `data/operacional.v10.json`

## CMS

Archivo validado como referencia:

- `Distrito_Go_CMS_corregido_v11.xlsx`

No fue necesario generar `Distrito_Go_CMS_corregido_v12.xlsx` porque esta versión no cambia hojas, encabezados, relaciones ni estructura de datos.

El Excel no se incluye dentro del ZIP final del proyecto.

## PWA y GitHub Pages

- `manifest.json` conservado y validado.
- `sw.js` actualizado a cache `distrito-go-v12-green-apron-dashboard`.
- Rutas relativas conservadas.
- `.nojekyll` conservado.
- Compatible con despliegue en GitHub Pages desde la raíz del repositorio.

## Validaciones realizadas

- Proyecto descomprimido y auditado.
- `index.html`, CSS, módulos JS, data, assets, manifest y service worker revisados.
- Sintaxis JS validada en módulos y `sw.js`.
- JSON activos validados.
- Manifest validado como JSON.
- Service Worker validado con rutas locales existentes.
- Rutas locales de HTML, data y SW revisadas.
- Assets referenciados por la app existen.
- Mi día operativo aparece como prioridad visual.
- Actividades del Día se conservan y tienen presentación prioritaria.
- Herramientas siguen funcionando mediante categorías y búsqueda.
- Filtros pueden ocultarse o mostrarse.
- Sidebar Corporate Monoline aplicado en escritorio.
- Navegación móvil conservada.
- PWA y GitHub Pages conservados.
- Ningún archivo supera 20 MB.
- El ZIP final no incluye el Excel CMS.

## Despliegue

Subir el contenido del ZIP a la rama configurada para GitHub Pages del repositorio `EnriqueCesar/Distrito_Goo`.

