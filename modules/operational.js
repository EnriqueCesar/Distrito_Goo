import { state } from './state.js';
import { $, $$, escapeHtml } from './utils.js';
import { toast } from './toast.js';

const today = new Date();
const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
let eventFilter = 'week';
let actionsBound = false;

function parseDate(value){
  if(!value) return null;
  if(value instanceof Date) return value;
  const text = String(value).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(text)) return new Date(`${text}T00:00:00`);
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
}
function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function endOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate(),23,59,59); }
function startOfWeek(d){ const s=startOfDay(d); const diff=(s.getDay()+6)%7; s.setDate(s.getDate()-diff); return s; }
function endOfWeek(d){ const e=startOfWeek(d); e.setDate(e.getDate()+6); return endOfDay(e); }
function addDays(d, days){ const x=new Date(d); x.setDate(x.getDate()+days); return x; }
function inRange(evt, start, end){
  const a=parseDate(evt['Fecha Inicio']);
  const b=parseDate(evt['Fecha Fin']) || a;
  if(!a && !b) return true;
  return (!b || b >= start) && (!a || a <= end);
}
function fmtDDMM(value){
  const d=parseDate(value); if(!d) return '';
  return d.toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit'});
}
function briefText(text='', max=112){
  const clean = String(text || '').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
  return clean.length > max ? clean.slice(0, max-1).trim() + '…' : clean;
}
function getWeekNumber(d){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}
function nextWeeklyActivity(day){
  const list = state.operacional.actividadesSemanales || [];
  const nowIndex = today.getDay();
  for(let i=1;i<=7;i++){
    const idx=(nowIndex+i)%7;
    const name=dayNames[idx];
    const found=list.find(a => (a['Día']||'').toLowerCase() === name.toLowerCase());
    if(found) return found;
  }
  return null;
}
function isImageResource(item){ return item?.TipoRecurso === 'imagen' && item?.Recurso; }
function renderResourceAction(item){
  if(!item?.Recurso) return '';
  if(item.TipoRecurso === 'link' || String(item.Recurso).startsWith('http')) return `<a class="mini-link" href="${escapeHtml(item.Recurso)}" target="_blank" rel="noopener">Abrir link</a>`;
  return `<button class="mini-link image-link" type="button" data-image="${escapeHtml(item.Recurso)}" data-title="${escapeHtml(item.Actividad)}">Ver imagen</button>`;
}
function opsCard(title, text, icon='✅', extra='', item=null){
  return `<article class="ops-card"><div class="ops-icon">${icon}</div><div class="ops-content"><h4>${escapeHtml(title || 'Actividad')}</h4><p>${escapeHtml(briefText(text))}</p>${extra ? `<div class="inline-actions">${extra}</div>` : ''}</div></article>`;
}
function eventCard(e){
  const icon = e.Imagen || '📅';
  const title = e.Actividad || 'Evento';
  const dateLine = `${fmtDDMM(e['Fecha Inicio'])}${e['Fecha Fin'] ? ' al ' + fmtDDMM(e['Fecha Fin']) : ''}`;
  const image = e.ImagenPath ? `<button class="mini-link image-link" type="button" data-image="${escapeHtml(e.ImagenPath)}" data-title="${escapeHtml(title)}">Ver imagen</button>` : '';
  const link = e.Link ? `<a class="mini-link" href="${escapeHtml(e.Link)}" target="_blank" rel="noopener">Abrir link</a>` : '';
  return `<article class="ops-card event-card"><div class="ops-icon">${icon}</div><div class="ops-content"><span class="event-date">${escapeHtml(dateLine)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(briefText(e['Contexto / Recordatorio'], 145))}</p><div class="inline-actions">${link}${image}</div></div></article>`;
}
function personRow(p, tipo){
  const nombre = p.Partner || p['NOMBRE COMPLETO'] || p.NOMBRE || 'Partner';
  const tienda = p.Tienda || p.TIENDA || '';
  const estatus = p.Estatus || p['ESTATUS ALTA'] || p.BT || '';
  return `<div class="person-row"><strong>${escapeHtml(nombre)}</strong><span>${escapeHtml(tienda)}</span><em>${escapeHtml(tipo)} · ${escapeHtml(String(estatus))}</em></div>`;
}
function tbwRow(p){
  const nombre = p.Partner || p.NOMBRE || 'Partner';
  const tienda = p.Tienda || p.TIENDA || '';
  const avance = String(p.AvanceResumen || p.Avance || '0%');
  const pct = parseInt(avance,10) || 0;
  return `<div class="tbw-row"><div><strong>${escapeHtml(nombre)}</strong><span>${escapeHtml(tienda)}</span></div><div class="progress" aria-label="Avance ${escapeHtml(avance)}"><i style="width:${Math.min(100,Math.max(0,pct))}%"></i></div><em>${escapeHtml(avance)}</em></div>`;
}

export function renderOperationalSections(){
  renderToday();
  renderEvents();
  renderAltas();
  renderDuty();
  bindOperationalActions();
}
export function renderToday(){
  const day = dayNames[today.getDay()];
  const daily = (state.operacional.actividadesDiarias || [])
    .filter(a => a.Visible !== false)
    .sort((a,b)=>(a.Prioridad||9)-(b.Prioridad||9))
    .slice(0,6);
  const weekly = (state.operacional.actividadesSemanales || []).filter(a => (a['Día'] || '').toLowerCase() === day.toLowerCase());
  $('#today-date').textContent = today.toLocaleDateString('es-MX', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  renderWFM(day, weekly[0]);
  $('#daily-grid').innerHTML = daily.map(a => opsCard(a.Actividad, a.DescripcionBreve || a['Descripción'], a.Icono || '✅', renderResourceAction(a), a)).join('');
  $('#weekly-grid').innerHTML = weekly.length ? weekly.map(a => opsCard(a.Actividad, `${a['Descripción'] || ''}${a['Hora / Corte'] ? ' · ' + a['Hora / Corte'] : ''}`, a.Icono || '📌', a.Link ? `<a class="mini-link" href="${escapeHtml(a.Link)}" target="_blank" rel="noopener">Abrir link</a>` : '')).join('') : opsCard('Sin actividad semanal específica', 'Mantén foco en apertura, calidad y seguimiento.', '☕');
}
function renderWFM(day, todayActivity){
  const planningDate = addDays(today, 15);
  const weekStart = startOfWeek(planningDate);
  const weekEnd = endOfWeek(planningDate);
  const next = nextWeeklyActivity(day);
  $('#wfm-card').innerHTML = `<div class="wfm-head"><span>📅 WFM</span><strong>Planeación Inteligente</strong></div><div class="wfm-grid"><div><small>Hoy</small><b>${escapeHtml(day)}</b></div><div><small>Semana en planeación</small><b>Semana ${getWeekNumber(planningDate)}</b></div><div><small>Periodo</small><b>${fmtDDMM(weekStart)} al ${fmtDDMM(weekEnd)}</b></div></div><div class="wfm-action"><strong>${todayActivity?.Icono || '✅'} ${escapeHtml(todayActivity?.Actividad || 'Revisión operativa')}</strong><p>${escapeHtml(briefText(todayActivity?.['Descripción'] || 'Revisa prioridades del día y anticipa necesidades de la semana en planeación.', 130))}</p></div>${next?`<div class="wfm-next"><small>Siguiente paso</small><span>${next.Icono || '⏭️'} ${escapeHtml(next.Actividad)}</span></div>`:''}`;
}
export function renderEvents(){
  const all = state.operacional.eventos || [];
  const now = startOfDay(today);
  let start, end;
  if(eventFilter === 'week'){ start=startOfWeek(today); end=endOfWeek(today); }
  else if(eventFilter === 'month'){ start=new Date(today.getFullYear(), today.getMonth(),1); end=endOfDay(new Date(today.getFullYear(), today.getMonth()+1,0)); }
  else { start=now; end=new Date(today.getFullYear(),11,31,23,59,59); }
  const filtered = all.filter(e => inRange(e,start,end) && (parseDate(e['Fecha Fin']) || parseDate(e['Fecha Inicio']) || end) >= now)
    .sort((a,b)=>(parseDate(a['Fecha Inicio'])||0)-(parseDate(b['Fecha Inicio'])||0));
  $('#events-count').textContent = `${filtered.length} ${eventFilter === 'week' ? 'esta semana' : eventFilter === 'month' ? 'este mes' : 'próximos'}`;
  $('#events-grid').innerHTML = filtered.slice(0,18).map(eventCard).join('') || opsCard('Sin eventos en este filtro', 'Cambia a Mes o Todos para ver próximos recordatorios.', '📅');
}
export function renderAltas(){
  const a = state.operacional.altasCurso || {bt:[],ss:[],tbw:[]};
  $('#altas-count').textContent = `${a.bt.length} BT · ${a.ss.length} SS · ${a.tbw.length} TBW`;
  $('#btss-count').textContent = `${a.bt.length + a.ss.length} registros`;
  $('#tbw-count').textContent = `${a.tbw.length} partners`;
  $('#btss-grid').innerHTML = [...a.bt.map(p => personRow(p,'BT')), ...a.ss.map(p => personRow(p,'SS'))].join('') || '<p class="muted">Sin registros BT/SS.</p>';
  $('#tbw-grid').innerHTML = a.tbw.map(tbwRow).join('') || '<p class="muted">Sin seguimiento TBW.</p>';
}
export function renderDuty(){
  const day = dayNames[today.getDay()];
  const roster = state.operacional.dutyRoster || [];
  const item = roster.find(d => (d['Día'] || '').toLowerCase() === day.toLowerCase()) || roster[0];
  const detail = (state.operacional.dutyDetail || []).filter(d => item && (d['Día'] || '').toLowerCase() === (item['Día'] || '').toLowerCase()).sort((a,b)=>(a.Orden||0)-(b.Orden||0));
  $('#duty-focus').innerHTML = item ? `<div class="duty-focus-head"><span>Hoy</span><strong>${escapeHtml(item['Día'])}: ${escapeHtml(item.Estaciones)}</strong></div><p>${escapeHtml(item.Enfoque)}</p>` : '<p>Sin Duty Roster cargado.</p>';
  $('#duty-gallery').innerHTML = item?.ImagenesPath?.length ? item.ImagenesPath.map((src,i)=>{
    const station = String(item.Estaciones || 'Estación').split(',')[i]?.trim() || `Estación ${i+1}`;
    return `<button class="duty-link image-link" type="button" data-image="${escapeHtml(src)}" data-title="${escapeHtml(item['Día'] + ' · ' + station)}"><span>🖼️</span><strong>${escapeHtml(station)}</strong><em>Ver imagen</em></button>`;
  }).join('') : '';
  $('#duty-detail').innerHTML = detail.map(d => `<li class="${d['Crítico'] === true ? 'is-critical' : ''}">${d.Icono || '•'} <span>${escapeHtml(d.Actividad)}</span>${d['Crítico'] === true ? ' <strong>Crítico</strong>' : ''}</li>`).join('');
}
function bindOperationalActions(){
  if(actionsBound) return;
  actionsBound = true;
  document.body.addEventListener('click', e => {
    const segment = e.target.closest('.segment');
    if(segment){
      eventFilter = segment.dataset.eventsFilter;
      $$('.segment').forEach(b=>b.classList.toggle('is-active', b===segment));
      renderEvents();
    }
    const img = e.target.closest('.image-link');
    if(img){ e.preventDefault(); openImageModal(img.dataset.title || 'Imagen', img.dataset.image); }
  });
}
function openImageModal(title, src){
  $('#quick-modal-title').textContent = title;
  $('#quick-modal-body').innerHTML = `<img class="modal-image" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" loading="lazy"/>`;
  $('#quick-modal').showModal();
}
export function goToSection(id){
  const el = document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); toast('Sección abierta'); }
}
