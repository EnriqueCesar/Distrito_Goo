import { esc, first, normalize } from './utils.js';
let current='Todos';
export function renderTabs(cms){
 const cats=['Todos',...new Set((cms.links||[]).map(x=>first(x,['Categoria','Categoría'])).filter(Boolean))];
 document.getElementById('tabs').innerHTML=cats.map(c=>`<button class="tab ${c===current?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
 document.getElementById('tabs').onclick=e=>{const b=e.target.closest('.tab'); if(!b)return; current=b.dataset.cat; renderTabs(cms); renderApps(cms, document.getElementById('searchInput').value);};
}
export function renderApps(cms,q=''){
 const term=normalize(q);
 let rows=(cms.links||[]).filter(x=>current==='Todos'||first(x,['Categoria','Categoría'])===current);
 if(term) rows=rows.filter(x=>normalize(Object.values(x).join(' ')).includes(term));
 document.getElementById('appsGrid').innerHTML=rows.map(x=>`<a class="app-card" href="${esc(first(x,['URL','Url','Link']))}" target="_blank" rel="noopener"><span>${esc(first(x,['Icono'])||'🔗')}</span><strong>${esc(first(x,['Nombre','App','Herramienta']))}</strong><small>${esc(first(x,['Notas','Descripción','Descripcion'])||first(x,['Categoria','Categoría']))}</small></a>`).join('') || '<p class="muted">Sin resultados.</p>';
}
