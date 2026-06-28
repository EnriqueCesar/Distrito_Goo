import { esc, first, toDate, normalize } from './utils.js';
import { openModal } from './modal.js';

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let state = { range:'Todos', month:'Todos', type:'Todos' };

export function eventType(e){
  const txt = normalize(`${first(e,['Actividad'])} ${first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion'])}`);
  if(txt.includes('autoica') || txt.includes('ica')) return 'AutoICA';
  if(txt.includes('corte de nomina') || txt.includes('nomina')) return 'Nómina';
  if(txt.includes('campana') || txt.includes('summer') || txt.includes('platform') || txt.includes('rewards') || txt.includes('promocion') || txt.includes('ube') || txt.includes('protein') || txt.includes('frappuccino')) return 'Campañas';
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
   type:eventType(e),
   group:null
 })).filter(x=>x.end>=today).sort((a,b)=>a.start-b.start || a.end-b.end);
}

export function isPayroll(e){ return normalize(first(e,['Actividad'])).includes('corte de nomina'); }
export function isAutoICA(e){ return normalize(`${first(e,['Actividad'])} ${first(e,['Contexto / Recordatorio','Contexto'])}`).includes('autoica'); }

export function payrollPriority(cms, now=new Date()){
  const today=new Date(now); today.setHours(0,0,0,0);
  const tomorrow=new Date(today); tomorrow.setDate(today.getDate()+1);
  const hour=now.getHours()+now.getMinutes()/60;
  const payroll=normalizeEvents(cms).filter(x=>isPayroll(x.e));
  const todayClose=payroll.find(x=>{ const d=new Date(x.end); d.setHours(0,0,0,0); return d.getTime()===today.getTime(); });
  if(todayClose && hour < 9) return {level:'critical',icon:'🚨',title:'Corte de Nómina',meta:'HOY · Antes de 09:00 AM',text:'Cierra incidencias y valida el periodo correspondiente.',event:todayClose};
  const tomorrowClose=payroll.find(x=>{ const d=new Date(x.end); d.setHours(0,0,0,0); return d.getTime()===tomorrow.getTime(); });
  if(tomorrowClose) return {level:'warning',icon:'⏰',title:'Corte de Nómina',meta:'Mañana · preparar incidencias',text:'Revisa incidencias para llegar listo al cierre de 09:00 AM.',event:tomorrowClose};
  return null;
}

export function autoICAPriority(cms, now=new Date()){
  const day=now.getDate();
  if(day<1 || day>5) return null;
  const today=new Date(now); today.setHours(0,0,0,0);
  const row=normalizeEvents(cms).find(x=>isAutoICA(x.e) && today>=x.start && today<=x.end);
  if(!row) return null;
  return {level:'warning',icon:'🛡',title:'AutoICA',meta:`Día ${day} de 5`,text:'Ejecuta, valida evidencias y asegura cierre antes del día 5.',event:row};
}

function labelFor(start,end,today){
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in30=new Date(today); in30.setDate(today.getDate()+30);
  if(today>=start&&today<=end) return ['Activo','active'];
  if(start<=in7) return ['Próximos 7 días','soon'];
  if(start<=in30) return ['Este mes','next'];
  return ['Más adelante','future'];
}
function dateRange(start,end){
  const fmt=x=>x.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','');
  return fmt(start)+(start.toDateString()!==end.toDateString()?` – ${fmt(end)}`:'');
}
function cleanActivity(a=''){ return String(a).replace(/^\p{Emoji_Presentation}|^\p{Extended_Pictographic}/u,'').trim(); }

function groupEvents(rows){
  const groups=new Map();
  rows.forEach(x=>{
    const key=`${x.type}|${x.start.toISOString().slice(0,10)}|${x.end.toISOString().slice(0,10)}`;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(x);
  });
  const used=new Set(); const result=[];
  rows.forEach(x=>{
    const key=`${x.type}|${x.start.toISOString().slice(0,10)}|${x.end.toISOString().slice(0,10)}`;
    const arr=groups.get(key)||[];
    const shouldGroup = x.type==='Campañas' && arr.length>=4;
    if(shouldGroup){
      if(used.has(key)) return;
      used.add(key);
      const main=arr.find(r=>normalize(first(r.e,['Actividad'])).includes('summer 2026')) || arr[0];
      result.push({...main, group:arr});
    } else result.push(x);
  });
  return result;
}

function eventCard(row,today){
  const {e,start,end,type,group}=row;
  const [label,cls]=labelFor(start,end,today);
  const title=group ? cleanActivity(first(e,['Actividad'])).replace(/^[☀️\s]+/,'') : first(e,['Actividad']);
  const context=group ? `${group.length} actividades vigentes de campaña.` : first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']);
  return `<article class="event ${cls}" data-type="${esc(type)}" ${group?`data-event-group="${esc(start.toISOString())}"`:''}>
    <span class="event-icon">${esc(first(e,['Imagen','Icono'])||'📌')}</span>
    <div><div class="event-top"><h4>${esc(title)}</h4><small>${esc(label)}</small></div>
    <p>${esc(context)}</p>
    <div class="event-meta"><small>${esc(dateRange(start,end))}</small><small>${esc(type)}</small>${group?`<button class="link-btn mini" data-group-detail="${esc(start.toISOString())}">Ver detalles</button>`:''}</div></div>
  </article>`;
}

function rangeOk(x,today){
  if(state.range==='Todos') return true;
  const in7=new Date(today); in7.setDate(today.getDate()+7); in7.setHours(23,59,59,999);
  if(state.range==='Próximos 7 días') return x.start<=in7 || (today>=x.start&&today<=x.end);
  if(state.range==='Este mes') return x.start.getMonth()===today.getMonth() || (today>=x.start&&today<=x.end);
  return true;
}
function filteredRows(cms){
  const today=new Date(); today.setHours(0,0,0,0);
  return groupEvents(normalizeEvents(cms)).filter(x=>{
    const m=monthNames[x.start.getMonth()];
    return rangeOk(x,today) && (state.month==='Todos'||state.month===m) && (state.type==='Todos'||state.type===x.type);
  });
}
function renderFilterButtons(cms, rootId='eventFiltersMini', compact=true){
  const rows=normalizeEvents(cms);
  const months=['Todos',...new Set(rows.map(x=>monthNames[x.start.getMonth()]))];
  const ranges=['Todos','Próximos 7 días','Este mes'];
  const types=['Todos','AutoICA','Campañas','Nómina','Capacitación','Coffee','Inventarios','Talent','Otros'];
  const root=document.getElementById(rootId); if(!root) return;
  root.innerHTML=`<select class="filter-select" data-event-range>${ranges.map(m=>`<option ${m===state.range?'selected':''}>${esc(m)}</option>`).join('')}</select><select class="filter-select" data-event-month>${months.map(m=>`<option ${m===state.month?'selected':''}>${esc(m)}</option>`).join('')}</select>${compact?'':`<select class="filter-select" data-event-type>${types.map(t=>`<option ${t===state.type?'selected':''}>${esc(t)}</option>`).join('')}</select>`}`;
  root.onchange=e=>{ if(e.target.matches('[data-event-range]')) state.range=e.target.value; if(e.target.matches('[data-event-month]')) state.month=e.target.value; if(e.target.matches('[data-event-type]')) state.type=e.target.value; renderEvents(cms); };
}
export function nextEvent(cms){ return normalizeEvents(cms).find(x=>!isPayroll(x.e)) || null; }
export function priorityEvents(cms, max=3){
  const today=new Date(); today.setHours(0,0,0,0);
  return groupEvents(normalizeEvents(cms).filter(x=>!isPayroll(x.e) && !isAutoICA(x.e) && today>=x.start && today<=x.end)).slice(0,max);
}
export function renderEvents(cms){
 const today=new Date(); today.setHours(0,0,0,0);
 renderFilterButtons(cms,'eventFiltersMini',true);
 const rows=filteredRows(cms).slice(0,10);
 document.getElementById('events').innerHTML=rows.map(x=>eventCard(x,today)).join('') || '<p class="muted">Sin eventos próximos.</p>';
 bindGroupClicks(cms, document.getElementById('events'));
}
function groupDetailHTML(row){
  const items=row.group||[row];
  return `<span class="eyebrow">Detalle de campaña</span><h2>${esc(first(row.e,['Imagen'])||'☀️')} ${esc(cleanActivity(first(row.e,['Actividad'])))}</h2><p class="subcopy">${esc(dateRange(row.start,row.end))}</p><div class="modal-list">${items.map(x=>`<div class="item"><strong>${esc(first(x.e,['Imagen'])||'•')} ${esc(cleanActivity(first(x.e,['Actividad'])))}</strong><small>${esc(first(x.e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']))}</small></div>`).join('')}</div>`;
}
function bindGroupClicks(cms, root){
  if(!root) return;
  root.onclick = e=>{
    const b=e.target.closest('[data-group-detail]'); if(!b) return;
    const iso=b.dataset.groupDetail;
    const row=groupEvents(normalizeEvents(cms)).find(x=>x.group && x.start.toISOString()===iso);
    if(row) openModal(groupDetailHTML(row));
  };
}
export function renderEventsModal(cms){
  const today=new Date(); today.setHours(0,0,0,0);
  const rows=normalizeEvents(cms);
  const months=['Todos',...new Set(rows.map(x=>monthNames[x.start.getMonth()]))];
  const ranges=['Todos','Próximos 7 días','Este mes'];
  const types=['Todos','AutoICA','Campañas','Nómina','Capacitación','Coffee','Inventarios','Talent','Otros'];
  const html=`<span class="eyebrow">Agenda completa</span><h2>📌 Eventos y recordatorios</h2><div class="filter-row modal-filters"><select class="filter-select" id="modalEventRange">${ranges.map(m=>`<option ${m===state.range?'selected':''}>${esc(m)}</option>`).join('')}</select><select class="filter-select" id="modalEventMonth">${months.map(m=>`<option ${m===state.month?'selected':''}>${esc(m)}</option>`).join('')}</select><select class="filter-select" id="modalEventType">${types.map(t=>`<option ${t===state.type?'selected':''}>${esc(t)}</option>`).join('')}</select></div><div id="modalEventsList" class="event-list full-events"></div>`;
  openModal(html);
  const paint=()=>{
    state.range=document.getElementById('modalEventRange').value; state.month=document.getElementById('modalEventMonth').value; state.type=document.getElementById('modalEventType').value;
    document.getElementById('modalEventsList').innerHTML=filteredRows(cms).map(x=>eventCard(x,today)).join('') || '<p class="muted">Sin eventos con ese filtro.</p>';
    bindGroupClicks(cms, document.getElementById('modalEventsList'));
    renderEvents(cms);
  };
  ['modalEventRange','modalEventMonth','modalEventType'].forEach(id=>document.getElementById(id).onchange=paint);
  paint();
}
