# Distrito Goo — Fase 3

## Resultado
- Apartado del District Coach retirado del Inicio.
- Hero `JUNTÉMONOS MÁS` centrado y ampliado para escritorio y móvil.
- Se conservaron herramientas, enlaces, filtros, navegación y datos operativos.
- Se eliminó la configuración, código, estilos y precaché exclusivos del perfil.
- El CMS desactiva `coach.name` y `coach.role`; el acceso `Celular DM` permanece activo como herramienta independiente.
- Service worker actualizado a `distrito-go-v19.0.0-phase-3`.

## Archivos eliminados
| Archivo | Motivo | Referencias revisadas | Impacto |
|---|---|---|---|
| `assets/photos/kike-dm.jpeg` | Recurso exclusivo de la tarjeta retirada | HTML, JS, JSON, SW, CSS | Reduce carga y caché sin afectar herramientas |
| `reports/FASE_2_RESUMEN.md` | Reporte sustituido por Fase 3 | README, BUILD, scripts | Sin impacto en runtime |
| `photos/` | Copias heredadas sin referencias; los equivalentes activos viven en `assets/photos/` | HTML, CSS, JS, JSON, CMS, SW | Elimina duplicados sin cambiar rutas activas |
| `logo/` | Copias heredadas sin referencias; los equivalentes activos viven en `assets/logo/` | HTML, CSS, manifest, SW | Elimina duplicados sin cambiar identidad activa |
| `assets/brand/distrito_kike.jpeg` | Duplicado exacto y sin referencias de `assets/logo/distrito_kike.jpeg` | Repositorio completo | Reduce archivos redundantes |
| `assets/photos/soporte-directo.jpg` | Configuración heredada sin consumo en runtime | HTML, JS, JSON, SW, CMS | Reduce carga y caché sin afectar soporte |

## Conservado por seguridad
- `Celular DM` en `Links`: acceso funcional independiente de la tarjeta.
- Datos `DM` en BT, SS, TBW y aniversarios: información operativa, no presentación del perfil.
