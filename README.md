# Distrito Goo · v15 Starbucks Contrast Experience

Versión: `v15-starbucks-contrast-experience`

Mejora ligera sobre el proyecto actual para reforzar contraste, accesibilidad, navegación clara y experiencia ejecutiva tipo Starbucks Internal Tool.

## Fuente revisada

- Proyecto base: `Distrito_Goo-main.zip`
- CMS de validación: `Distrito_Go_CMS_corregido_v11.xlsx`
- Pestaña validada: `Actividades_Diaria`

## Ajustes realizados

- Paleta Starbucks corregida con mayor contraste: `#006241`, `#003D2B`, `#00754A`, `#DFF2EA`, `#F6F4EF`, blanco y texto oscuro.
- Saludo principal dinámico: Buenos días, Buenas tardes o Buenas noches Partner.
- Hero más corto: “Revisa tus prioridades, actividades críticas y accesos clave del día.”
- Información redundante reducida: fecha visible solo en el hero; se quitó el foco repetido de hashtags en tarjetas.
- WFM reforzado para lectura: fondo claro, texto oscuro, badges legibles y actividad del día visible.
- Actividades_Diaria ya muestra todas las actividades visibles del CMS, incluyendo “10 Pasos para un Turno Exitoso”.
- El acceso con URL `consulta.delivery.alsea.net` se muestra como acción “Abrir Consulta Delivery” sin crear una actividad nueva.
- Foto de Kike DM y acceso “Contactar DM” visibles de forma discreta en el hero.
- Categorías, herramientas, badges, cards y navegación móvil con contraste reforzado.
- Spotlight Search se conserva.
- PWA, manifest y service worker conservados.

## Validaciones realizadas

- `index.html`, CSS, JavaScript, módulos, assets, data, manifest, service worker y README auditados.
- `Distrito_Go_CMS_corregido_v11.xlsx` revisado: `Actividades_Diaria` contiene “10 Pasos para un Turno Exitoso” y el link `consulta.delivery.alsea.net` dentro de “Menu Core”.
- Sintaxis JavaScript validada con `node --check`.
- `manifest.json` validado como JSON.
- `sw.js` validado.
- Rutas locales referenciadas por HTML, JSON, JS y service worker verificadas.
- Assets clave verificados: foto DM, 10 pasos, Duty Roster, íconos PWA y recursos de campaña.
- Navegación principal y anclas esperadas verificadas en DOM.
- Ningún archivo supera 20 MB.

## Despliegue

Subir el contenido del ZIP a la raíz del repositorio `EnriqueCesar/Distrito_Goo` y publicar con GitHub Pages desde `main` / `/root`.
