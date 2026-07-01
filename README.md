# Distrito GO

Asistente Operativo Diario · versión 7.2.0 Producción Limpia.

## Estructura limpia

```text
assets/    Recursos visuales activos: brand, duty, icons, photos
css/       Estilos por responsabilidad
data/      JSON generado desde el CMS
docs/      Historial y guía de actualización
js/        Módulos funcionales
tools/     Utilidad para convertir CMS Excel a JSON
```

## Flujo recomendado

1. Actualizar `Distrito_Go_CMS.xlsx`.
2. Ejecutar `tools/cms_to_json.py` para regenerar `data/`.
3. Subir a GitHub Pages.
4. Hacer recarga dura en navegador o esperar actualización del Service Worker.

## Versión 7.2.0

- Limpieza de raíz: solo queda `README.md` en la raíz como documentación principal.
- Recursos visuales depurados: se eliminaron imágenes y carpetas no usadas.
- Datos regenerados desde el CMS 26.
- Evento CDD Q3 destacado y registrado en agenda.
- Inventario TPV / Pin Pads sin duplicados.
- Altas en Curso BT/SS del 1 al 25 de julio.
- Cache actualizado a `distrito-go-v7-2-0`.
