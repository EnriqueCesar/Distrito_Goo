import { state } from './state.js';
import { loadData } from './data.js';
import { $ } from './utils.js';
import { toast } from './toast.js';
import { setJSON, remove } from './storage.js';
import { bindSearch } from './search.js';
import { bindNavigation, revealWorkspace } from './navigation.js';
import { bindPWA, bindPullToRefresh } from './pwa.js';
import { renderDashboard, renderQuickActions, renderChips, renderCategories } from './quick-actions.js';
import { renderTools, loadMoreTools, renderSmartSections } from './cards.js';
import { renderOperationalSections } from './operational.js';

async function boot(){
  bindStaticEvents();
  await loadData();
  applyTheme();
  renderHeader();
  renderDashboard();
  renderQuickActions();
  renderChips();
  renderOperationalSections();
  renderSmartSections();
  renderCategories();
  renderTools(true);
  bindSearch();
  bindNavigation();
  bindPWA();
  bindPullToRefresh();
  bindLazyLoading();
  toast('Distrito Go actualizado');
}

function renderHeader(){
  $('#app-title').textContent = state.config.appName;
  $('#hero-greeting').textContent = state.dashboard.saludo;
  $('#hero-title').textContent = state.dashboard.titulo;
  $('#hero-subtitle').textContent = state.dashboard.subtitulo || state.config.tagline;
  const photo = state.config.emergencyContact?.photo;
  if(photo) $('#dm-photo').src = `./${photo}`;
  $('#dm-contact').href = state.config.emergencyContact?.url || '#';
  updateClock();
  setInterval(updateClock, 60000);
}

function updateClock(){
  const now = new Date();
  const date = now.toLocaleDateString('es-MX', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  const time = now.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'});
  $('#hero-date').textContent = `${date} · ${time}`;
}

function bindStaticEvents(){
  $('#theme-toggle').addEventListener('click', toggleTheme);
  $('#start-day').addEventListener('click', () => $('#dia-a-dia').scrollIntoView({behavior:'smooth', block:'start'}));
  $('#open-tools-panel').addEventListener('click', revealWorkspace);
  $('#toggle-tools').addEventListener('click', revealWorkspace);
  $('#clear-recents').addEventListener('click', () => {
    state.recents = [];
    remove('dgx_recents');
    renderSmartSections(); renderChips(); renderTools(false);
    toast('Historial limpio');
  });
  $('#reset-favorites').addEventListener('click', () => {
    state.favorites = [...state.favoritosBase];
    setJSON('dgx_favorites', state.favorites);
    renderSmartSections(); renderChips(); renderTools(false);
    toast('Favoritos restaurados');
  });
  $('#close-quick-modal').addEventListener('click', () => $('#quick-modal').close());
  document.querySelectorAll('[data-campaign-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.campaignModal;
      $('#quick-modal-title').textContent = '🌎 Radar Mundialista · ¿Y Si, Sí?';
      $('#quick-modal-body').innerHTML = `<img class="modal-image campaign-modal-image" src="${src}" alt="Radar Mundialista ¿Y Si, Sí?" loading="lazy"/>`;
      $('#quick-modal').showModal();
    });
  });
  window.addEventListener('dgx:filtersChanged', renderChips);
}

function bindLazyLoading(){
  const sentinel = $('#lazy-sentinel');
  if(!sentinel) return;
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
  toast('No se pudo cargar Distrito Go');
});
