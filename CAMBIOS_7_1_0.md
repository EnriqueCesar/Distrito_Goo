# Distrito GO 7.1.0 · Actualización Altas y CDD

## Ajustes aplicados

1. **Inventarios TPV / Pin Pads**
   - Se eliminó el duplicado de evento con texto corto.
   - Queda activo únicamente el evento detallado: `Inventario TPV y Pin Pads Q3`.
   - Se aplicó el mismo criterio para Q4 para evitar duplicidad futura.

2. **Conversaciones de Desempeño y Desarrollo Q3**
   - Se agregó evento del **1 de julio al 2 de agosto**.
   - Se integró la imagen `cdd_3Q_2026.png` como tarjeta destacada en Home.
   - El evento también aparece dentro de Agenda con categoría **Desarrollo**.

3. **Altas en Curso BT / SS**
   - Nuevo apartado en Home.
   - Lee información desde `data/bt.json` y `data/ss.json`.
   - Se muestra únicamente del **1 al 25 de julio**.
   - Diseño discreto, enfocado y no invasivo.

4. **Logo superior**
   - Se sustituyó el logo anterior por `distrito_kike.jpeg` en el encabezado.

5. **WFM**
   - Se limpió el copy para evitar repetición.
   - Ahora muestra actividad de hoy, semana en planeación, rango y siguiente paso.

## Archivos principales modificados

- `index.html`
- `js/app.js`
- `js/events.js`
- `css/cards.css`
- `data/eventos.json`
- `assets/photos/cdd_3Q_2026.png`
- `assets/logo/distrito_kike.jpeg`
