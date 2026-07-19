# Distrito Goo · Fase 1 Python

Distrito Goo continúa siendo una PWA 100% estática para GitHub Pages. Python se utiliza únicamente durante auditoría y compilación para validar el CMS y generar JSON; no forma parte del runtime ni requiere servidor.

## Arquitectura

- `index.html`, `styles/` y `modules/`: interfaz existente.
- `data/`: JSON estáticos consumidos por la aplicación.
- `tools/cms_pipeline.py`: valida pestañas y encabezados del CMS y genera los JSON.
- `tools/audit_static.py`: valida JSON, rutas locales, IDs HTML y APP_SHELL.
- `.github/workflows/validate-static.yml`: control automático de sintaxis y estructura.
- `sw.js`: caché offline compatible con rutas relativas de GitHub Pages.

## Actualizar desde el CMS

```bash
python -m pip install -r requirements.txt
python tools/cms_pipeline.py /ruta/Distrito_Go_CMS.xlsx --project .
python tools/audit_static.py
```

El pipeline lee por nombre de pestaña y encabezado. Detiene la generación cuando falta una pestaña o encabezado obligatorio y nunca depende de posiciones fijas de columnas.

## Validación antes de publicar

```bash
find modules -name '*.js' -print0 | xargs -0 -n1 node --check
node --check sw.js
python tools/audit_static.py
```

## GitHub Pages

Publicar el contenido de la raíz de `main` mediante **Deploy from a branch**. Conservar `.nojekyll`, las rutas relativas `./` y todos los archivos incluidos en `APP_SHELL`.

Después de publicar una nueva versión, abrir la PWA una vez con conexión para instalar la caché `distrito-go-v17.0.0-python-phase-1`.
