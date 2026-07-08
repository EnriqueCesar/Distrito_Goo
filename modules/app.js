import { state } from './state.js';
import { loadData } from './data.js';
import { $ } from './utils.js';
import { toast } from './toast.js';
import { setJSON, remove } from './storage.js';
import { bindSearch } from './search.js';
import { bindNavigation, revealWorkspace } from './navigation.js';
import { bindPWA, bindPullToRefresh } from './pwa.js';
import { renderDashboard, renderQuickActions, renderChips, renderCategories } from './quick-actions.js';
import { renderTools, loadMoreTools } from './cards.js';
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
  renderCategories();
  renderTools(true);
  bindSearch();
  bindNavigation();
  bindPWA();
  bindPullToRefresh();
  bindLazyLoading();
  bindBearistaInformativo();
  toast('Listo para operar');
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
  const toggleTools = $('#toggle-tools');
  if(toggleTools) toggleTools.addEventListener('click', revealWorkspace);
  const toggleFilters = $('#toggle-filters');
  if(toggleFilters){
    toggleFilters.addEventListener('click', () => {
      const panel = $('#tool-workspace');
      const collapsed = panel.classList.toggle('filters-collapsed');
      toggleFilters.textContent = collapsed ? 'Mostrar filtros' : 'Ocultar filtros';
      toggleFilters.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  $('#close-quick-modal').addEventListener('click', () => $('#quick-modal').close());
  document.querySelectorAll('[data-campaign-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.campaignModal;
      $('#quick-modal-title').textContent = '🌎 Radar Mundialista · ¿Y Si, Sí?';
      $('#quick-modal-body').innerHTML = `<img class="modal-image campaign-modal-image" src="${src}" alt="Radar Mundialista ¿Y Si, Sí?" loading="lazy"/>`;
      $('#quick-modal').showModal();
    });
  });
  window.addEventListener('dgx:filtersChanged', () => { renderChips(); renderTools(true); });
}


function bindBearistaInformativo(){
  const card = $('#bearista-informativo');
  if(!card) return;
  const imgSrc = 'assets/img/bearistahugger.jpeg';
  const now = new Date();
  const start = new Date('2026-07-05T00:00:00');
  const end = new Date('2026-07-07T00:00:00');
  const force = new URLSearchParams(window.location.search).get('bearista') === '1';
  const active = force || (now >= start && now < end);
  if(!active){
    card.remove();
    return;
  }
  card.classList.remove('hidden');
  if(localStorage.getItem('dgx_bearista_hugger_closed') === '1') card.classList.add('is-collapsed');
  const openBearista = () => {
    $('#quick-modal-title').textContent = 'Desafío adicional ¿Y Si, 100%?';
    $('#quick-modal-body').innerHTML = `<img class="modal-image bearista-modal-image" src="${imgSrc}" alt="Desafío adicional Bearista Hugger" loading="lazy"/>`;
    $('#quick-modal').showModal();
  };
  document.querySelectorAll('[data-bearista-modal]').forEach(btn => btn.addEventListener('click', openBearista));
  const close = $('#bearista-close');
  if(close){
    close.addEventListener('click', () => {
      localStorage.setItem('dgx_bearista_hugger_closed', '1');
      card.classList.add('is-collapsed');
      toast('Informativo minimizado');
    });
  }
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
