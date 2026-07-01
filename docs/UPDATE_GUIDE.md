# Guía de actualización

Para futuras actualizaciones, mantener esta lógica:

- Raíz limpia: `index.html`, `manifest.json`, `sw.js`, `README.md` y carpetas principales.
- No guardar auditorías ni cambios temporales en raíz.
- Usar `docs/CHANGELOG.md` para el historial.
- Usar `tools/cms_to_json.py` para convertir el CMS Excel a JSON.
- Subir solo imágenes que estén referenciadas en `data/` o `js/`.
