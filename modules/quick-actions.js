import { state } from './state.js';
import { $, $$ } from './utils.js';
import { quickAction, categoryHub, chip, metricCard } from './components.js';
import { renderTools } from './cards.js';
import { openSpotlight } from './search.js';
import { toast } from './toast.js';
import { goToSection } from './operational.js';

export function renderDashboard(){
  $('#dashboard-grid').innerHTML = state.dashboard.cards.map(metricCard).join('');
}

export function renderQuickActions(){
  const actions = [
    ...state.dashboard.quickActions,
    { id:'recent', label:'Últimos abiertos', icono:'🕘', action:'showRecent' }
  ];
  $('#quick-actions').innerHTML = actions.map(quickAction).join('');
  $$('.quick-card').forEach(btn => btn.addEventListener('click', () => runAction(btn.dataset.action)));
}

export function renderChips(){
  const chips = [
    { id:'all', nombre:'Todo', icono:'🧭', contador: state.herramientas.length },
    { id:'favorites', nombre:'Favoritos', icono:'⭐', contador: state.favorites.length },
    { id:'recent', nombre:'Recientes', icono:'🕘', contador: state.recents.length },
    ...state.categorias.map(c => ({...c, contador: state.herramientas.filter(t => t.categoriaId === c.id).length}))
  ];
  $('#active-chips').innerHTML = chips.map(c => chip(c, state.categoria === c.id)).join('');
  $$('.chip').forEach(el => el.addEventListener('click', () => {
    state.categoria = el.dataset.category;
    renderChips();
    renderTools(true);
  }));
}

export function renderCategories(){
  const withCounts = state.categorias.map(c => ({...c, contador: state.herramientas.filter(t => t.categoriaId === c.id).length}));
  $('#category-hubs').innerHTML = withCounts.map(categoryHub).join('');
  $$('.category-card').forEach(card => card.addEventListener('click', () => {
    state.categoria = card.dataset.category;
    renderChips();
    renderTools(true);
    document.querySelector('.tools-section').scrollIntoView({behavior:'smooth', block:'start'});
  }));
}

export function runAction(action){
  if(action === 'openSearch') openSpotlight();
  if(action === 'showFavorites') { state.categoria = 'favorites'; renderChips(); renderTools(true); document.querySelector('.tools-section').scrollIntoView({behavior:'smooth'}); }
  if(action === 'showRecent') { state.categoria = 'recent'; renderChips(); renderTools(true); document.querySelector('.tools-section').scrollIntoView({behavior:'smooth'}); }
  if(action === 'showToday') goToSection('dia-a-dia');
  if(action === 'showEvents') goToSection('eventos-cms');
  if(action === 'showAltas') goToSection('altas-curso');
  if(action === 'showDuty') goToSection('duty-roster');
  if(action === 'refreshData') location.reload();
  if(action === 'installPWA') window.dispatchEvent(new CustomEvent('dgx:install'));
  if(!['openSearch','showFavorites','showRecent','showToday','showEvents','showAltas','showDuty','refreshData','installPWA'].includes(action)) toast('Acción preparada para futuras versiones');
}
