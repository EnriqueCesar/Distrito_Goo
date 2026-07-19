# Distrito Goo — Fase 3

Distrito Goo continúa siendo una PWA 100% estática para GitHub Pages. Python se utiliza únicamente durante auditoría y compilación para validar el CMS y generar JSON; no forma parte del runtime ni requiere servidor.

## Arquitectura

- `index.html`, `styles/` y `modules/`: interfaz existente.
- `data/`: JSON estáticos consumidos por la aplicación.
- `tools/validate_cms.py`, `tools/build_data.py` y `tools/audit_links.py`: validan el CMS, generan JSON y producen auditorías reproducibles.
- `tools/audit_static.py`: valida JSON, rutas locales, IDs HTML y APP_SHELL.
- `.github/workflows/validate-static.yml`: control automático de sintaxis y estructura.
- `sw.js`: caché offline compatible con rutas relativas de GitHub Pages.

## Actualizar desde el CMS

```bash
python -m pip install -r requirements.txt
python tools/validate_cms.py /ruta/Distrito_Go_CMS.xlsx --report reports/cms-validation.json
python tools/build_data.py /ruta/Distrito_Go_CMS.xlsx --project .
python tools/audit_links.py /ruta/Distrito_Go_CMS.xlsx --report reports/link-audit.json
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

Después de publicar una nueva versión, abrir la PWA una vez con conexión para instalar la caché `distrito-go-v18.0.0-python-phase-2`.


## Fase 3
Inicio consolidado sin tarjeta del District Coach, PWA v19 y depuración segura de recursos exclusivos. Consulta `reports/FASE_3_RESUMEN.md`.
