import { state } from './state.js';
import { $, $$, escapeHtml } from './utils.js';
import { toast } from './toast.js';

const today = new Date();
const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function parseDate(value){
  if(!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function isActiveEvent(evt){
  const start = parseDate(evt['Fecha Inicio']);
  const end = parseDate(evt['Fecha Fin']);
  if(!start && !end) return true;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return (!start || start.getTime() <= t) && (!end || end.getTime() >= t);
}
function card(title, text, icon='✅', extra=''){
  return `<article class="ops-card"><div class="ops-icon">${icon}</div><div><h4>${escapeHtml(title || 'Actividad')}</h4><p>${escapeHtml(text || '')}</p>${extra}</div></article>`;
}
function peopleCard(p, tipo){
  const nombre = p['NOMBRE COMPLETO'] || p.NOMBRE || 'Partner';
  const tienda = p.TIENDA || '';
  const estatus = p['ESTATUS ALTA'] || p.Avance || p.BT || '';
  return `<article class="person-card"><strong>${escapeHtml(nombre)}</strong><span>${escapeHtml(tipo)} · ${escapeHtml(tienda)}</span><small>${escapeHtml(String(estatus))}</small></article>`;
}
export function renderOperationalSections(){
  renderToday(); renderEvents(); renderAltas(); renderDuty(); renderChecklist(); bindOperationalActions();
}
export function renderToday(){
  const day = dayNames[today.getDay()];
  const daily = (state.operacional.actividadesDiarias || []).filter(a => a.Visible !== false).slice(0,6);
  const weekly = (state.operacional.actividadesSemanales || []).filter(a => (a['Día'] || '').toLowerCase() === day.toLowerCase());
  $('#today-date').textContent = today.toLocaleDateString('es-MX', { weekday:'long', day:'2-digit', month:'long' });
  $('#daily-grid').innerHTML = daily.map(a => card(a.Actividad, a['Descripción'], a.Icono || '✅', a['Link /Imagen'] && String(a['Link /Imagen']).startsWith('http') ? `<a class="mini-link" href="${escapeHtml(a['Link /Imagen'])}" target="_blank" rel="noopener">Abrir recurso</a>` : '')).join('');
  $('#weekly-grid').innerHTML = weekly.length ? weekly.map(a => card(a.Actividad, `${a['Descripción'] || ''} ${a['Hora / Corte'] ? '· ' + a['Hora / Corte'] : ''}`, a.Icono || '📌', a.Link ? `<a class="mini-link" href="${escapeHtml(a.Link)}" target="_blank" rel="noopener">Abrir link</a>` : '')).join('') : card('Sin actividad semanal específica', 'Mantén foco en apertura, calidad, seguimiento y herramientas clave.', '☕');
}
export function renderEvents(){
  const active = (state.operacional.eventos || []).filter(isActiveEvent);
  const next = active.length ? active : (state.operacional.eventos || []).slice(0,8);
  $('#events-count').textContent = `${active.length} activos / ${state.operacional.eventos.length} CMS`;
  $('#events-grid').innerHTML = next.slice(0,10).map(e => card(e.Actividad, e['Contexto / Recordatorio'], e.Imagen || '📅', `<small class="date-line">${escapeHtml(e['Fecha Inicio'] || '')}${e['Fecha Fin'] ? ' al ' + escapeHtml(e['Fecha Fin']) : ''}</small>`)).join('') || card('Sin eventos cargados', 'Revisa la pestaña Eventos del CMS.', '📅');
}
export function renderAltas(){
  const a = state.operacional.altasCurso || {bt:[],ss:[],tbw:[]};
  $('#altas-count').textContent = `${a.bt.length} BT · ${a.ss.length} SS · ${a.tbw.length} TBW`;
  $('#altas-grid').innerHTML = [
    ...a.bt.slice(0,4).map(p => peopleCard(p,'BT')),
    ...a.ss.slice(0,3).map(p => peopleCard(p,'SS')),
    ...a.tbw.slice(0,5).map(p => peopleCard(p,'TBW'))
  ].join('') || '<div class="empty-state"><strong>Sin altas en curso</strong><p>CMS sin registros para este periodo.</p></div>';
}
export function renderDuty(){
  const day = dayNames[today.getDay()];
  const item = (state.operacional.dutyRoster || []).find(d => (d['Día'] || '').toLowerCase() === day.toLowerCase()) || (state.operacional.dutyRoster || [])[0];
  const detail = (state.operacional.dutyDetail || []).filter(d => item && (d['Día'] || '').toLowerCase() === (item['Día'] || '').toLowerCase()).slice(0,9);
  $('#duty-focus').innerHTML = item ? `<strong>${escapeHtml(item['Día'])}: ${escapeHtml(item.Estaciones)}</strong><p>${escapeHtml(item.Enfoque)}</p>` : '<p>Sin Duty Roster cargado.</p>';
  $('#duty-detail').innerHTML = detail.map(d => `<li>${d.Icono || '•'} ${escapeHtml(d.Actividad)}${d['Crítico'] === true ? ' <strong>Crítico</strong>' : ''}</li>`).join('');
}
export function renderChecklist(){
  $('#checklist-grid').innerHTML = (state.operacional.checklistApertura || []).slice(0,10).map(c => `<div class="check-item"><span>${c.Icono || '✓'}</span><strong>${escapeHtml(c.Concepto)}</strong></div>`).join('');
}
function bindOperationalActions(){
  $$('.ops-card a, .mini-link').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
}
export function goToSection(id){
  const el = document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); toast('Sección abierta'); }
}
