import { loadCMS } from './cms.js';
import { $, esc, todayName, first, normalize, formatDateMX, currentWeekRange, sameMonthDay, shortName } from './utils.js';
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

function normalizeDay(value) { return normalize(value || '').replace(/\s+/g, ''); }

function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const map = {
    1: { action: 'Revisar pronóstico', detail:'Ajusta volumen de la semana que se planifica a 15 días.', icon: '📈', owner: 'SM / ASM', status: 'Lunes WFM' },
    2: { action: 'Carga inicial de horarios', detail:'Construye la primera versión de horarios.', icon: '📅', owner: 'SM / ASM', status: 'Martes WFM' },
    3: { action: 'Cargar disponibilidades', detail:'Actualiza vacaciones, permisos y restricciones.', icon: '📥', owner: 'SM / ASM', status: 'Miércoles WFM' },
    4: { action: 'Ajustar horarios Kronos', detail:'Revisa horarios generados y agrega Non-Coverage.', icon: '🛠️', owner: 'SM', status: 'Jueves WFM' },
    5: { action: 'Revisión DM', detail:'El DM revisa horarios y comunica observaciones.', icon: '🔎', owner: 'DM', status: 'Viernes WFM' },
    6: { action: 'Correcciones finales', detail:'Deja horarios listos para publicación.', icon: '🧩', owner: 'SM', status: 'Sábado WFM' },
    0: { action: 'Publicar en Humanet', detail:'Publica horarios antes del cierre del día.', icon: '🚀', owner: 'SM', status: 'Domingo WFM' }
  };
  const next = map[dow];
  const offset = dow === 0 ? 8 : 15;
  const target = new Date(now); target.setDate(now.getDate() + offset);
  return { ...next, range: currentWeekRange(target) };
}

function renderToday() {
  const day = todayName();
  const dayKey = normalizeDay(day);
  const sems = (CMS.semanales || []).filter(x => normalizeDay(first(x, ['Frecuencia', 'Día', 'Dia'])).includes(dayKey) || normalizeDay(first(x, ['Frecuencia', 'Día', 'Dia'])) === dayKey);
  const sem = sems.find(x => first(x,['Actividad']) !== 'WFM') || sems[0];
  const wfm = wfmSmart();
  const cards = [
    dutyCard(CMS),
    `<article class="card wfm-card" data-open="wfm"><span class="icon">${esc(wfm.icon)}</span><h3>${esc(wfm.action)}</h3><p>${esc(wfm.detail)}<br><strong>Semana objetivo:</strong> ${esc(wfm.range)}</p><span class="badge">${esc(wfm.status)}</span></article>`,
    `<article class="card"><span class="icon">${esc(first(sem || {}, ['Icono']) || '🎯')}</span><h3>${esc(first(sem || {}, ['Actividad']) || 'Mejora continua')}</h3><p>${esc(first(sem || {}, ['Descripción', 'Descripcion']) || 'Revisa checks, eventos y herramientas clave del día.')}</p><span class="badge">${esc(day)}</span></article>`
  ];
  $('#todayCards').innerHTML = cards.join('');
}

function imageForActivity(name){
  const n=normalize(name);
  if(n.includes('espresso')||n.includes('cafe')) return 'assets/photos/verificacion-cafe-espresso.png';
  if(n.includes('store walk')) return 'assets/photos/store-walk.png';
  if(n.includes('10 pasos')) return 'assets/photos/10-pasos-turno.png';
  return '';
}

function renderDaily() {
  const items = (CMS.diarias || [])
    .filter(x => String(first(x, ['Visible'])).toUpperCase() !== 'FALSE')
    .sort((a, b) => (+first(a, ['Prioridad']) || 9) - (+first(b, ['Prioridad']) || 9));
  $('#dailyChecks').innerHTML = items.map(x => {
    const img = imageForActivity(first(x,['Actividad']));
    const link = first(x,['Link /Imagen','Link','URL']);
    const open = img ? `data-image="${esc(img)}"` : (link && link !== 'Imagen' ? `data-link="${esc(link)}"` : '');
    return `<article class="visual-check" ${open}><div class="visual-icon">${esc(first(x,['Icono'])||'✅')}</div><div><h3>${esc(first(x,['Actividad']))}</h3><p>${esc(first(x,['Descripción','Descripcion']))}</p><span class="badge">${esc(first(x,['Categoría','Categoria'])||'Diario')}</span></div></article>`;
  }).join('') || '<p class="muted">Sin checks activos.</p>';
}

function renderCelebrations(){
  const today = new Date();
  const bdays = (CMS.birthdays||[]).filter(x=>sameMonthDay(first(x,['Fecha','Fecha nacimiento','Nacimiento','Cumpleaños','Cumpleanos']), today));
  const annivManual = (CMS.anniversaries||[]).filter(x=>sameMonthDay(first(x,['Fecha','Fecha ingreso','Ingreso']), today));
  const annivTBW = (CMS.tbw||[]).filter(x=>sameMonthDay(first(x,['Fecha de ingreso','Ingreso']), today));
  const annivs = [...annivManual, ...annivTBW].slice(0,6);
  const block = (title, icon, rows, empty) => `<div class="cele-card"><h3>${icon} ${title}</h3>${rows.length?rows.map(r=>`<div class="cele-row"><strong>${esc(shortName(first(r,['NOMBRE COMPLETO','NOMBRE','Nombre'])))}</strong><small>${esc(first(r,['TIENDA','Tienda','PUESTO'])||'')}</small></div>`).join(''):`<p class="muted small">${empty}</p>`}</div>`;
  $('#celebrations').innerHTML = block('Cumpleaños', '🎂', bdays, 'Sin cumpleaños hoy.') + block('Aniversarios', '⭐', annivs, 'Sin aniversarios hoy.');
}

function showWFM() {
  const smart = wfmSmart();
  openModal(`<span class="eyebrow">WFM de hoy</span><h2>${esc(smart.icon)} ${esc(smart.action)}</h2><div class="callout"><strong>Qué hacer hoy:</strong> ${esc(smart.detail)}<br><strong>Semana objetivo:</strong> ${esc(smart.range)}<br><strong>Responsable:</strong> ${esc(smart.owner)}</div><p class="muted">La regla completa vive en el CMS y sólo se usa para calcular la alerta diaria.</p>`);
}

function bind() {
  document.body.addEventListener('click', e => {
    const o = e.target.closest('[data-open],[data-image],[data-link],[data-scroll]');
    if (!o) return;
    if (o.dataset.open === 'duty') showDuty(CMS);
    if (o.dataset.open === 'wfm') showWFM();
    if (o.dataset.image) openModal(`<img class="modal-img" src="${esc(o.dataset.image)}" alt="Guía visual" loading="lazy">`);
    if (o.dataset.link) window.open(o.dataset.link,'_blank','noopener');
    if (o.dataset.scroll === 'apps') document.getElementById('appsSection').scrollIntoView({behavior:'smooth'});
  });
  $('#searchInput').addEventListener('input', e => renderApps(CMS, e.target.value));
  $('#clearSearch').addEventListener('click', () => { $('#searchInput').value = ''; renderApps(CMS, ''); });
}

async function init() {
  CMS = await loadCMS();
  $('#todayLabel').textContent = formatDateMX(new Date());
  $('#greeting').textContent = `${greeting()}, Enrique`;
  renderToday(); renderDaily(); renderEvents(CMS); renderCelebrations(); renderTalent(CMS); renderTabs(CMS); renderApps(CMS); bind();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}

init().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar DistritoGoo. Revisa los JSON del CMS.</div>'); });
