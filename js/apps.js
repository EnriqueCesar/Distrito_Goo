import { esc, first, normalize } from './utils.js';
let current='';
const order = ['App','Trabajo','Incidentes','Capacitacion','Capacitación','Link_Portafolio','Informativa'];
export function renderTabs(cms){
 const cats=[...new Set((cms.links||[]).map(x=>first(x,['Categoria','Categoría'])).filter(Boolean))]
  .sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b)) || a.localeCompare(b));
 if(!current || !cats.includes(current)) current=cats[0]||'';
 document.getElementById('tabs').innerHTML=cats.map(c=>`<button class="tab ${c===current?'active':''}" data-cat="${esc(c)}">${esc(labelCat(c))}</button>`).join('');
 document.getElementById('tabs').onclick=e=>{const b=e.target.closest('.tab'); if(!b)return; current=b.dataset.cat; renderTabs(cms); renderApps(cms, document.getElementById('searchInput').value);};
}
function labelCat(c){return ({App:'Apps',Trabajo:'Trabajo',Incidentes:'Soporte',Link_Portafolio:'Portafolio',Informativa:'Info',Capacitacion:'Capacitación'})[c]||c}
export function renderApps(cms,q=''){
 const term=normalize(q);
 let rows=(cms.links||[]).filter(x=>!current||first(x,['Categoria','Categoría'])===current);
 if(term) rows=(cms.links||[]).filter(x=>normalize(Object.values(x).join(' ')).includes(term));
 document.getElementById('appsGrid').innerHTML=rows.map(x=>`<a class="app-card fun-card" href="${esc(first(x,['URL','Url','Link']))}" target="_blank" rel="noopener"><span>${esc(first(x,['Icono'])||'🔗')}</span><div><strong>${esc(first(x,['Nombre','App','Herramienta']))}</strong><small>${esc(first(x,['Notas','Descripción','Descripcion'])||first(x,['Categoria','Categoría']))}</small></div><b class="arrow">›</b></a>`).join('') || '<p class="muted">Sin resultados.</p>';
}
