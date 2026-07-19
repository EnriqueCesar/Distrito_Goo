# Build y despliegue — Fase 3

```bash
python -m pip install -r requirements.txt
python tools/validate_cms.py Distrito_Go_CMS.xlsx --report reports/cms-validation.json
python tools/build_data.py Distrito_Go_CMS.xlsx --project .
python tools/audit_links.py Distrito_Go_CMS.xlsx --report reports/link-audit.json
python tools/audit_static.py
find modules -name '*.js' -print0 | xargs -0 -n1 node --check
node --check sw.js
```

Publicar la raíz del repositorio desde `main` con **GitHub Pages · Deploy from a branch** y conservar `.nojekyll`. El service worker instala la nueva versión en espera y sólo se activa cuando el usuario selecciona **Actualizar**.
