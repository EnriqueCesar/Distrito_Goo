# Distrito Go · v16.2 Visual Accessibility Refinement

Versión funcional refinada sobre el proyecto existente, sin cambio de arquitectura ni eliminación de lógica.

## Ajustes incluidos

- WFM con texto oscuro, superficies claras, jerarquía visual y cards internas legibles.
- Categorías con contraste accesible, badge de herramientas, hover, selección activa y foco por teclado.
- Portada simplificada: se ocultan los mensajes iniciales redundantes de herramientas y filtros, conservando Spotlight y la lógica de filtrado.
- Card del DM reducida a fotografía, nombre y acceso a WhatsApp; la fotografía también abre el enlace configurado.
- Navegación y tarjetas con estados de foco visibles, transiciones breves y soporte para `prefers-reduced-motion`.
- Ajustes responsive para escritorio, tablet, Android, iPhone y modo standalone/PWA.
- Corrección de un identificador HTML duplicado en el cierre del informativo Bearista.
- Caché del service worker actualizado a `distrito-go-v16.2.0-visual-accessibility-refinement`.

## Fuente CMS

`Distrito_Go_CMS_corregido_v12.xlsx`

## Despliegue en GitHub Pages

1. Publica el contenido de esta carpeta en la raíz de la rama configurada para Pages.
2. Conserva `.nojekyll`.
3. No cambies las rutas relativas `./` del manifest, módulos, datos o assets.
4. Después de desplegar, abre la aplicación una vez con conexión para instalar la nueva caché v16.2.

## Validaciones locales ejecutadas

- Sintaxis JavaScript de todos los módulos y `sw.js`.
- JSON válido en `data/` y `manifest.json`.
- Rutas locales referenciadas por HTML, CSS, JavaScript, manifest y service worker.
- IDs HTML sin duplicados.
- Estructura de manifest y service worker conservada para GitHub Pages/PWA.

Las pruebas que requieren un navegador o dispositivo real deben repetirse en el entorno de despliegue para confirmar instalación PWA y comportamiento específico del sistema operativo.
