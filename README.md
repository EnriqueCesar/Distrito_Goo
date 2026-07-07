# Distrito Go v11 LaunchPad Premium

Versión funcional enfocada en una experiencia más limpia para uso diario del District Manager.

## Cambios principales

- Pantalla principal simplificada con Categorías como punto central de navegación.
- Favoritos y Recientes retirados de la vista principal para reducir saturación.
- Nueva app Transferencias integrada en la categoría Operación.
- Duty Roster Premium integrado desde `premium.zip` en `assets/premium/duty-roster/`.
- Duty Roster muestra automáticamente las imágenes correspondientes al día actual.
- Las imágenes del Duty Roster abren su recurso en nueva pestaña.
- Concurso de Venta rediseñado con vista ejecutiva: concurso activo, vigencia, avance y botón de ranking.
- CMS actualizado únicamente para registrar la nueva app Transferencias.
- PWA, rutas relativas y compatibilidad con GitHub Pages conservadas.

## Archivos de datos activos

La app consume los JSON versionados definidos en `modules/state.js`:

- `data/config.v10.json`
- `data/categorias.v10.json`
- `data/herramientas.v10.json`
- `data/dashboard.v10.json`
- `data/favoritos.v10.json`
- `data/version.v10.json`
- `data/operacional.v10.json`

## Duty Roster Premium

Las imágenes premium quedan en:

`assets/premium/duty-roster/`

La selección del día se realiza automáticamente con la fecha local del navegador:

- Lunes: Food / Show Case
- Martes: PIC / Lobby
- Miércoles: BOH
- Jueves: Espresso / Lobby
- Viernes: Café Filtrado
- Sábado: CBS
- Domingo: Lobby / Drive Thru

## Validaciones realizadas

- Proyecto auditado antes de modificar.
- JSON activos actualizados sin cambiar arquitectura.
- PWA y Service Worker conservados.
- Manifest validado como JSON.
- Assets premium copiados y referenciados.
- Nueva app Transferencias agregada al catálogo y CMS.
- Favoritos y Recientes retirados de la interfaz principal.
- Rutas locales referenciadas validadas.
- Ningún archivo supera 20 MB.
- ZIP final generado para GitHub Pages.

## Despliegue en GitHub Pages

Subir el contenido del proyecto a la rama configurada para Pages, respetando la raíz del repositorio. El proyecto usa rutas relativas y mantiene `.nojekyll`.
