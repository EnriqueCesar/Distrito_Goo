import { loadCMS } from './cms.js';
import { $, esc, todayName, first, normalize, formatDateMX, currentWeekRange } from './utils.js';
import { dutyCard, showDuty } from './duty.js';
import { renderEvents } from './events.js';
import { renderTabs, renderApps } from './apps.js';
import { renderTalent } from './talent.js';
import { openModal } from './modal.js';

let CMS = {};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function normalizeDay(value) {
  return normalize(value || '').replace(/\s+/g, '');
}

function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const map = {
    3: { action: 'Cargar disponibilidades', icon: '📥', owner: 'SM / ASM', status: 'Acción de miércoles' },
    4: { action: 'Ajustar horarios', icon: '🛠️', owner: 'SM', status: 'Acción de jueves' },
    5: { action: 'Revisión DM', icon: '🔎', owner: 'DM', status: 'Acción de viernes' },
    0: { action: 'Publicar semana', icon: '🚀', owner: 'SM', status: 'Acción de domingo' }
  };
  const next = map[dow] || { action: 'Dar seguimiento WFM', icon: '📅', owner: 'Equipo tienda', status: 'Preparación' };
  const offset = dow === 0 ? 8 : 15;
  const target = new Date(now);
  target.setDate(now.getDate() + offset);
  const range = currentWeekRange(target);
  return { ...next, range };
}

function activeEventsCount() {
  const today = new Date(); today.setHours(0,0,0,0);
  return (CMS.eventos || []).filter(e => {
    const start = new Date(first(e, ['Fecha Inicio', 'Inicio']) || '1900-01-01');
    const end = new Date(first(e, ['Fecha Fin', 'Fin']) || first(e, ['Fecha Inicio', 'Inicio']) || '1900-01-01');
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    return today >= start && today <= end;
  }).length;
}

function renderStats() {
  const apps = (CMS.links || []).length;
  const tbw = (CMS.tbw || []).length;
  const altas = (CMS.bt || []).length + (CMS.ss || []).length;
  const eventos = activeEventsCount();
  $('#stats').innerHTML = `
    <div class="stat"><strong>${tbw}</strong><span>TBW</span></div>
    <div class="stat"><strong>${altas}</strong><span>Altas</span></div>
    <div class="stat"><strong>${apps}</strong><span>Apps</span></div>
    <div class="stat"><strong>${eventos}</strong><span>Activos</span></div>`;
}

function renderToday() {
  const day = todayName();
  const dayKey = normalizeDay(day);
  const sem = (CMS.semanales || []).find(x => normalizeDay(first(x, ['Frecuencia', 'Día', 'Dia'])) === dayKey);
  const wfm = wfmSmart();
  const cards = [
    dutyCard(CMS),
    `<article class="card wfm-card" data-open="wfm">
      <span class="icon">${esc(wfm.icon)}</span>
      <h3>${esc(wfm.action)}</h3>
      <p>Semana objetivo: <strong>${esc(wfm.range)}</strong>. Responsable: ${esc(wfm.owner)}.</p>
      <span class="badge">${esc(wfm.status)}</span>
    </article>`,
    `<article class="card">
      <span class="icon">${esc(first(sem || {}, ['Icono']) || '🎯')}</span>
      <h3>${esc(first(sem || {}, ['Actividad']) || 'Mejora continua')}</h3>
      <p>${esc(first(sem || {}, ['Descripción', 'Descripcion']) || 'Revisa checks, eventos y herramientas clave del día.')}</p>
      <span class="badge">${esc(day)}</span>
    </article>`
  ];
  $('#todayCards').innerHTML = cards.join('');
}

function renderDaily() {
  const items = (CMS.diarias || [])
    .filter(x => String(first(x, ['Visible'])).toUpperCase() !== 'FALSE')
    .sort((a, b) => (+first(a, ['Prioridad']) || 9) - (+first(b, ['Prioridad']) || 9));
  $('#dailyChecks').innerHTML = items.map(x => `
    <div class="check-item">
      <span class="checkmark">✓</span>
      <div><h3>${esc(first(x, ['Icono']))} ${esc(first(x, ['Actividad']))}</h3><p>${esc(first(x, ['Descripción', 'Descripcion']))}</p></div>
    </div>`).join('') || '<p class="muted">Sin checks activos.</p>';
}

function showWFM() {
  const w = (CMS.wfm || [])[0] || {};
  const smart = wfmSmart();
  const text = esc(first(w, ['Regla WFM']) || Object.values(w).join('\n')).replace(/\n/g, '<br>');
  openModal(`
    <span class="eyebrow">Regla WFM Inteligente</span>
    <h2>${esc(smart.icon)} ${esc(smart.action)}</h2>
    <div class="callout"><strong>Semana objetivo:</strong> ${esc(smart.range)}<br><strong>Responsable:</strong> ${esc(smart.owner)}</div>
    <div class="modal-list"><div class="item">${text}</div></div>`);
}

function bind() {
  document.body.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (!o) return;
    if (o.dataset.open === 'duty') showDuty(CMS);
    if (o.dataset.open === 'wfm') showWFM();
  });
  $('#searchInput').addEventListener('input', e => renderApps(CMS, e.target.value));
  $('#clearSearch').addEventListener('click', () => { $('#searchInput').value = ''; renderApps(CMS, ''); });
}

async function init() {
  CMS = await loadCMS();
  $('#todayLabel').textContent = formatDateMX(new Date());
  $('#greeting').textContent = `${greeting()}, Enrique`;
  renderStats(); renderToday(); renderDaily(); renderEvents(CMS); renderTalent(CMS); renderTabs(CMS); renderApps(CMS); bind();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}

init().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar Distrito GO. Revisa los JSON del CMS.</div>');
});
