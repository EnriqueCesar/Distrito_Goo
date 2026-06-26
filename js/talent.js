import { esc, first, shortName } from './utils.js';
function pct(v){ const n=parseFloat(String(v).replace('%','')); if(isNaN(n))return ''; return n<=1?`${Math.round(n*100)}%`:`${Math.round(n)}%`; }
export function renderTalent(cms){
 const rows=(cms.tbw||[]).slice().sort((a,b)=>(parseFloat(first(a,['Avance'])||'0')||0)-(parseFloat(first(b,['Avance'])||'0')||0)).slice(0,6);
 document.getElementById('tbw').innerHTML=`<h3>⭐ TBW prioridad</h3>${rows.map(r=>`<div class="row"><div><strong>${esc(shortName(first(r,['NOMBRE','Nombre','NOMBRE COMPLETO'])))}</strong><small>${esc(first(r,['TIENDA','Tienda']))}</small></div><span class="badge">${esc(pct(first(r,['Avance'])))}</span><small>${esc(first(r,['Días de antigüedad','Dias','ANTIGÜEDAD']))} días</small></div>`).join('') || '<p class="muted">Sin pendientes.</p>'}`;
 const altas=[...(cms.bt||[]).map(x=>({...x,_tipo:'BT'})),...(cms.ss||[]).map(x=>({...x,_tipo:'SS'}))].slice(0,8);
 document.getElementById('altas').innerHTML=`<h3>👋 Altas BT / SS</h3>${altas.map(r=>`<div class="row"><div><strong>${esc(shortName(first(r,['NOMBRE COMPLETO','NOMBRE','Nombre'])))}</strong><small>${esc(first(r,['TIENDA','Tienda']))}</small></div><span class="badge">${esc(r._tipo)}</span><small>${esc(first(r,['ESTATUS ALTA','BT'])||'')}</small></div>`).join('') || '<p class="muted">Sin altas.</p>'}`;
}
