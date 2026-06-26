import { esc, first } from './utils.js';
function toDate(v, end=false){ const d=new Date(v||'1900-01-01'); if(end)d.setHours(23,59,59,999); else d.setHours(0,0,0,0); return d; }
export function renderEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 const rows=(cms.eventos||[]).map(e=>({e,start:toDate(first(e,['Fecha Inicio','Inicio'])),end:toDate(first(e,['Fecha Fin','Fin'])||first(e,['Fecha Inicio','Inicio']),true)}))
  .filter(x=>x.end>=today).sort((a,b)=>a.start-b.start).slice(0,8);
 document.getElementById('events').innerHTML=rows.map(({e,start,end})=>{
  const active=today>=start&&today<=end;
  const date= start.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}) + (start.toDateString()!==end.toDateString()?` – ${end.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}`:'');
  return `<article class="event ${active?'active':''}"><span class="event-icon">${esc(first(e,['Imagen','Icono'])||'📌')}</span><div><h3>${esc(first(e,['Actividad']))}</h3><p>${esc(first(e,['Contexto / Recordatorio','Contexto','Descripción']))}</p><small>${esc(date)} · ${active?'Activo':'Próximo'}</small></div></article>`;
 }).join('') || '<p class="muted">Sin eventos próximos.</p>';
}
