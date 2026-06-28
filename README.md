# Distrito GO 6.3 Producción

Versión limpia para GitHub Pages.

## Qué subir
Sube únicamente estas carpetas y archivos:

- `index.html`
- `manifest.json`
- `sw.js`
- `css/`
- `js/`
- `data/`
- `assets/`
- `README.md`

No es necesario subir archivos `.txt` de auditoría o notas.

## Dónde actualizar información

| Necesidad | Archivo |
|---|---|
| Eventos, nómina, AutoICA, campañas | `data/eventos.json` |
| Herramientas / links | `data/links.json` |
| WFM y actividades semanales | `data/actividades_semanales.json` |
| Rutinas diarias | `data/actividades_diarias.json` |
| Duty por día e imágenes | `data/duty_roster.json` |
| Resumen operativo Duty | `data/duty_detail.json` |

## Reglas de mantenimiento

1. No duplicar módulos en Home. Home solo presenta saludo, DM y accesos.
2. Mi Día Operativo concentra alertas, eventos vigentes, WFM, rutina y Duty.
3. Las fechas se controlan desde el CMS; no cambiar fechas en el código.
4. Para agregar una imagen Duty, colocarla en `assets/duty/premium/` y referenciar el nombre exacto en `data/duty_roster.json`.
5. Para actualizar datos, cambiar únicamente archivos dentro de `data/`.
6. Después de subir cambios a GitHub, actualizar la página con Ctrl + F5 si el navegador conserva caché.

## Caché

Los JSON se cargan con estrategia Network First para que los cambios del CMS aparezcan sin esperar una nueva versión de la app.
