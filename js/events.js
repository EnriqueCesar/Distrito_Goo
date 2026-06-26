import { esc, first, toDate } from './utils.js';
export function renderEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 const in15=new Date(today); in15.setDate(today.getDate()+15);
 const rows=(cms.eventos||[]).map(e=>({e,start:toDate(first(e,['Fecha Inicio','Inicio'])),end:toDate(first(e,['Fecha Fin','Fin'])||first(e,['Fecha Inicio','Inicio']),true)}))
  .filter(x=>x.end>=today).sort((a,b)=>{
    const aa=(today>=a.start&&today<=a.end)?0:(a.start<=in15?1:2);
    const bb=(today>=b.start&&today<=b.end)?0:(b.start<=in15?1:2);
    return aa-bb || a.start-b.start;
  }).slice(0,7);
 document.getElementById('events').innerHTML=rows.map(({e,start,end})=>{
  const active=today>=start&&today<=end;
  const soon=!active && start<=in15;
  const date= start.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}) + (start.toDateString()!==end.toDateString()?` – ${end.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}`:'');
  return `<article class="event ${active?'active':soon?'soon':''}"><span class="event-icon">${esc(first(e,['Imagen','Icono'])||'📌')}</span><div><div class="event-top"><h3>${esc(first(e,['Actividad']))}</h3><small>${active?'Hoy activo':soon?'Próximo':'Más adelante'}</small></div><p>${esc(first(e,['Contexto / Recordatorio','Contexto','Descripción']))}</p><small>${esc(date)}</small></div></article>`;
 }).join('') || '<p class="muted">Sin eventos próximos.</p>';
}
