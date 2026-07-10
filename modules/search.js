import { state } from './state.js';
import { $, $$, normalize, isInputActive } from './utils.js';
import { modalResult, emptyState } from './components.js';
import { openTool, renderTools } from './cards.js';

export function bindSearch(){
  const spotlightInput = document.getElementById('spotlight-input');
  spotlightInput?.addEventListener('input', e => {
    state.query = e.target.value;
    renderTools(true);
  });
  document.getElementById('open-spotlight')?.addEventListener('click', openSpotlight);
  document.getElementById('close-spotlight')?.addEventListener('click', () => document.getElementById('spotlight-modal')?.close());
  document.getElementById('modal-search-input')?.addEventListener('input', e => renderModalResults(searchTools(e.target.value).slice(0, 14)));
  document.addEventListener('keydown', e => {
    if(e.key === '/' && !isInputActive()){ e.preventDefault(); openSpotlight(); }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openSpotlight(); }
  });
}

export function searchTools(query){
  const q = normalize(query);
  if(!q) return state.herramientas;
  const terms = q.split(/\s+/).filter(Boolean);
  return state.herramientas
    .map(tool => {
      const name = normalize(tool.nombre);
      const category = normalize(tool.categoria);
      const keywords = normalize((tool.keywords || []).join(' '));
      const meta = normalize([tool.notas, tool.grupo, tool.tipo, tool.url, tool.webUrl, tool.alias, tool.etiquetas, tool.funcion].join(' '));
      const haystack = `${name} ${category} ${keywords} ${meta}`;
      let score = 0;
      if(name === q) score += 120;
      if(name.startsWith(q)) score += 80;
      if(name.includes(q)) score += 60;
      if(category.includes(q)) score += 36;
      if(keywords.includes(q)) score += 28;
      if(meta.includes(q)) score += 16;
      for(const term of terms){
        if(name.includes(term)) score += 14;
        else if(category.includes(term)) score += 9;
        else if(keywords.includes(term)) score += 7;
        else if(meta.includes(term)) score += 4;
        else if(!haystack.includes(term)) score -= 12;
      }
      return {tool, score};
    })
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score || a.tool.orden - b.tool.orden)
    .map(x => x.tool);
}

export function openSpotlight(){
  const modal = $('#spotlight-modal');
  if(!modal?.showModal) return;
  modal.showModal();
  const input = $('#modal-search-input');
  if(!input) return;
  input.value = '';
  renderModalResults(state.herramientas.slice(0, 10));
  setTimeout(() => input.focus(), 50);
}

export function renderModalResults(results){
  const container = document.getElementById('modal-results');
  if(!container) return;
  container.innerHTML = results.length ? results.map(modalResult).join('') : emptyState('Sin resultados', 'Prueba con KPI, inventario, soporte o campaña.');
  $$('.modal-result').forEach(row => {
    row.addEventListener('click', () => { document.getElementById('spotlight-modal')?.close(); openTool(row.dataset.id); });
    row.addEventListener('keydown', e => { if(e.key === 'Enter'){ document.getElementById('spotlight-modal')?.close(); openTool(row.dataset.id); } });
  });
}
