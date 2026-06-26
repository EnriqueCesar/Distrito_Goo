import { esc, first, toDate } from './utils.js';
function labelFor(start,end,today){
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in30=new Date(today); in30.setDate(today.getDate()+30);
  if(today>=start&&today<=end) return ['Hoy activo','active'];
  if(start<=in7) return ['Esta semana','soon'];
  if(start<=in30) return ['Próximo','next'];
  return ['Más adelante','future'];
}
function dateRange(start,end){
  const fmt=x=>x.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','');
  return fmt(start)+(start.toDateString()!==end.toDateString()?` – ${fmt(end)}`:'');
}
export function renderEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 const rows=(cms.eventos||[]).map(e=>({
   e,
   start:toDate(first(e,['Fecha Inicio','Inicio'])),
   end:toDate(first(e,['Fecha Fin','Fin'])||first(e,['Fecha Inicio','Inicio']), true)
 })).filter(x=>x.end>=today).sort((a,b)=>{
    const [la]=labelFor(a.start,a.end,today), [lb]=labelFor(b.start,b.end,today);
    const rank={'Hoy activo':0,'Esta semana':1,'Próximo':2,'Más adelante':3};
    return rank[la]-rank[lb] || a.start-b.start;
 }).slice(0,12);
 const grouped={active:[],soon:[],next:[],future:[]};
 rows.forEach(x=>grouped[labelFor(x.start,x.end,today)[1]].push(x));
 const groupTitle={active:'🔥 Activos ahora',soon:'📅 Esta semana',next:'✨ Próximos',future:'🗓️ Más adelante'};
 const html=Object.entries(grouped).filter(([,arr])=>arr.length).map(([k,arr])=>`<div class="event-group"><h3>${groupTitle[k]}</h3>${arr.map(({e,start,end})=>{
  const [label,cls]=labelFor(start,end,today);
  return `<article class="event ${cls}"><span class="event-icon">${esc(first(e,['Imagen','Icono'])||'📌')}</span><div><div class="event-top"><h4>${esc(first(e,['Actividad']))}</h4><small>${esc(label)}</small></div><p>${esc(first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']))}</p><small>${esc(dateRange(start,end))}</small></div></article>`;
 }).join('')}</div>`).join('');
 document.getElementById('events').innerHTML=html || '<p class="muted">Sin eventos próximos.</p>';
}
