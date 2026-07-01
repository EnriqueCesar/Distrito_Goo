import { state } from './state.js';
import { $, $$, normalize, isInputActive } from './utils.js';
import { modalResult, emptyState } from './components.js';
import { openTool, renderTools } from './cards.js';

export function bindSearch(){
  $('#spotlight-input').addEventListener('input', e => {
    state.query = e.target.value;
    renderTools(true);
  });
  $('#open-spotlight').addEventListener('click', openSpotlight);
  $('#close-spotlight').addEventListener('click', () => $('#spotlight-modal').close());
  $('#modal-search-input').addEventListener('input', e => renderModalResults(searchTools(e.target.value).slice(0, 14)));
  document.addEventListener('keydown', e => {
    if(e.key === '/' && !isInputActive()){ e.preventDefault(); openSpotlight(); }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openSpotlight(); }
  });
}

export function searchTools(query){
  const q = normalize(query);
  if(!q) return state.herramientas;
  return state.herramientas
    .map(tool => {
      const text = normalize([tool.nombre, tool.notas, tool.categoria, tool.grupo, ...(tool.keywords || [])].join(' '));
      const score = normalize(tool.nombre).includes(q) ? 3 : text.includes(q) ? 1 : 0;
      return {tool, score};
    })
    .filter(x => x.score)
    .sort((a,b) => b.score - a.score || a.tool.orden - b.tool.orden)
    .map(x => x.tool);
}

export function openSpotlight(){
  const modal = $('#spotlight-modal');
  modal.showModal();
  const input = $('#modal-search-input');
  input.value = '';
  renderModalResults(state.herramientas.slice(0, 12));
  setTimeout(() => input.focus(), 50);
}

export function renderModalResults(results){
  $('#modal-results').innerHTML = results.length ? results.map(modalResult).join('') : emptyState('Sin resultados', 'Prueba con KPI, inventario, soporte o campaña.');
  $$('.modal-result').forEach(row => {
    row.addEventListener('click', () => { $('#spotlight-modal').close(); openTool(row.dataset.id); });
    row.addEventListener('keydown', e => { if(e.key === 'Enter'){ $('#spotlight-modal').close(); openTool(row.dataset.id); } });
  });
}
