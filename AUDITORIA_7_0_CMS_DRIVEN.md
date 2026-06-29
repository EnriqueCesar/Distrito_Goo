# Auditoría Distrito GO 7.0 CMS Driven

## Actualización aplicada

- Links: 35 registros → data/links.json
- Eventos: 50 registros → data/eventos.json
- Actividades_Semanales: 15 registros → data/actividades_semanales.json
- Actividades_Diaria: 6 registros → data/actividades_diarias.json
- Duty_Roster: 7 registros → data/duty_roster.json
- Duty_Detail: 57 registros → data/duty_detail.json
- BT: 6 registros → data/bt.json
- SS: 1 registros → data/ss.json
- TBW: 19 registros → data/tbw.json
- Checklist_Apertura: 10 registros → data/checklist_apertura.json
- Imagen OK: assets/photos/hugo-barista-champion.jpeg
- Imagen OK: assets/photos/maquila_abril.png
- Imagen OK: assets/photos/10-pasos-turno.png
- Imagen OK: assets/photos/acceso_ubits.jpeg

## Reglas corregidas

- Motor de fechas local: `YYYY-MM-DD` ya no se recorre por zona horaria.
- Eventos vigentes: `Fecha Inicio <= hoy <= Fecha Fin`.
- Agenda: conserva Fecha Inicio y Fecha Fin visibles sin alterar vigencia.
- Corte de Nómina: abre Oracle HCM desde alerta crítica.
- AutoICA: abre ICA solo cuando el evento está vigente en CMS.
- Pagos Especiales: abre SharePoint directo desde el evento.
- Limpieza Backs: queda informativo, sin link forzado.
- Barista Champion: muestra `hugo-barista-champion.jpeg`.
- Maquila: informativo con `maquila_abril.png`.
- Duty Roster lunes: queda únicamente Food.
- Cumpleaños y aniversarios: semana actual lunes a domingo.
- Caché: actualizado a `distrito-go-v7-0-0`.
