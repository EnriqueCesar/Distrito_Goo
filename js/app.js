import { loadCMS } from './cms.js';
import { $, esc, todayName, first, normalize, formatDateMX, weekMeta, toDate } from './utils.js';
import { dutyCard, showDuty } from './duty.js';
import { renderEvents, renderEventsModal, currentEvents, payrollCritical } from './events.js';
import { renderTabs, renderApps } from './apps.js';
import { openModal } from './modal.js';

let CMS = {};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}
function normalizeDay(value) { return normalize(value || '').replace(/\s+/g, ''); }
function dayOf(row){
  const d = first(row, ['Día','Dia','Frecuencia']);
  if(/lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo/i.test(String(d))) return d;
  const h = first(row, ['Hora / Corte','Hora','Corte']);
  if(/lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo/i.test(String(h))) return h;
  return d;
}
function linkOf(row){ return first(row, ['Link','URL','Url','Link /Imagen']); }
function isHttp(v){ return /^https?:\/\//i.test(String(v||'').trim()); }
function todayRows(){
  const dayKey = normalizeDay(todayName());
  return (CMS.semanales || []).filter(x => normalizeDay(dayOf(x)) === dayKey || normalizeDay(dayOf(x)).includes(dayKey));
}
function wfmRows(){ return (CMS.semanales||[]).filter(x=>normalize(first(x,['Actividad'])).startsWith('wfm')); }
function nextWfmActivity(currentDow){
  const map={1:2,2:3,3:4,4:5,5:6,6:0,0:1};
  const nextDow=map[currentDow];
  const names={0:'Domingo',1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado'};
  return wfmRows().find(x=>normalizeDay(dayOf(x))===normalizeDay(names[nextDow])) || {Icono:'➡️',Actividad:names[nextDow],Descripción:'Siguiente paso WFM.'};
}
function wfmSmart() {
  const now = new Date();
  const dow = now.getDay();
  const dayKey = normalizeDay(todayName(now));
  const row = wfmRows().find(x => normalizeDay(dayOf(x)) === dayKey);
  const fallback = {
    1: { Actividad: 'WFM - Pronóstico', Descripción:'Revisar pronóstico.', Icono:'📈', Día:'Lunes' },
    2: { Actividad: 'WFM - Carga Inicial', Descripción:'Carga inicial de horarios.', Icono:'📅', Día:'Martes' },
    3: { Actividad: 'WFM - Disponibilidades', Descripción:'Actualizar disponibilidades.', Icono:'👥', Día:'Miércoles' },
    4: { Actividad: 'WFM - Ajustes', Descripción:'Ajustar horarios generados.', Icono:'⚙️', Día:'Jueves' },
    5: { Actividad: 'WFM - Revisión DM', Descripción:'Revisión y observaciones DM.', Icono:'✅', Día:'Viernes' },
    6: { Actividad: 'WFM - Publicación', Descripción:'Correcciones finales.', Icono:'🚀', Día:'Sábado' },
    0: { Actividad: 'WFM - Validación Final', Descripción:'Validar horarios publicados.', Icono:'📤', Día:'Domingo' }
  }[dow];
  const picked = row || fallback;
  const target = new Date(now); target.setDate(now.getDate() + 15);
  const meta = weekMeta(target);
  const next = nextWfmActivity(dow);
  return {
    action: first(picked,['Actividad']) || 'WFM',
    detail: first(picked,['Descripción','Descripcion']) || '',
    icon: first(picked,['Icono']) || '📅',
    day: first(picked,['Día','Dia','Frecuencia']) || todayName(now),
    nextAction: first(next,['Actividad']) || 'Siguiente paso',
    nextIcon: first(next,['Icono']) || '➡️',
    meta
  };
}
function autoICAAlert(){
  const now = new Date();
  if(now.getDate() < 1 || now.getDate() > 5) return '';
  const row = currentEvents(CMS).find(x=>normalize(first(x.e,['Actividad'])).includes('autoica'));
  const link = 'https://ica-stage.bw-globalsolutions.com/Login.php';
  return `<article class="priority-card critical" data-link="${link}"><span>🛡</span><div><small>AutoICA · Día ${now.getDate()} de 5</small><strong>Validar evidencias y cerrar hallazgos</strong><em>${row?esc(first(row.e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']).split('\n')[0]):'Visible del día 1 al 5 de cada mes.'} · Toca para revisar</em></div></article>`;
}
function criticalAlerts(){
  const payroll = payrollCritical(CMS);
  const cards=[];
  if(payroll){
    cards.push(`<article class="priority-card urgent" data-open="events"><span>${payroll.kind==='tomorrow'?'⏰':'🚨'}</span><div><small>Corte de Nómina</small><strong>${payroll.kind==='tomorrow'?'Mañana hay corte':'Hoy hasta las 09:00 AM'}</strong><em>${esc(first(payroll.row.e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']))}</em></div></article>`);
  }
  const ica = autoICAAlert(); if(ica) cards.push(ica);
  return cards.join('') || `<article class="priority-card ok"><span>✅</span><div><small>Alertas críticas</small><strong>Sin alertas críticas activas</strong><em>Nómina y AutoICA aparecerán únicamente cuando correspondan.</em></div></article>`;
}

function eventLink(e){
  const direct = first(e,['URL','Url','Liga','Vínculo','Vinculo']);
  if (direct) return String(direct).trim();
  const ctx = first(e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']);
  const m = String(ctx||'').match(/https?:\/\/\S+/);
  return m ? m[0].trim() : '';
}
function eventDigest(){
  const rows=currentEvents(CMS).filter(x=>{const n=normalize(first(x.e,['Actividad'])); return !n.includes('corte de nomina') && !n.includes('precios_maquila');}).slice(0,3);
  return `<div class="digest-list">${rows.map(x=>{
    const url=eventLink(x.e); const img=first(x.e,['ImagenDetalle','Imagen Detalle','Foto','ImagenArchivo']);
    const attr = url ? `data-link="${esc(url)}"` : (img ? `data-image="assets/photos/${esc(img)}"` : '');
    return `<button class="digest-row" ${attr}><span>${esc(first(x.e,['Imagen','Icono'])||'📅')}</span><strong>${esc(first(x.e,['Actividad']))}</strong><small>${url?'Abrir liga directa':(img?'Ver imagen':`${x.start.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','')} → ${x.end.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','')}`)}</small></button>`
  }).join('') || '<p class="muted">Sin eventos vigentes.</p>'}</div>`;
}
function routineCarousel(){
  const items = (CMS.diarias || [])
    .filter(x => String(first(x, ['Visible'])).toUpperCase() !== 'FALSE')
    .sort((a,b)=>(+first(a,['Prioridad'])||9)-(+first(b,['Prioridad'])||9) || (+first(a,['ID'])||99)-(+first(b,['ID'])||99));
  const cards = items.map(x => {
    const raw = first(x,['Link /Imagen','Link','URL']);
    const img = imageForActivity(first(x,['Actividad']), raw);
    const link = isHttp(raw) ? raw : '';
    const attrs = `${img ? ` data-image="${esc(img)}"` : ''}${link ? ` data-link="${esc(link)}"` : ''}`;
    return `<article class="routine-chip"${attrs}><span>${esc(first(x,['Icono'])||'☕')}</span><strong>${esc(first(x,['Actividad']))}</strong><small>${esc(first(x,['Categoría','Categoria'])||'Rutina')}</small></article>`;
  }).join('');
  return `<div class="routine-strip">${cards || '<p class="muted">Sin rutinas activas.</p>'}</div>`;
}
function imageForActivity(name, explicit=''){
  const e = String(explicit || '').trim();
  const aliases = {
    'espresso.png': 'verificacion-cafe-espresso.png',
    'cafe.png': 'verificacion-cafe-espresso.png',
    'storewalk.png': 'store-walk.png',
    'store-walk.png': 'store-walk.png',
    'rutina_apertura.jpeg': 'Rutina_apertura.jpeg',
    'rutina_apertura.jpg': 'Rutina_apertura.jpeg',
    'rutina_apertura.png': 'Rutina_apertura.jpeg'
  };
  if(e && !/^https?:/i.test(e)) {
    const clean = e.replace(/^assets\/photos\//,'');
    return `assets/photos/${aliases[clean.toLowerCase()] || clean}`;
  }
  const n=normalize(name);
  if(n.includes('protocolo')||n.includes('apertura')) return 'assets/photos/Rutina_apertura.jpeg';
  if(n.includes('espresso')||n.includes('cafe')||n.includes('calidad')) return 'assets/photos/verificacion-cafe-espresso.png';
  if(n.includes('store walk')) return 'assets/photos/store-walk.png';
  if(n.includes('10 pasos')) return 'assets/photos/10-pasos-turno.png';
  return '';
}

function weeklyTodayBlock(){
  const rows = todayRows().filter(x => !normalize(first(x,['Actividad'])).startsWith('wfm'));
  if(!rows.length) return `<section class="priority-block"><h3>📌 Actividades semanales</h3><p class="muted">Sin actividades semanales configuradas para hoy.</p></section>`;
  return `<section class="priority-block"><h3>📌 Actividades semanales de hoy</h3><div class="weekly-grid">${rows.map(x=>{
    const link = linkOf(x);
    const act=normalize(first(x,['Actividad']));
    const imgAttr = (act.includes('ubits') || act.includes('college')) ? ' data-image="assets/photos/acceso_ubits.jpeg"' : '';
    return `<article class="weekly-card"${imgAttr} ${isHttp(link)?`data-link="${esc(link)}"`:''}><span>${esc(first(x,['Icono'])||'📌')}</span><div><strong>${esc(first(x,['Actividad']))}</strong><small>${esc(first(x,['Hora / Corte'])||todayName())}</small><em>${esc(first(x,['Descripción','Descripcion']))}</em></div></article>`;
  }).join('')}</div></section>`;
}
function yearsSince(dateValue, now=new Date()){
  const d=toDate(dateValue); if(!d || d.getFullYear()<1901) return '';
  let y=now.getFullYear()-d.getFullYear();
  const m=now.getMonth()-d.getMonth(); if(m<0 || (m===0 && now.getDate()<d.getDate())) y--;
  return Math.max(0,y);
}
function weekBounds(now=new Date()){
  const start=new Date(now); start.setHours(0,0,0,0); const diff=(start.getDay()+6)%7; start.setDate(start.getDate()-diff);
  const end=new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999); return {start,end};
}
function inCurrentWeekMonthDay(dateValue, now=new Date()){
  const d=toDate(dateValue); if(!d || d.getFullYear()<1901) return false;
  const {start,end}=weekBounds(now); const c=new Date(now.getFullYear(), d.getMonth(), d.getDate());
  return c>=start && c<=end;
}
function renderCelebrations(){
  const root = document.getElementById('celebrations'); if(!root) return;
  const now=new Date(); const {start,end}=weekBounds(now);
  const fmt=d=>d.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}).replace('.','');
  const b=(CMS.birthdays||[]).filter(x=>inCurrentWeekMonthDay(first(x,['F_NAC','F.NAC']), now));
  const a=(CMS.anniversaries||[]).filter(x=>inCurrentWeekMonthDay(first(x,['F_INGRESO','F_INGRESO']), now));
  const dayLabel=(dateValue)=>{const d=toDate(dateValue); return d ? new Date(now.getFullYear(),d.getMonth(),d.getDate()).toLocaleDateString('es-MX',{weekday:'short',day:'2-digit',month:'short'}).replace('.','') : '';};
  const card=(x,type)=>`<article class="celebration-card"><span>${type==='b'?'🎂':'🎉'}</span><div><strong>${esc(first(x,['NOMBRE','Nombre']))}</strong><small>${esc(first(x,['TIENDA','NOM_CCOSTO'])||'Tienda')} · ${esc(dayLabel(first(x,[type==='b'?'F_NAC':'F_INGRESO','F.NAC'])))}</small><em>${type==='b'?'Cumpleaños de la semana':`${yearsSince(first(x,['F_INGRESO']),now)} años en Starbucks`}</em></div></article>`;
  root.innerHTML = `<div class="week-note">Semana actual: ${esc(fmt(start))} al ${esc(fmt(end))}</div>` + ([...b.map(x=>card(x,'b')),...a.map(x=>card(x,'a'))].join('') || '<p class="muted">No hay cumpleaños ni aniversarios activos esta semana en el portafolio.</p>');
}


function infoBlock(){
  const rows=currentEvents(CMS).filter(x=>normalize(first(x.e,['Actividad'])).includes('precios_maquila'));
  if(!rows.length) return '';
  return `<section class="priority-block info-block"><h3>ℹ️ Informativo</h3>${rows.map(x=>{
    const img=first(x.e,['ImagenDetalle','Imagen Detalle']);
    return `<article class="priority-card" ${img?`data-image="assets/photos/${esc(img)}"`:''}><span>${esc(first(x.e,['Imagen','Icono'])||'ℹ️')}</span><div><small>${esc(first(x.e,['Actividad']))}</small><strong>Última actualización Abril_26</strong><em>${esc(first(x.e,['Contexto / Recordatorio','Contexto','Descripción','Descripcion']))}</em></div></article>`;
  }).join('')}</section>`;
}

function renderToday() {
  const wfm = wfmSmart();
  $('#todayCards').innerHTML = `
    <section class="priority-block"><h3>🚨 Alertas críticas</h3>${criticalAlerts()}</section>
    <section class="priority-block"><h3>📅 Eventos vigentes</h3>${eventDigest()}</section>
    ${infoBlock()}
    ${weeklyTodayBlock()}
    <section class="priority-block two-mini">
      <article class="priority-card wfm-card" data-open="wfm"><span>${esc(wfm.icon)}</span><div><small>WFM · Semana ${esc(wfm.meta.week)}</small><strong>${esc(wfm.action)}</strong><em>${esc(wfm.meta.shortRange)} · Siguiente: ${esc(wfm.nextAction)}</em></div></article>
      ${dutyCard(CMS)}
    </section>
    <section class="priority-block"><h3>☕ Rutina del día</h3>${routineCarousel()}</section>`;
}
function showWFM() {
  const smart = wfmSmart();
  openModal(`<span class="eyebrow">WFM Inteligente</span><h2>${esc(smart.icon)} ${esc(smart.action)}</h2><div class="wfm-clean"><div><small>Semana</small><strong>${esc(smart.meta.week)}</strong></div><div><small>Fecha</small><strong>${esc(smart.meta.shortRange)}</strong></div><div><small>Actividad</small><strong>${esc(smart.action.replace(/^WFM\s*-\s*/i,''))}</strong></div><div><small>Siguiente</small><strong>${esc(smart.nextAction)}</strong></div></div>`);
}
function bind() {
  document.body.addEventListener('click', e => {
    const o = e.target.closest('[data-open],[data-image],[data-link],[data-scroll]');
    if (!o) return;
    if (o.dataset.open === 'duty') showDuty(CMS);
    if (o.dataset.open === 'wfm') showWFM();
    if (o.dataset.open === 'events') renderEventsModal(CMS);
    if (o.dataset.image) { openModal(`<img class="modal-img" src="${esc(o.dataset.image)}" alt="Guía visual" loading="lazy">${o.dataset.link?`<p style="margin-top:12px"><a class="details-link" href="${esc(o.dataset.link)}" target="_blank" rel="noopener">Abrir liga</a></p>`:''}`); return; }
    if (o.dataset.link) window.open(o.dataset.link,'_blank','noopener');
    if (o.dataset.scroll) document.getElementById(o.dataset.scroll)?.scrollIntoView({behavior:'smooth'});
  });
  $('#searchInput').addEventListener('input', e => renderApps(CMS, e.target.value));
  $('#clearSearch').addEventListener('click', () => { $('#searchInput').value = ''; renderApps(CMS, ''); });
}
async function init() {
  CMS = await loadCMS();
  $('#todayLabel').textContent = formatDateMX(new Date());
  $('#greeting').textContent = `${greeting()}, Partner`;
  renderToday(); renderEvents(CMS); renderCelebrations(); renderTabs(CMS); renderApps(CMS); bind();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.update?.())).catch(()=>{});
    navigator.serviceWorker.register('sw.js?v=6.6.2').then(r => r.update()).catch(() => {});
  }
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; $('#installBtn').classList.add('hidden'); } });
}
init().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', '<div class="fatal">No se pudo cargar Distrito GO. Revisa los JSON del CMS.</div>'); });
