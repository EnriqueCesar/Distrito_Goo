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
function todayRows(){
  const dayKey = normalizeDay(todayName());
  return (CMS.semanales || []).filter(x => {
    const f = normalizeDay(first(x, ['Frecuencia', 'Día', 'Dia']));
    return f === dayKey || f.includes(dayKey);
  });
}
function weeklyFocusRows(){ return todayRows().filter(x => String(first(x,['Actividad'])).trim()); }

function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const dayKey = normalizeDay(todayName(now));
  const row = (CMS.semanales || []).find(x => normalize(first(x,['Actividad'])) === 'wfm' && normalizeDay(first(x,['Frecuencia'])) === dayKey);
  const fallback = {
    1: { Actividad: 'WFM', Descripción:'Revisa y ajusta el pronóstico de volumen de la semana que se planificará dentro de 15 días.', Icono:'📈', Frecuencia:'Lunes' },
    2: { Actividad: 'WFM', Descripción:'Realiza la carga inicial de horarios de la semana que se planificará dentro de 15 días.', Icono:'📅', Frecuencia:'Martes' },
    3: { Actividad: 'WFM', Descripción:'Actualiza disponibilidades, vacaciones, permisos y restricciones de partners.', Icono:'👥', Frecuencia:'Miércoles' },
    4: { Actividad: 'WFM', Descripción:'Revisa horarios generados por Kronos y agrega Non-Coverage.', Icono:'⚙️', Frecuencia:'Jueves' },
    5: { Actividad: 'WFM', Descripción:'El DM revisa horarios y comunica observaciones o ajustes requeridos.', Icono:'✅', Frecuencia:'Viernes' },
    6: { Actividad: 'WFM', Descripción:'Realiza correcciones finales y deja horarios listos para publicar.', Icono:'🚀', Frecuencia:'Sábado' },
    0: { Actividad: 'WFM', Descripción:'Verifica que los horarios publicados sean correctos y listos para iniciar la semana.', Icono:'📤', Frecuencia:'Domingo' }
  }[dow];
  const picked = row || fallback;
  const offset = dow === 0 ? 8 : 15;
  const target = new Date(now); target.setDate(now.getDate() + offset);
  return {
    action: first(picked,['Actividad']) || 'WFM',
    detail: first(picked,['Descripción','Descripcion']) || '',
    icon: first(picked,['Icono']) || '📅',
    color: first(picked,['Color']) || 'Azul',
    status: first(picked,['Frecuencia']) || todayName(now),
    range: currentWeekRange(target)
  };
}

function renderToday() {
  const day = todayName();
  const wfm = wfmSmart();
  const focus = weeklyFocusRows().filter(x => normalize(first(x,['Actividad'])) !== 'wfm').slice(0,2);
  const focusCard = focus[0] ? focus.map(x => `<article class="focus-pill" ${/^https?:/i.test(first(x,['Descripción','Descripcion'])) ? `data-link="${esc(first(x,['Descripción','Descripcion']))}"` : ''}><span>${esc(first(x,['Icono'])||'✨')}</span><div><strong>${esc(first(x,['Actividad']))}</strong><small>${esc(first(x,['Frecuencia'])||day)}</small></div></article>`).join('') : `<article class="focus-pill"><span>✨</span><div><strong>Mejora continua</strong><small>Revisa eventos y checks clave</small></div></article>`;
  const cards = [
    dutyCard(CMS),
    `<article class="card wfm-card event-style" data-open="wfm"><span class="icon">${esc(wfm.icon)}</span><div><small class="kicker">Foco WFM · ${esc(day)}</small><h3>${esc(wfm.action)}</h3><p>${esc(wfm.detail)}</p><span class="badge">Semana ${esc(wfm.range)}</span></div></article>`,
    `<article class="card focus-card"><span class="icon">🌟</span><div><small class="kicker">Foco de hoy</small><h3>Actividades del día</h3><div class="focus-pills">${focusCard}</div></div></article>`
  ];
  $('#todayCards').innerHTML = cards.join('');
}

function imageForActivity(name){
  const n=normalize(name);
  if(n.includes('espresso')||n.includes('cafe')||n.includes('calidad')) return 'assets/photos/verificacion-cafe-espresso.png';
  if(n.includes('store walk')) return 'assets/photos/store-walk.png';
  if(n.includes('10 pasos')) return 'assets/photos/10-pasos-turno.png';
  return '';
}

function renderDaily() {
  const items = (CMS.diarias || [])
    .filter(x => String(first(x, ['Visible'])).toUpperCase() !== 'FALSE')
    .sort((a, b) => (+first(a, ['Prioridad']) || 9) - (+first(b, ['Prioridad']) || 9));
  $('#dailyChecks').innerHTML = items.map(x => {
    const act = first(x,['Actividad']);
    const img = imageForActivity(act);
    const link = first(x,['Link /Imagen','Link','URL']);
    const open = img ? `data-image="${esc(img)}"` : (link && link !== 'Imagen' ? `data-link="${esc(link)}"` : '');
    return `<article class="visual-check visual-tile" ${open}><div class="visual-icon">${esc(first(x,['Icono'])||'✅')}</div><div><h3>${esc(act)}</h3><p>${esc(first(x,['Descripción','Descripcion']))}</p><span class="badge">${esc(first(x,['Categoría','Categoria'])||'Diario')}</span></div>${img?`<img src="${esc(img)}" alt="${esc(act)}" loading="lazy"/>`:''}</article>`;
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
  openModal(`<span class="eyebrow">Foco WFM de hoy</span><h2>${esc(smart.icon)} ${esc(smart.action)}</h2><div class="callout"><strong>${esc(todayName())}:</strong> ${esc(smart.detail)}<br><strong>Semana objetivo:</strong> ${esc(smart.range)}</div><div class="mini-note">La alerta cambia automáticamente según el día de la semana.</div>`);
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
  $('#greeting').textContent = `${greeting()}, Partner`;
  renderToday(); renderDaily(); renderEvents(CMS); renderCelebrations(); renderTalent(CMS); renderTabs(CMS); renderApps(CMS); bind();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}

init().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar DistritoGoo. Revisa los JSON del CMS.</div>'); });
