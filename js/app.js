import { loadCMS } from './cms.js';
import { $, esc, todayName, first, normalize, formatDateMX, weekMeta, sameMonthDay, shortName } from './utils.js';
import { dutyCard, showDuty } from './duty.js';
import { renderEvents, renderEventsModal, nextEvent } from './events.js';
import { renderTabs, renderApps } from './apps.js';
import { renderTalent } from './talent.js';
import { openModal } from './modal.js';

let CMS = {};
const emergencyLink = 'https://wa.me/message/ENKDSAHYHIGAN1';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}
function normalizeDay(value) { return normalize(value || '').replace(/\s+/g, ''); }
function dayOf(row){ return first(row, ['Día','Dia','Frecuencia']); }
function todayRows(){
  const dayKey = normalizeDay(todayName());
  return (CMS.semanales || []).filter(x => normalizeDay(dayOf(x)) === dayKey || normalizeDay(dayOf(x)).includes(dayKey));
}
function weeklyFocusRows(){ return todayRows().filter(x => String(first(x,['Actividad'])).trim()); }
function wfmRows(){ return (CMS.semanales||[]).filter(x=>normalize(first(x,['Actividad'])).startsWith('wfm')); }
function nextWfmActivity(currentDow){
  const map={1:2,2:3,3:4,4:5,5:6,6:0,0:1};
  const nextDow=map[currentDow];
  const names={0:'Domingo',1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado'};
  const row=wfmRows().find(x=>normalizeDay(dayOf(x))===normalizeDay(names[nextDow]));
  return row || {Icono:'➡️',Actividad:names[nextDow],Descripción:'Continúa el flujo de planeación WFM.'};
}
function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const dayKey = normalizeDay(todayName(now));
  const row = wfmRows().find(x => normalizeDay(dayOf(x)) === dayKey);
  const fallback = {
    1: { Actividad: 'WFM - Pronóstico', Descripción:'Revisa y ajusta el pronóstico de volumen de la semana que se planificará dentro de 15 días.', Icono:'📈', Día:'Lunes' },
    2: { Actividad: 'WFM - Carga Inicial', Descripción:'Realiza la carga inicial de horarios de la semana que se planificará dentro de 15 días.', Icono:'📅', Día:'Martes' },
    3: { Actividad: 'WFM - Disponibilidades', Descripción:'Actualiza disponibilidades, vacaciones, permisos y restricciones de partners. Kronos generará automáticamente el pronóstico y horarios.', Icono:'👥', Día:'Miércoles' },
    4: { Actividad: 'WFM - Ajustes', Descripción:'Revisa horarios generados por Kronos y agrega Non-Coverage.', Icono:'⚙️', Día:'Jueves' },
    5: { Actividad: 'WFM - Revisión DM', Descripción:'El DM revisa horarios y comunica observaciones o ajustes requeridos.', Icono:'✅', Día:'Viernes' },
    6: { Actividad: 'WFM - Publicación', Descripción:'Realiza correcciones finales y deja horarios listos para publicar.', Icono:'🚀', Día:'Sábado' },
    0: { Actividad: 'WFM - Validación Final', Descripción:'Verifica que los horarios publicados sean correctos y listos para iniciar la semana.', Icono:'📤', Día:'Domingo' }
  }[dow];
  const picked = row || fallback;
  const target = new Date(now); target.setDate(now.getDate() + 15);
  const meta = weekMeta(target);
  const next = nextWfmActivity(dow);
  return {
    action: first(picked,['Actividad']) || 'WFM',
    detail: first(picked,['Descripción','Descripcion']) || '',
    icon: first(picked,['Icono']) || '📅',
    color: first(picked,['Color']) || 'Azul',
    day: first(picked,['Día','Dia','Frecuencia']) || todayName(now),
    nextAction: first(next,['Actividad']) || 'Siguiente paso',
    nextIcon: first(next,['Icono']) || '➡️',
    meta
  };
}
function renderDashboard(){
  const wfm=wfmSmart();
  const event=nextEvent(CMS);
  const duty=(CMS.dutyRoster||[]).find(x=>normalize(first(x,['Día','Dia']))===normalize(todayName()))||{};
  const bdays=(CMS.birthdays||[]).filter(x=>sameMonthDay(first(x,['Fecha','Fecha nacimiento','Nacimiento','Cumpleaños','Cumpleanos']), new Date())).length;
  const annivs=[...(CMS.anniversaries||[]),...(CMS.tbw||[])].filter(x=>sameMonthDay(first(x,['Fecha','Fecha ingreso','Ingreso','Fecha de ingreso']), new Date())).length;
  const cards=[
    ['📅','Hoy',formatDateMX(new Date()).replace(',', '')],
    ['📌','Próximo evento',event?`${first(event.e,['Actividad'])} · ${event.start.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','')}`:'Sin eventos próximos'],
    ['☕','Duty del día',first(duty,['Estaciones','Estación','Estacion'])||'Duty Roster'],
    ['📈','WFM',`Semana ${wfm.meta.week} · ${wfm.meta.shortRange}`],
    ['🎂','Cumpleaños',`${bdays} hoy`],
    ['🎉','Aniversarios',`${annivs} hoy`]
  ];
  $('#dashboardCards').innerHTML=cards.map(([i,t,d])=>`<article class="dash-card"><span>${esc(i)}</span><div><strong>${esc(t)}</strong><small>${esc(d)}</small></div></article>`).join('');
}
function renderToday() {
  const day = todayName();
  const wfm = wfmSmart();
  const focus = weeklyFocusRows().filter(x => !normalize(first(x,['Actividad'])).startsWith('wfm')).slice(0,2);
  const focusCard = focus[0] ? focus.map(x => `<article class="focus-pill" ${/^https?:/i.test(first(x,['Link','URL','Descripción','Descripcion'])) ? `data-link="${esc(first(x,['Link','URL','Descripción','Descripcion']))}"` : ''}><span>${esc(first(x,['Icono'])||'✨')}</span><div><strong>${esc(first(x,['Actividad']))}</strong><small>${esc(first(x,['Hora / Corte'])||day)}</small></div></article>`).join('') : `<article class="focus-pill"><span>✨</span><div><strong>Mejora continua</strong><small>Revisa eventos y checks clave</small></div></article>`;
  const cards = [
    dutyCard(CMS),
    `<article class="card wfm-card event-style" data-open="wfm"><span class="icon">${esc(wfm.icon)}</span><div><small class="kicker">WFM · Semana ${esc(wfm.meta.week)}</small><h3>${esc(wfm.action)}</h3><p>${esc(wfm.detail)}</p><span class="badge">${esc(wfm.meta.shortRange)}</span></div></article>`,
    `<article class="card focus-card"><span class="icon">🌟</span><div><small class="kicker">Actividades</small><h3>Foco operativo</h3><div class="focus-pills">${focusCard}</div></div></article>`
  ];
  $('#todayCards').innerHTML = cards.join('');
}
function imageForActivity(name, explicit=''){
  const e=String(explicit||'');
  if(e && !/^https?:/i.test(e)){
    const clean=e.replace(/^assets\/photos\//,'');
    return `assets/photos/${clean}`;
  }
  const n=normalize(name);
  if(n.includes('protocolo')||n.includes('apertura')) return 'assets/photos/Rutina_apertura.jpeg';
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
    const link = first(x,['Link /Imagen','Link','URL']);
    const img = imageForActivity(act, link);
    const open = img ? `data-image="${esc(img)}"` : (link && /^https?:/i.test(link) ? `data-link="${esc(link)}"` : '');
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
  const rule = first((CMS.wfm||[])[0]||{}, ['Regla WFM']) || '';
  const template = rule
    .replaceAll('{DIA_ACTUAL}', todayName())
    .replaceAll('{FECHA_ACTUAL}', new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}))
    .replaceAll('{SEMANA}', smart.meta.week)
    .replaceAll('{FECHA_INICIO}', smart.meta.monday.toLocaleDateString('es-MX',{day:'2-digit',month:'long'}))
    .replaceAll('{FECHA_FIN}', smart.meta.sunday.toLocaleDateString('es-MX',{day:'2-digit',month:'long'}))
    .replaceAll('{ICONO}', smart.icon)
    .replaceAll('{ACTIVIDAD}', smart.action)
    .replaceAll('{DESCRIPCION}', smart.detail)
    .replaceAll('{ICONO_SIGUIENTE}', smart.nextIcon)
    .replaceAll('{ACTIVIDAD_SIGUIENTE}', smart.nextAction);
  openModal(`<pre class="wfm-pre">${esc(template)}</pre>`);
}
function bind() {
  document.body.addEventListener('click', e => {
    const o = e.target.closest('[data-open],[data-image],[data-link],[data-scroll]');
    if (!o) return;
    if (o.dataset.open === 'duty') showDuty(CMS);
    if (o.dataset.open === 'wfm') showWFM();
    if (o.dataset.open === 'events') renderEventsModal(CMS);
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
  renderDashboard(); renderToday(); renderDaily(); renderEvents(CMS); renderCelebrations(); renderTalent(CMS); renderTabs(CMS); renderApps(CMS); bind();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}
init().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar Distrito GO. Revisa los JSON del CMS.</div>'); });
