# Hero JUNTÉMONOS MÁS · validación técnica

- Alcance: únicamente Hero principal, configuración de identidad y versión de caché PWA.
- Contenido: saludo, campaña, hashtags, recorrido, mensaje distrital y etiquetas de acciones consumidos desde `data/identity.json`.
- Funcionalidad preservada: los botones mantienen `start-day` y `open-tools-panel`, con sus manejadores y destinos originales.
- Fecha: local del dispositivo, formato español de México, reloj de 12 horas y actualización cada minuto.
- Interfaz: cuatro pasos horizontales en escritorio, dos columnas en móvil y una columna en pantallas estrechas; sin scroll horizontal.
- PWA: shell intacto, `identity.json` ya incluido para uso offline y caché incrementada a `v19.1.0-hero`.
- Validaciones: JSON válido, JavaScript válido, auditoría estática sin errores ni advertencias y rutas del CMS auditadas.
