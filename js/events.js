import { esc, first, toDate, normalize } from './utils.js';

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let state = { month:'Todos', type:'Todos' };

export function eventType(e){
  const txt = normalize(`${first(e,['Actividad'])} ${first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion'])}`);
  if(txt.includes('autoica') || txt.includes('ica')) return 'AutoICA';
  if(txt.includes('corte de nomina') || txt.includes('nomina')) return 'Nómina';
  if(txt.includes('campana') || txt.includes('summer') || txt.includes('platform') || txt.includes('rewards') || txt.includes('promocion')) return 'Campañas';
  if(txt.includes('attensi') || txt.includes('recertificacion') || txt.includes('webinar') || txt.includes('seminario') || txt.includes('mujeres')) return 'Capacitación';
  if(txt.includes('coffee') || txt.includes('cafe')) return 'Coffee';
  if(txt.includes('inventario') || txt.includes('pin pad') || txt.includes('tpv')) return 'Inventarios';
  if(txt.includes('talent') || txt.includes('best talent')) return 'Talent';
  return 'Otros';
}

export function normalizeEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 return (cms.eventos||[]).map(e=>({
   e,
   start:toDate(first(e,['Fecha Inicio','Inicio'])),
   end:toDate(first(e,['Fecha Fin','Fin'])||first(e,['Fecha Inicio','Inicio']), true),
   type:eventType(e)
 })).filter(x=>x.end>=today).sort((a,b)=>a.start-b.start);
}

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
function isPayroll(e){ return normalize(first(e,['Actividad'])).includes('corte de nomina'); }
function payrollAlert(start,end,today){
  const endDay = new Date(end); endDay.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if(today.getTime()===endDay.getTime()) return `<div class="payroll-alert today"><strong>🚨 HOY · Corte de Nómina</strong><span>Realiza el cierre antes de las 09:00 AM.</span></div>`;
  if(tomorrow.getTime()===endDay.getTime()) return `<div class="payroll-alert tomorrow"><strong>⏰ Mañana · Corte de Nómina</strong><span>Prepara incidencias para cierre 09:00 AM.</span></div>`;
  return '';
}
function eventCard({e,start,end,type},today){
  const [label,cls]=labelFor(start,end,today);
  return `<article class="event ${cls}" data-type="${esc(type)}">
    <span class="event-icon">${esc(first(e,['Imagen','Icono'])||'📌')}</span>
    <div><div class="event-top"><h4>${esc(first(e,['Actividad']))}</h4><small>${esc(label)}</small></div>
    <p>${esc(first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']))}</p>
    <div class="event-meta"><small>${esc(dateRange(start,end))}</small><small>${esc(type)}</small></div>
    ${isPayroll(e)?payrollAlert(start,end,today):''}</div>
  </article>`;
}
function renderFilterButtons(cms, rootId='eventFiltersMini', compact=true){
  const rows=normalizeEvents(cms);
  const months=['Todos',...new Set(rows.map(x=>monthNames[x.start.getMonth()]))];
  const types=['Todos','AutoICA','Campañas','Nómina','Capacitación','Coffee','Inventarios','Talent','Otros'];
  const root=document.getElementById(rootId); if(!root) return;
  root.innerHTML=`<select class="filter-select" data-event-month>${months.map(m=>`<option ${m===state.month?'selected':''}>${esc(m)}</option>`).join('')}</select>${compact?'':`<select class="filter-select" data-event-type>${types.map(t=>`<option ${t===state.type?'selected':''}>${esc(t)}</option>`).join('')}</select>`}<button class="ghost small" data-events-all>Ver todos</button>`;
  root.onchange=e=>{ if(e.target.matches('[data-event-month]')) state.month=e.target.value; if(e.target.matches('[data-event-type]')) state.type=e.target.value; renderEvents(cms); };
  root.onclick=e=>{ if(e.target.closest('[data-events-all]')) renderEventsModal(cms); };
}
function filteredRows(cms){
  return normalizeEvents(cms).filter(x=>{
    const m=monthNames[x.start.getMonth()];
    return (state.month==='Todos'||state.month===m) && (state.type==='Todos'||state.type===x.type);
  });
}
export function nextEvent(cms){ return normalizeEvents(cms)[0] || null; }
export function renderEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 renderFilterButtons(cms,'eventFiltersMini',true);
 const rows=filteredRows(cms).slice(0,12);
 const grouped={active:[],soon:[],next:[],future:[]};
 rows.forEach(x=>grouped[labelFor(x.start,x.end,today)[1]].push(x));
 const groupTitle={active:'🔥 Activos ahora',soon:'📅 Esta semana',next:'✨ Próximos',future:'🗓️ Más adelante'};
 const html=Object.entries(grouped).filter(([,arr])=>arr.length).map(([k,arr])=>`<div class="event-group"><h3>${groupTitle[k]}</h3>${arr.map(x=>eventCard(x,today)).join('')}</div>`).join('');
 document.getElementById('events').innerHTML=html || '<p class="muted">Sin eventos próximos.</p>';
}
export function renderEventsModal(cms){
  const today=new Date(); today.setHours(0,0,0,0);
  const rows=normalizeEvents(cms);
  const months=['Todos',...new Set(rows.map(x=>monthNames[x.start.getMonth()]))];
  const types=['Todos','AutoICA','Campañas','Nómina','Capacitación','Coffee','Inventarios','Talent','Otros'];
  const html=`<span class="eyebrow">Agenda completa</span><h2>📌 Eventos y recordatorios</h2><div class="filter-row modal-filters"><select class="filter-select" id="modalEventMonth">${months.map(m=>`<option ${m===state.month?'selected':''}>${esc(m)}</option>`).join('')}</select><select class="filter-select" id="modalEventType">${types.map(t=>`<option ${t===state.type?'selected':''}>${esc(t)}</option>`).join('')}</select></div><div id="modalEventsList" class="event-list full-events"></div>`;
  import('./modal.js').then(({openModal})=>{
    openModal(html);
    const paint=()=>{
      state.month=document.getElementById('modalEventMonth').value; state.type=document.getElementById('modalEventType').value;
      document.getElementById('modalEventsList').innerHTML=filteredRows(cms).map(x=>eventCard(x,today)).join('') || '<p class="muted">Sin eventos con ese filtro.</p>';
      renderEvents(cms);
    };
    document.getElementById('modalEventMonth').onchange=paint;
    document.getElementById('modalEventType').onchange=paint;
    paint();
  });
}
