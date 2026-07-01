import { state } from './state.js';
import { loadData } from './data.js';
import { $, $$ } from './utils.js';
import { toast } from './toast.js';
import { setJSON, remove } from './storage.js';
import { bindSearch } from './search.js';
import { bindNavigation } from './navigation.js';
import { bindPWA, bindPullToRefresh } from './pwa.js';
import { renderDashboard, renderQuickActions, renderChips, renderCategories } from './quick-actions.js';
import { renderTools, loadMoreTools, renderSmartSections } from './cards.js';

async function boot(){
  bindStaticEvents();
  await loadData();
  applyTheme();
  renderHeader();
  renderDashboard();
  renderQuickActions();
  renderChips();
  renderSmartSections();
  renderCategories();
  renderTools(true);
  bindSearch();
  bindNavigation();
  bindPWA();
  bindPullToRefresh();
  bindLazyLoading();
  toast('Entrega 2 lista');
}

function renderHeader(){
  $('#app-title').textContent = state.config.appName;
  $('#hero-greeting').textContent = state.dashboard.saludo;
  $('#hero-title').textContent = state.dashboard.titulo;
  $('#hero-subtitle').textContent = state.config.tagline;
  $('#last-update').textContent = state.config.version;
}

function bindStaticEvents(){
  $('#theme-toggle').addEventListener('click', toggleTheme);
  $('#clear-recents').addEventListener('click', () => {
    state.recents = [];
    remove('dgx_recents');
    renderSmartSections();
    renderChips();
    renderTools(false);
    toast('Historial limpio');
  });
  $('#reset-favorites').addEventListener('click', () => {
    state.favorites = [...state.favoritosBase];
    setJSON('dgx_favorites', state.favorites);
    renderSmartSections();
    renderChips();
    renderTools(false);
    toast('Favoritos restaurados');
  });
  $('#close-quick-modal').addEventListener('click', () => $('#quick-modal').close());
  window.addEventListener('dgx:filtersChanged', renderChips);
}

function bindLazyLoading(){
  const sentinel = $('#lazy-sentinel');
  const observer = new IntersectionObserver(entries => {
    if(entries.some(entry => entry.isIntersecting)) loadMoreTools();
  }, {rootMargin:'360px'});
  observer.observe(sentinel);
}

function toggleTheme(){
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('dgx_theme', next);
  $('#theme-toggle').textContent = next === 'dark' ? '☀' : '☾';
}

function applyTheme(){
  const saved = localStorage.getItem('dgx_theme') || 'light';
  document.documentElement.dataset.theme = saved;
  $('#theme-toggle').textContent = saved === 'dark' ? '☀' : '☾';
}

boot().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="app-shell"><section class="hero-card"><h2>No se pudo cargar Distrito GO</h2><p>Revisa los archivos JSON de data.</p></section></main>`;
});
