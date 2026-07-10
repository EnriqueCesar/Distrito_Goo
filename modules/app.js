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

function byId(id){ return document.getElementById(id); }
function setText(id, value){ const el = byId(id); if(el) el.textContent = value; }
function setHtml(id, value){ const el = byId(id); if(el) el.innerHTML = value; }

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
  collapseFiltersByDefault();
  bindSearch();
  bindNavigation();
  bindPWA();
  bindPullToRefresh();
  bindLazyLoading();
  bindBearistaInformativo();
  toast('Listo para operar');
}

function getPartnerGreeting(now = new Date()){
  const hour = now.getHours();
  if(hour < 12) return 'Buenos días Partner';
  if(hour < 19) return 'Buenas tardes Partner';
  return 'Buenas noches Partner';
}

function renderHeader(){
  setText('app-title', state.config.appName);
  setText('hero-greeting', '#GreenApronService · #DistritoKike🚀');
  setText('hero-title', getPartnerGreeting());
  setText('hero-subtitle', 'Accede rápidamente a herramientas, eventos y recursos operativos del distrito.');
  const photo = state.config.emergencyContact?.photo;
  const dmPhoto = byId('dm-photo');
  if(photo && dmPhoto) dmPhoto.src = `./${photo}`;
  const dmContact = byId('dm-contact');
  if(dmContact) dmContact.href = state.config.emergencyContact?.url || 'https://wa.me/message/ENKDSAHYHIGAN1';
  updateClock();
  setInterval(updateClock, 60000);
}

function updateClock(){
  const now = new Date();
  const date = now.toLocaleDateString('es-MX', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  const time = now.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'});
  setText('hero-title', getPartnerGreeting(now));
  setText('hero-date', `${date} · ${time}`);
}

function bindStaticEvents(){
  byId('theme-toggle')?.addEventListener('click', toggleTheme);
  byId('start-day')?.addEventListener('click', () => byId('dia-a-dia')?.scrollIntoView({behavior:'smooth', block:'start'}));
  byId('open-tools-panel')?.addEventListener('click', revealWorkspace);
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

  byId('close-quick-modal')?.addEventListener('click', () => byId('quick-modal')?.close());
  document.querySelectorAll('[data-campaign-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.campaignModal;
      setText('quick-modal-title', '🌎 Radar Mundialista · ¿Y Si, Sí?');
      setHtml('quick-modal-body', `<img class="modal-image campaign-modal-image" src="${src}" alt="Radar Mundialista ¿Y Si, Sí?" loading="lazy"/>`);
      const modal = byId('quick-modal');
      if(modal?.showModal) modal.showModal();
    });
  });
  window.addEventListener('dgx:filtersChanged', () => { renderChips(); renderTools(true); });
}


function collapseFiltersByDefault(){
  const panel = $('#tool-workspace');
  const toggleFilters = $('#toggle-filters');
  if(!panel || !toggleFilters) return;
  panel.classList.add('filters-collapsed');
  toggleFilters.textContent = 'Mostrar filtros';
  toggleFilters.setAttribute('aria-expanded', 'false');
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
    setText('quick-modal-title', 'Desafío adicional ¿Y Si, 100%?');
    setHtml('quick-modal-body', `<img class="modal-image bearista-modal-image" src="${imgSrc}" alt="Desafío adicional Bearista Hugger" loading="lazy"/>`);
    const modal = byId('quick-modal');
    if(modal?.showModal) modal.showModal();
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
  setText('theme-toggle', next === 'dark' ? '☀' : '☾');
}

function applyTheme(){
  const saved = localStorage.getItem('dgx_theme') || 'light';
  document.documentElement.dataset.theme = saved;
  setText('theme-toggle', saved === 'dark' ? '☀' : '☾');
}

boot().catch(error => {
  console.error('[Distrito Go] Falló el arranque de la aplicación:', error);
  toast(error?.message || 'No se pudo cargar Distrito Go');
});
