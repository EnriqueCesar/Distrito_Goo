import { state } from './state.js';
import { $, $$, normalize } from './utils.js';
import { toolCard, emptyState } from './components.js';
import { openNativeApp } from './native-apps.js';
import { toast } from './toast.js';

function setTextIfPresent(id, value){ const el = document.getElementById(id); if(el) el.textContent = value; }
function setHtmlIfPresent(id, value){ const el = document.getElementById(id); if(el) el.innerHTML = value; }
import { setJSON } from './storage.js';

export function getFilteredTools(){
  const q = normalize(state.query);
  return state.herramientas.filter(tool => {
    const inCategory = state.categoria === 'all' ||
      tool.categoriaId === state.categoria;
    const haystack = normalize([tool.nombre, tool.notas, tool.categoria, tool.grupo, tool.tipo, tool.url, tool.webUrl, tool.alias, tool.etiquetas, tool.funcion, ...(tool.keywords || [])].join(' '));
    return inCategory && (!q || haystack.includes(q));
  });
}

export function renderTools(reset = false){
  if(reset) state.visibleCount = 16;
  const all = getFilteredTools();
  const visible = all.slice(0, state.visibleCount);
  const isAllWithoutQuery = state.categoria === 'all' && !state.query;
  if(isAllWithoutQuery){
    setTextIfPresent('result-count', 'Selecciona una categoría');
    setHtmlIfPresent('tools-grid', emptyState('Elige una categoría', 'Distrito Go mostrará solo las herramientas relacionadas. Usa Spotlight para buscar en todo el LaunchPad.'));
    document.getElementById('lazy-sentinel')?.classList.add('hidden');
    return;
  }
  setTextIfPresent('result-count', `${all.length} herramienta${all.length === 1 ? '' : 's'}`);
  setHtmlIfPresent('tools-grid', visible.map(t => toolCard(t, false)).join('') || emptyState('No encontré herramientas'));
  bindToolCards('#tools-grid');
  document.getElementById('lazy-sentinel')?.classList.toggle('hidden', visible.length >= all.length);
}

export function loadMoreTools(){
  const total = getFilteredTools().length;
  if(state.visibleCount < total){
    state.visibleCount += 12;
    renderTools(false);
  }
}

export function renderToolCollection(selector, tools, compact = false){
  const el = $(selector);
  el.innerHTML = tools.map(t => toolCard(t, false, compact)).join('') || emptyState('Sin elementos por ahora');
  bindToolCards(selector);
}

export function bindToolCards(scope){
  $$(`${scope} .tool-card`).forEach(card => {
    card.addEventListener('click', event => {
      if(event.target.closest('.fav-toggle')) return;
      openTool(card.dataset.id);
    });
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openTool(card.dataset.id); }
    });
  });
}

export function openTool(id){
  const tool = state.herramientas.find(t => t.id === id);
  if(!tool) return;
  pushRecent(tool.id);
  state.usage[tool.id] = (state.usage[tool.id] || 0) + 1;
  setJSON('dgx_usage', state.usage);
  if(tool.tipo === 'app' && tool.package){
    openNativeApp(tool);
  }else{
    toast(`Abriendo ${tool.nombre}`);
    window.open(tool.url, '_blank', 'noopener');
  }
}

export function toggleFavorite(id){
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [id, ...state.favorites];
  setJSON('dgx_favorites', state.favorites);
  renderTools(false);
  toast(state.favorites.includes(id) ? 'Agregado a favoritos' : 'Quitado de favoritos');
}

export function pushRecent(id){
  state.recents = [id, ...state.recents.filter(x => x !== id)].slice(0, 10);
  setJSON('dgx_recents', state.recents);
}

export function getByIds(ids){
  return ids.map(id => state.herramientas.find(t => t.id === id)).filter(Boolean);
}

export function getSmartFavorites(){
  return [...state.favorites]
    .sort((a,b) => (state.usage[b] || 0) - (state.usage[a] || 0) || state.favorites.indexOf(a) - state.favorites.indexOf(b))
    .map(id => state.herramientas.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 8);
}

export function renderSmartSections(){
  // Favoritos y recientes se retiraron de la vista principal en la versión LaunchPad Premium.
}
