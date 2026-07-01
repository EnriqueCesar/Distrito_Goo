import { esc, first, normalize } from './utils.js';
let current='';
const order = ['App','Trabajo','Campaña','Capacitacion','Capacitación','Incidentes','Informativa','Desarrollo'];
const icons = {App:'🚀',Trabajo:'🧰',Campaña:'🧃',Incidentes:'🛠️',Capacitacion:'🎓','Capacitación':'🎓',Informativa:'💚',Desarrollo:'🌱'};
export function renderTabs(cms){
 const cats=[...new Set((cms.links||[]).map(x=>first(x,['Categoria','Categoría'])).filter(Boolean))]
  .sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b)) || a.localeCompare(b));
 if(!current || !cats.includes(current)) current=cats[0]||'';
 document.getElementById('tabs').innerHTML=cats.map(c=>`<button class="tab ${c===current?'active':''}" data-cat="${esc(c)}"><span>${icons[c]||'🔗'}</span>${esc(labelCat(c))}</button>`).join('');
 document.getElementById('tabs').onclick=e=>{const b=e.target.closest('.tab'); if(!b)return; current=b.dataset.cat; renderTabs(cms); renderApps(cms, document.getElementById('searchInput').value);};
}
function labelCat(c){return ({App:'Apps',Trabajo:'Trabajo',Campaña:'Campañas',Incidentes:'Incidentes',Informativa:'Informativos',Capacitacion:'Capacitación','Capacitación':'Capacitación',Desarrollo:'Desarrollo'})[c]||c}
function cmsSearchRows(cms,term){
 if(!term) return [];
 const eventRows=(cms.eventos||[]).filter(x=>normalize(Object.values(x).join(' ')).includes(term)).slice(0,8).map(x=>({kind:'Agenda',icon:first(x,['Imagen','Icono'])||'📅',name:first(x,['Actividad'])||'Evento',note:first(x,['Contexto / Recordatorio','Descripción','Descripcion'])||'Evento CMS',url:first(x,['URL','Url','Link'])||''}));
 const altaRows=[...(cms.bt||[]).map(x=>({...x,_kind:'Alta BT'})),...(cms.ss||[]).map(x=>({...x,_kind:'Alta SS'})),...(cms.tbw||[]).map(x=>({...x,_kind:'TBW'}))]
  .filter(x=>normalize(Object.values(x).join(' ')).includes(term)).slice(0,8).map(x=>({kind:x._kind,icon:'👥',name:first(x,['NOMBRE COMPLETO','NOMBRE','Nombre'])||'Partner',note:`${first(x,['TIENDA','Tienda'])||'Tienda'} · ${first(x,['ESTATUS ALTA','Avance','BT','GB180'])||'Seguimiento'}`,url:''}));
 return [...eventRows,...altaRows];
}
export function renderApps(cms,q=''){
 const term=normalize(q);
 let rows=(cms.links||[]).filter(x=>!current||first(x,['Categoria','Categoría'])===current);
 if(term) rows=(cms.links||[]).filter(x=>normalize(Object.values(x).join(' ')).includes(term));
 const extras=cmsSearchRows(cms,term);
 const count = rows.length + extras.length;
 const cat = term ? 'Resultados' : labelCat(current);
 const accessCards=rows.map(x=>`<a class="app-card fun-card" title="${esc(first(x,['Notas','Descripción','Descripcion'])||first(x,['Categoria','Categoría']))}" href="${esc(first(x,['URL','Url','Link']))}" target="_blank" rel="noopener"><span>${esc(first(x,['Icono'])||'🔗')}</span><div><strong>${esc(first(x,['Nombre','App','Herramienta']))}</strong><small>${esc(first(x,['Categoria','Categoría'])||'Acceso')}</small><em>${esc(first(x,['Notas','Descripción','Descripcion'])||'Acceso operativo')}</em></div><b class="arrow">›</b></a>`).join('');
 const cmsCards=extras.map(x=>`<article class="app-card fun-card cms-result" ${x.url?`data-link="${esc(x.url)}"`:''}><span>${esc(x.icon)}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.kind)}</small><em>${esc(String(x.note).split('\n')[0])}</em></div><b class="arrow">›</b></article>`).join('');
 document.getElementById('appsGrid').innerHTML=`<div class="apps-heading"><strong>${esc(cat)}</strong><small>${count} resultado${count===1?'':'s'} listos para usar</small></div>` + (accessCards + cmsCards || '<p class="muted">Sin resultados.</p>');
}
