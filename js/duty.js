import {esc,first,todayName,normalize} from './utils.js';
import {openModal} from './modal.js';

const dutyPath = 'assets/duty/premium/';
function splitList(v){return String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
export function todayDuty(cms){const day=todayName();return (cms.dutyRoster||[]).find(x=>normalize(first(x,['Día','Dia']))===normalize(day))||{} }
function colorClass(color=''){const n=normalize(color); if(n.includes('naranja'))return 'orange'; if(n.includes('rojo'))return 'red'; if(n.includes('azul'))return 'blue'; if(n.includes('cafe'))return 'coffee'; if(n.includes('verde'))return 'green'; return 'green'}
export function dutyItems(cms){
  const d=todayDuty(cms);
  const stations=splitList(first(d,['Estaciones','Estación','Estacion']).replace(/\+/g,','));
  const imgs=splitList(first(d,['Imágenes','Imagenes','Imagen','Image']));
  if(imgs.length<=1){
    return [{station:stations.join(' + ') || first(d,['Estaciones','Estación','Estacion']) || 'Duty',img:imgs[0]||'',color:first(d,['Color'])||'Verde'}];
  }
  return stations.map((st,i)=>({station:st,img:imgs[i]||imgs[0]||'',color:first(d,['Color'])||'Verde'}));
}
export function dutyCard(cms){const d=todayDuty(cms);const items=dutyItems(cms);const est=first(d,['Estaciones','Estación','Estacion'])||'Duty';return `<article class="card duty-today" data-open="duty"><span class="icon">☕</span><div><small class="kicker">Duty Roster · ${todayName()}</small><h3>${esc(est)}</h3><p>${esc(first(d,['Enfoque','Enfoque Principal'])||'Checklist visual del día')}</p><span class="badge">Ver imagen</span></div></article>`}
function detailRows(cms, station=''){
  const day=todayName();
  const rows=(cms.dutyDetail||[]).filter(x=>normalize(first(x,['Día','Dia']))===normalize(day));
  return station ? rows.filter(x=>{ const rowStation=normalize(first(x,['Estación','Estacion'])); const selected=normalize(station); return selected.includes(rowStation) || rowStation.includes(selected); }) : rows;
}
function miniSummary(cms, station){
  const rows=detailRows(cms, station).sort((a,b)=>(+first(a,['Orden'])||0)-(+first(b,['Orden'])||0));
  const seen=new Set();
  const compact=[];
  rows.forEach(r=>{ const act=first(r,['Actividad']); const key=normalize(act); if(!seen.has(key) && compact.length<4){ seen.add(key); compact.push(r); } });
  return compact.length ? compact.map(r=>`<span>${esc(first(r,['Icono'])||'•')} ${esc(first(r,['Actividad']))}</span>`).join('') : '<span>Checklist visual del día</span>';
}
function renderSlide(cms, idx=0){
  const roster=todayDuty(cms); const items=dutyItems(cms); const item=items[idx]||items[0]||{};
  const img=item.img ? dutyPath+item.img : '';
  const hasMany=items.length>1;
  return `<div class="duty-head compact"><span class="big">☕</span><div><span class="eyebrow">Duty Roster Visual</span><h2>${esc(todayName())} · ${esc(item.station||first(roster,['Estaciones'])||'Duty')}</h2><p>${esc(first(roster,['Enfoque'])||'')}</p></div></div>
  <div class="duty-carousel ${colorClass(item.color)}">
    ${hasMany?`<button class="carousel-btn left" data-duty-prev>‹</button>`:''}
    <div class="duty-image-wrap">${img?`<img class="modal-img duty-img" src="${esc(img)}" alt="${esc(item.station)}" loading="lazy">`:'<p class="muted">Imagen no disponible.</p>'}</div>
    ${hasMany?`<button class="carousel-btn right" data-duty-next>›</button>`:''}
  </div>
  <button class="primary-action full" data-duty-detail>Ver resumen operativo →</button>
  <div class="duty-counter">${idx+1} de ${items.length||1}</div>`;
}
export function showDuty(cms){
  let idx=0;
  openModal(`<div id="dutyDynamic">${renderSlide(cms,idx)}</div>`);
  const root=document.getElementById('dutyDynamic');
  root.addEventListener('click',e=>{
    const items=dutyItems(cms);
    if(e.target.closest('[data-duty-prev]')) idx=(idx-1+items.length)%items.length;
    if(e.target.closest('[data-duty-next]')) idx=(idx+1)%items.length;
    if(e.target.closest('[data-duty-prev]')||e.target.closest('[data-duty-next]')) root.innerHTML=renderSlide(cms,idx);
    if(e.target.closest('[data-duty-detail]')) showDutyDetail(cms);
  });
}
export function renderDutyPreview(cms){
  const root=document.getElementById('dutyPreview'); if(!root) return;
  const d=todayDuty(cms); const items=dutyItems(cms); const item=items[0]||{}; const img=item.img ? dutyPath+item.img : '';
  root.innerHTML=`<article class="duty-preview ${colorClass(first(d,['Color']))}" data-open="duty"><div><small class="kicker">${esc(todayName())}</small><h3>${esc(first(d,['Estaciones','Estación','Estacion'])||'Duty Roster')}</h3><p>${esc(first(d,['Enfoque'])||'Checklist visual del día')}</p><div class="duty-preview-summary">${miniSummary(cms,item.station)}</div></div>${img?`<img src="${esc(img)}" alt="${esc(item.station)}" loading="lazy"/>`:''}</article>`;
}
export function showDutyDetail(cms){
  const day=todayName(); const rows=detailRows(cms).sort((a,b)=>(+first(a,['Orden'])||0)-(+first(b,['Orden'])||0));
  const byStation={}; const seen=new Set();
  rows.forEach(r=>{const st=first(r,['Estación','Estacion'])||'General'; const key=`${st}|${normalize(first(r,['Actividad']))}`; if(seen.has(key))return; seen.add(key); (byStation[st]??=[]).push(r);});
  const html=`<span class="eyebrow">Resumen operativo</span><h2>☕ Duty Detail · ${esc(day)}</h2>${Object.entries(byStation).map(([st,rs])=>`<details class="accordion" open><summary>${esc(st)}</summary>${rs.map(r=>`<div class="detail-row ${String(first(r,['Crítico','Critico'])).toLowerCase()==='true'?'critical-line':''}"><span>${esc(first(r,['Icono'])||'•')}</span><div><strong>${esc(first(r,['Actividad']))}</strong><small>${esc(first(r,['Categoría','Categoria'])||'')}</small></div>${String(first(r,['Crítico','Critico'])).toLowerCase()==='true'?'<b>Crítico</b>':''}</div>`).join('')}</details>`).join('')||'<p class="muted">Sin resumen para hoy.</p>'}`;
  openModal(html);
}
