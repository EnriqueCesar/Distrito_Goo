# Distrito GO 6.4 Producción

Versión enfocada en operación diaria, actualización limpia por CMS y GitHub Pages.

## Para actualizar información

1. Edita el Excel `Distrito_Go_CMS.xlsx`.
2. Convierte las hojas a JSON dentro de `/data`.
3. Sube a GitHub reemplazando archivos existentes.
4. Espera 1–3 minutos a GitHub Pages.
5. En Chrome usa `Ctrl + Shift + R` o DevTools > Application > Clear site data si aún ves versión anterior.

## Hojas CMS conectadas

- `Links` → `data/links.json`
- `Eventos` → `data/eventos.json`
- `Actividades_Semanales` → `data/actividades_semanales.json`
- `Actividades_Diaria` → `data/actividades_diarias.json`
- `Duty_Roster` → `data/duty_roster.json`
- `Duty_Detail` → `data/duty_detail.json`
- `BT` → `data/bt.json`
- `SS` → `data/ss.json`
- `TBW` → `data/tbw.json`
- `Checklist_Apertura` → `data/checklist_apertura.json`

## Importante

GitHub Pages no lee directamente archivos `.xlsx`. La app consume archivos `.json` en `/data`.
Por eso, cuando cambies el Excel, también debes regenerar y subir los JSON.

## Estructura recomendada

- `index.html`
- `/css`
- `/js`
- `/data`
- `/assets`
- `manifest.json`
- `sw.js`
- `README.md`

No son necesarios archivos `.txt` de auditoría o notas.
