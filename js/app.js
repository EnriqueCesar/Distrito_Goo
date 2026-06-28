import { loadCMS } from './cms.js';
import { $, esc, todayName, first, normalize, formatDateMX, weekMeta } from './utils.js';
import { dutyCard, showDuty, renderDutyPreview } from './duty.js';
import { renderEvents, renderEventsModal, priorityEvents, payrollPriority, autoICAPriority } from './events.js';
import { renderTabs, renderApps } from './apps.js';
import { openModal } from './modal.js';

let CMS = {};

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
function wfmRows(){ return (CMS.semanales||[]).filter(x=>normalize(first(x,['Actividad'])).startsWith('wfm')); }
function nextWfmActivity(currentDow){
  const map={1:2,2:3,3:4,4:5,5:6,6:0,0:1};
  const nextDow=map[currentDow];
  const names={0:'Domingo',1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado'};
  const row=wfmRows().find(x=>normalizeDay(dayOf(x))===normalizeDay(names[nextDow]));
  return row || {Icono:'➡️',Actividad:names[nextDow],Descripción:'Siguiente paso WFM.'};
}
function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const dayKey = normalizeDay(todayName(now));
  const row = wfmRows().find(x => normalizeDay(dayOf(x)) === dayKey);
  const fallback = {
    1: { Actividad: 'WFM - Pronóstico', Descripción:'Revisa y ajusta el pronóstico de volumen de la semana que se planificará dentro de 15 días.', Icono:'📈', Día:'Lunes' },
    2: { Actividad: 'WFM - Carga Inicial', Descripción:'Realiza la carga inicial de horarios de la semana que se planificará dentro de 15 días.', Icono:'📅', Día:'Martes' },
    3: { Actividad: 'WFM - Disponibilidades', Descripción:'Actualiza disponibilidades, vacaciones, permisos y restricciones de partners.', Icono:'👥', Día:'Miércoles' },
    4: { Actividad: 'WFM - Ajustes', Descripción:'Revisa horarios generados por Kronos y agrega Non-Coverage.', Icono:'⚙️', Día:'Jueves' },
    5: { Actividad: 'WFM - Revisión DM', Descripción:'El DM revisa horarios y comunica observaciones.', Icono:'✅', Día:'Viernes' },
    6: { Actividad: 'WFM - Publicación', Descripción:'Realiza correcciones finales.', Icono:'🚀', Día:'Sábado' },
    0: { Actividad: 'WFM - Validación Final', Descripción:'Verifica que los horarios publicados sean correctos.', Icono:'📤', Día:'Domingo' }
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
    nextAction: first(next,['Actividad']) || 'Siguiente paso',
    nextIcon: first(next,['Icono']) || '➡️',
    meta
  };
}
function priorityCard({icon,title,meta,text,level='normal',open='',link=''}){
  return `<article class="card priority-card ${esc(level)}" ${open?`data-open="${esc(open)}"`:''} ${link?`data-link="${esc(link)}"`:''}>
    <span class="icon">${esc(icon)}</span><div><small class="kicker">${esc(meta||'Prioridad')}</small><h3>${esc(title)}</h3><p>${esc(text||'')}</p></div>
  </article>`;
}
function renderToday() {
  const wfm = wfmSmart();
  const cards=[];
  const payroll=payrollPriority(CMS);
  if(payroll) cards.push(priorityCard(payroll));
  const autoica=autoICAPriority(CMS);
  if(autoica) cards.push(priorityCard(autoica));
  priorityEvents(CMS,2).forEach(x=>cards.push(priorityCard({
    icon:first(x.e,['Imagen','Icono'])||'📌',
    title:first(x.e,['Actividad']),
    meta:x.start<=new Date()&&new Date()<=x.end?'Evento vigente':'Evento',
    text:first(x.e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']),
    open:'events'
  })));
  cards.push(`<article class="card wfm-card event-style" data-open="wfm"><span class="icon">${esc(wfm.icon)}</span><div><small class="kicker">WFM · Semana ${esc(wfm.meta.week)}</small><h3>${esc(wfm.action.replace('WFM - ',''))}</h3><p>${esc(wfm.meta.shortRange)}</p><span class="badge">Siguiente: ${esc(wfm.nextAction.replace('WFM - ',''))}</span></div></article>`);
  cards.push(dutyCard(CMS));
  const focus = todayRows().filter(x => !normalize(first(x,['Actividad'])).startsWith('wfm')).slice(0,1);
  focus.forEach(x=>cards.push(priorityCard({icon:first(x,['Icono'])||'✨',title:first(x,['Actividad']),meta:first(x,['Hora / Corte'])||todayName(),text:first(x,['Descripción','Descripcion']),link:first(x,['Link','URL'])})));
  $('#todayCards').innerHTML = cards.join('') || '<p class="muted">Sin prioridades críticas para hoy.</p>';
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
  if(!items.length){ $('#dailyChecks').innerHTML='<p class="muted">Sin rutinas activas.</p>'; return; }
  let idx=0;
  const paint=()=>{
    const x=items[idx];
    const act = first(x,['Actividad']);
    const link = first(x,['Link /Imagen','Link','URL']);
    const img = imageForActivity(act, link);
    const open = img ? `data-image="${esc(img)}"` : (link && /^https?:/i.test(link) ? `data-link="${esc(link)}"` : '');
    $('#dailyChecks').innerHTML = `<div class="routine-carousel"><button class="carousel-btn inline" data-routine-prev>‹</button><article class="visual-check visual-tile" ${open}><div class="visual-icon">${esc(first(x,['Icono'])||'✅')}</div><div><h3>${esc(act)}</h3><p>${esc(first(x,['Categoría','Categoria'])||'Rutina diaria')}</p><span class="badge">${idx+1} de ${items.length}</span></div>${img?`<img src="${esc(img)}" alt="${esc(act)}" loading="lazy"/>`:''}</article><button class="carousel-btn inline" data-routine-next>›</button></div>`;
  };
  paint();
  $('#dailyChecks').onclick=e=>{ if(e.target.closest('[data-routine-prev]')){idx=(idx-1+items.length)%items.length; paint();} if(e.target.closest('[data-routine-next]')){idx=(idx+1)%items.length; paint();} };
}
function showWFM() {
  const smart = wfmSmart();
  openModal(`<span class="eyebrow">WFM</span><h2>📈 Semana ${esc(smart.meta.week)}</h2><div class="wfm-simple"><div><small>Semana en planeación</small><strong>${esc(smart.meta.shortRange)}</strong></div><div><small>Actividad</small><strong>${esc(smart.icon)} ${esc(smart.action.replace('WFM - ',''))}</strong><p>${esc(smart.detail)}</p></div><div><small>Siguiente</small><strong>${esc(smart.nextIcon)} ${esc(smart.nextAction.replace('WFM - ',''))}</strong></div></div>`);
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
  renderToday();
  renderDutyPreview(CMS);
  renderDaily();
  renderEvents(CMS);
  renderTabs(CMS);
  renderApps(CMS);
  bind();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}
init().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar Distrito GO. Revisa los JSON del CMS.</div>'); });
