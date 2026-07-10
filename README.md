# Distrito Goo · v16 Mobile Launcher + Espresso Hub Optimization

Versión: `v16-mobile-launcher-espresso-hub-optimization`

## Actualización

- Proyecto base: `Distrito_Goo-main.zip`.
- Nueva herramienta: **Espresso Hub**.
- Recurso integrado: `assets/tools/espresso-hub.jpeg`.
- Acceso configurado al portal oficial de Espresso Hub en SharePoint.

## Mejoras realizadas

- Card de Espresso Hub integrada en la categoría **Operación**, con imagen, descripción y acción de acceso.
- El enlace abre en una pestaña nueva mediante `noopener`.
- Se retiró del inicio el resumen visual redundante de Prioridades del día, Foco operativo, Actividad principal y Duty Roster.
- Se conservaron WFM, rutina diaria, actividad semanal y los módulos originales.
- Launcher móvil corregido con cinco espacios iguales, centrado, ancho adaptable y soporte `safe-area-inset-bottom`.
- Contraste reforzado en tarjetas, botones, fondos y estados activos.
- Assets duplicados sin referencias retirados; recursos activos conservados.
- Caché del service worker actualizado.

## Validaciones ejecutadas

- Sintaxis de módulos JavaScript y service worker validada.
- JSON de data y manifest validado.
- Rutas locales de HTML, JSON, JavaScript y service worker revisadas.
- Imagen Espresso Hub integrada y optimizada.
- Ningún archivo supera 20 MB.
- Ninguna carpeta contiene más de 100 archivos directos.
- Manifest, service worker, rutas relativas y estructura compatibles con GitHub Pages.

## Despliegue

Publicar el contenido del proyecto en la raíz de `EnriqueCesar/Distrito_Goo`, rama `main`, mediante GitHub Pages.


## v16.1.0 · Runtime fix

- Se corrigió `renderToday()` para tolerar la ausencia de elementos opcionales como `#today-date`.
- Se protegieron accesos DOM opcionales en módulos de operación, navegación, búsqueda, tarjetas y arranque.
- `loadData()` ahora identifica en consola la ruta exacta y la causa real cuando falla un JSON.
- Se validaron los siete archivos JSON v10 requeridos.
- Se conservó la integración de Espresso Hub, sus assets, categoría, búsqueda y enlace seguro.
- Se incrementaron los parámetros de versión de CSS y JavaScript a `v16.1.0`.
- Se actualizó el caché del service worker a `distrito-go-v16.1.0-runtime-fix` y se eliminan cachés anteriores durante `activate`.
- Se mantienen rutas relativas y compatibilidad con GitHub Pages/PWA.
