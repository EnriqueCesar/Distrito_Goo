import {$} from './utils.js';
const modal=$('#modal'), content=$('#modalContent');
$('#modalClose').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{ if(e.target===modal) modal.close(); });
export function openModal(html){
  content.innerHTML=html;
  try{ if(modal.open) modal.close(); if(typeof modal.showModal==='function') modal.showModal(); else modal.setAttribute('open',''); }
  catch(err){ console.warn('Modal fallback',err); modal.setAttribute('open',''); }
}
