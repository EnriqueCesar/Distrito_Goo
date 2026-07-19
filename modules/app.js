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
  bindToolControls();
  bindNavigation();
  bindPWA();
  bindPullToRefresh();
  bindLazyLoading();
  bindBearistaInformativo();
  document.body.classList.add('app-ready');
}

function bindToolControls(){
  document.querySelectorAll('[data-tool-mode]').forEach(button => {
    button.addEventListener('click', () => {
      state.toolMode = button.dataset.toolMode || 'all';
      document.querySelectorAll('[data-tool-mode]').forEach(item => item.classList.toggle('is-active', item === button));
      renderTools(true);
    });
  });
  const sort = byId('tool-sort');
  if(sort){
    sort.value = state.toolSort;
    sort.addEventListener('change', () => {
      state.toolSort = sort.value;
      localStorage.setItem('dgx_tool_sort', state.toolSort);
      renderTools(true);
    });
  }
}

function getPartnerGreeting(now = new Date()){
  const hour = now.getHours();
  const greeting = state.identity?.hero?.greeting || {};
  if(hour < 12) return greeting.morning || '';
  if(hour < 19) return greeting.afternoon || '';
  return greeting.evening || '';
}

function renderHeader(){
  setText('app-title', state.config.appName);

  const campaign = state.identity?.hero?.campaign || {};
  const coach = state.identity?.coach || {};
  setText('hero-title', getPartnerGreeting());
  setText('hero-campaign-primary', campaign.primary || '');
  setText('hero-campaign-accent', campaign.accent || '');
  const hashtags = Array.isArray(state.identity?.hero?.hashtags) ? state.identity.hero.hashtags : [];
  setText('hero-hashtags', hashtags.join(' · '));
  setText('workspace-campaign', campaign.display || [campaign.primary, campaign.accent].filter(Boolean).join(' '));

  const campaignEl = byId('hero-campaign');
  if(campaignEl){
    campaignEl.style.setProperty('--campaign-primary', campaign.primaryColor || '#006241');
    campaignEl.style.setProperty('--campaign-accent', campaign.accentColor || '#111111');
  }

  const photo = state.config.emergencyContact?.photo;
  const dmPhoto = byId('dm-photo');
  const hoverName = coach.hoverName || 'District Manager';
  const hoverRole = coach.hoverRole || 'DM';
  if(photo && dmPhoto) dmPhoto.src = `./${photo}`;
  if(dmPhoto) dmPhoto.alt = `Abrir contacto con ${hoverName}`;

  const dmUrl = coach.contactEnabled === false ? '' : (coach.contactUrl || state.config.emergencyContact?.url || '');
  const dmContact = byId('dm-contact');
  if(dmContact){
    if(dmUrl) dmContact.href = dmUrl;
    dmContact.setAttribute('aria-label', `Abrir contacto directo con ${hoverName}, ${hoverRole}`);
  }
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

  byId('close-quick-modal')?.addEventListener('click', closeQuickModal);
  byId('quick-modal')?.addEventListener('click', event => {
    if(event.target === byId('quick-modal')) closeQuickModal();
  });
  document.addEventListener('click', handleImageViewerClick);
  window.addEventListener('dgx:filtersChanged', () => { renderChips(); renderTools(true); });
}


const IMAGE_LINK_PATTERN = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

function closeQuickModal(){
  const modal = byId('quick-modal');
  if(!modal) return;
  modal.close();
  modal.classList.remove('is-image-viewer');
  setHtml('quick-modal-body', '');
}

function openImageViewer(title, src){
  if(!src) return;
  const modal = byId('quick-modal');
  if(!modal?.showModal) return;
  setText('quick-modal-title', title || 'Imagen');
  setHtml('quick-modal-body', `<img class="modal-image image-viewer-media" src="${src}" alt="${title || 'Imagen'}" loading="eager"/>`);
  modal.classList.add('is-image-viewer');
  modal.showModal();
}

function handleImageViewerClick(event){
  const trigger = event.target.closest('[data-image-viewer],[data-image],[data-campaign-modal],[data-bearista-modal],a[href]');
  if(!trigger) return;
  let src = trigger.dataset.imageViewer || trigger.dataset.image || trigger.dataset.campaignModal || trigger.dataset.bearistaModal || '';
  if(!src && trigger.matches('a[href]')){
    const href = trigger.getAttribute('href') || '';
    if(!IMAGE_LINK_PATTERN.test(href)) return;
    src = href;
  }
  if(!src) return;
  event.preventDefault();
  event.stopPropagation();
  const nestedImage = trigger.querySelector('img');
  const title = trigger.dataset.imageTitle || trigger.dataset.title || nestedImage?.alt || trigger.getAttribute('aria-label') || 'Imagen';
  openImageViewer(title, src);
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

window.addEventListener('online', () => updateConnectionState());
window.addEventListener('offline', () => updateConnectionState());
function updateConnectionState(){
  const el = byId('connection-status');
  if(!el) return;
  el.hidden = navigator.onLine;
  el.textContent = navigator.onLine ? '' : 'Sin conexión · usando contenido disponible';
}
updateConnectionState();

boot().catch(error => {
  console.error('[Distrito Go] Falló el arranque de la aplicación:', error);
  toast(error?.message || 'No se pudo cargar Distrito Go');
});
