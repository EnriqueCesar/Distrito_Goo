# Distrito GO 5.1 NextGen

Proyecto modular listo para GitHub Pages.

## Orden de construcción 5.1
1. Core: Home, responsive, CMS y PWA.
2. Mi Día Operativo + WFM Inteligente.
3. Checks + Eventos inteligentes.
4. Talento: Altas BT/SS y TBW por prioridad.
5. Apps y buscador por categoría.
6. Duty Roster con detalle por día, estación y categoría.
7. Optimización final para GitHub Pages.

## Actualización mensual del CMS
1. Edita `Distrito_Go_CMS.xlsx`.
2. Exporta cada pestaña a JSON dentro de `/data`.
3. Sube el proyecto completo a GitHub Pages.

## Estructura
- `/data`: contenido operativo generado desde el CMS.
- `/js`: módulos separados por responsabilidad.
- `/css`: estilos base, layout, cards, modal y responsive.
- `/assets`: logo, íconos, fotos y recursos Duty Roster.

No se debe editar JavaScript para cambiar contenido operativo; el contenido vive en el CMS/JSON.
