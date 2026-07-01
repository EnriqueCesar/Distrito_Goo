const DATA = {
  config: './data/config.v10.json',
  categorias: './data/categorias.v10.json',
  herramientas: './data/herramientas.v10.json',
  dashboard: './data/dashboard.v10.json'
};

const state = {
  config: null,
  categorias: [],
  herramientas: [],
  dashboard: null,
  query: '',
  categoria: 'all',
  deferredPrompt: null,
  recents: JSON.parse(localStorage.getItem('dgx_recents') || '[]'),
  favorites: JSON.parse(localStorage.getItem('dgx_favorites') || 'null')
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const normalize = (value='') => value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

async function boot(){
  bindGlobalEvents();
  await loadData();
  applyTheme();
  renderAll();
  registerPWA();
  toast('Distrito GO 10.0 listo');
}

async function loadData(){
  const [config, categorias, herramientas, dashboard] = await Promise.all(
    Object.values(DATA).map(url => fetch(url, {cache:'no-store'}).then(r => r.json()))
  );
  state.config = config;
  state.categorias = categorias;
  state.herramientas = herramientas.sort((a,b)=>a.orden-b.orden);
  state.dashboard = dashboard;
  if(!state.favorites){
    state.favorites = state.herramientas.filter(t=>t.favorito).map(t=>t.id);
    persistFavorites();
  }
}

function renderAll(){
  renderHeader();
  renderDashboard();
  renderQuickActions();
  renderChips();
  renderCategories();
  renderFavorites();
  renderTools();
  renderModalResults(state.herramientas.slice(0,10));
}

function renderHeader(){
  $('#app-title').textContent = state.config.appName;
  $('#hero-greeting').textContent = state.dashboard.saludo;
  $('#hero-title').textContent = state.dashboard.titulo;
  $('#hero-subtitle').textContent = state.config.tagline;
  $('#last-update').textContent = state.config.version;
}

function renderDashboard(){
  const grid = $('#dashboard-grid');
  grid.innerHTML = state.dashboard.cards.map(card => `
    <article class="metric-card">
      <div class="metric-icon" aria-hidden="true">${card.icono}</div>
      <div>
        <div class="metric-value">${card.valor}</div>
        <div class="metric-label">${card.label}</div>
      </div>
    </article>
  `).join('');
}

function renderQuickActions(){
  $('#quick-actions').innerHTML = state.dashboard.quickActions.map(action => `
    <button class="quick-card" type="button" data-action="${action.action}">
      <span aria-hidden="true">${action.icono}</span>
      <span>${action.label}</span>
    </button>
  `).join('');
  $$('.quick-card').forEach(btn => btn.addEventListener('click', () => runAction(btn.dataset.action)));
}

function renderChips(){
  const chips = [
    {id:'all', nombre:'Todo', icono:'🧭', contador:state.herramientas.length},
    {id:'favorites', nombre:'Favoritos', icono:'⭐', contador:state.favorites.length},
    ...state.categorias.map(c => ({id:c.id, nombre:c.nombre, icono:c.icono, contador:c.contador}))
  ];
  $('#active-chips').innerHTML = chips.map(c => `
    <button class="chip ${state.categoria===c.id?'is-active':''}" type="button" data-category="${c.id}">
      ${c.icono} ${c.nombre} · ${c.contador}
    </button>
  `).join('');
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    state.categoria = chip.dataset.category;
    renderChips(); renderTools();
  }));
}

function renderCategories(){
  $('#category-hubs').innerHTML = state.categorias.map(c => `
    <button class="category-card" type="button" data-category="${c.id}" style="background:linear-gradient(135deg,${c.color},${c.accent})">
      <div class="cat-icon">${c.icono}</div>
      <h4>${c.nombre}</h4>
      <p>${c.descripcion}</p>
      <span class="counter">${c.contador} herramientas</span>
    </button>
  `).join('');
  $$('.category-card').forEach(card => card.addEventListener('click', () => {
    state.categoria = card.dataset.category;
    renderChips(); renderTools();
    document.querySelector('.tools-section').scrollIntoView({behavior:'smooth', block:'start'});
  }));
}

function getFilteredTools(){
  const q = normalize(state.query);
  return state.herramientas.filter(tool => {
    const inCategory = state.categoria === 'all' ||
      (state.categoria === 'favorites' && state.favorites.includes(tool.id)) ||
      tool.categoriaId === state.categoria;
    const haystack = normalize([
      tool.nombre, tool.notas, tool.categoria, tool.grupo, tool.tipo, ...(tool.keywords||[])
    ].join(' '));
    return inCategory && (!q || haystack.includes(q));
  });
}

function renderFavorites(){
  const favTools = state.herramientas.filter(t => state.favorites.includes(t.id)).slice(0, 8);
  $('#favorites-grid').innerHTML = favTools.map(toolCard).join('') || emptyState('Sin favoritos todavía');
  bindToolCards('#favorites-grid');
}

function renderTools(){
  const tools = getFilteredTools();
  $('#result-count').textContent = `${tools.length} resultado${tools.length===1?'':'s'}`;
  $('#tools-grid').innerHTML = tools.map(toolCard).join('') || emptyState('No encontré resultados');
  bindToolCards('#tools-grid');
}

function toolCard(tool){
  const isFav = state.favorites.includes(tool.id);
  return `
    <article class="tool-card" tabindex="0" role="button" data-id="${tool.id}" aria-label="Abrir ${escapeHtml(tool.nombre)}">
      <div class="tool-top">
        <div class="tool-icon" aria-hidden="true">${tool.icono}</div>
        <button class="fav-toggle ${isFav?'is-fav':''}" type="button" data-fav="${tool.id}" aria-label="Marcar favorito">${isFav?'⭐':'☆'}</button>
      </div>
      <h4>${escapeHtml(tool.nombre)}</h4>
      <p>${escapeHtml(tool.notas)}</p>
      <div class="tool-meta">${tool.categoriaIcono} ${escapeHtml(tool.categoria)} · ${tool.tipo === 'app' ? 'App nativa' : 'Web'}</div>
    </article>
  `;
}

function bindToolCards(scope){
  document.querySelectorAll(`${scope} .tool-card`).forEach(card => {
    card.addEventListener('click', (event) => {
      if(event.target.closest('.fav-toggle')) return;
      openTool(card.dataset.id);
    });
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openTool(card.dataset.id); }
    });
  });
  document.querySelectorAll(`${scope} .fav-toggle`).forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(btn.dataset.fav);
    });
  });
}

function openTool(id){
  const tool = state.herramientas.find(t=>t.id===id);
  if(!tool) return;
  pushRecent(tool.id);
  toast(`Abriendo ${tool.nombre}`);
  if(tool.tipo === 'app' && tool.package){
    openNativeApp(tool);
  }else{
    window.open(tool.url, '_blank', 'noopener');
  }
}

function openNativeApp(tool){
  const intentUrl = tool.url || `intent://#Intent;package=${tool.package};end`;
  const fallback = tool.playStore || tool.webUrl || tool.url;
  let didHide = false;
  const onVisibility = () => { if(document.hidden) didHide = true; };
  document.addEventListener('visibilitychange', onVisibility, {once:true});
  window.location.href = intentUrl;
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    if(!didHide && fallback){
      window.location.href = fallback;
    }
  }, 1300);
}

function toggleFavorite(id){
  state.favorites = state.favorites.includes(id)
    ? state.favorites.filter(x=>x!==id)
    : [id, ...state.favorites];
  persistFavorites();
  renderFavorites(); renderTools(); renderChips();
  toast(state.favorites.includes(id) ? 'Agregado a favoritos' : 'Quitado de favoritos');
}

function persistFavorites(){
  localStorage.setItem('dgx_favorites', JSON.stringify(state.favorites));
}

function pushRecent(id){
  state.recents = [id, ...state.recents.filter(x=>x!==id)].slice(0, 8);
  localStorage.setItem('dgx_recents', JSON.stringify(state.recents));
}

function bindGlobalEvents(){
  $('#spotlight-input').addEventListener('input', e => {
    state.query = e.target.value;
    renderTools();
  });
  $('#show-all').addEventListener('click', () => {
    state.categoria='all'; state.query=''; $('#spotlight-input').value='';
    renderChips(); renderTools();
  });
  $('#clear-recents').addEventListener('click', () => {
    state.recents=[]; localStorage.removeItem('dgx_recents'); toast('Historial limpio');
  });
  $('#theme-toggle').addEventListener('click', toggleTheme);
  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => nav(btn.dataset.view)));
  document.addEventListener('keydown', e => {
    if(e.key === '/' && document.activeElement.tagName !== 'INPUT'){ e.preventDefault(); openSpotlight(); }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSpotlight(); }
  });
  $('#close-spotlight').addEventListener('click', () => $('#spotlight-modal').close());
  $('#modal-search-input').addEventListener('input', e => {
    const q = normalize(e.target.value);
    const results = state.herramientas.filter(t => normalize(`${t.nombre} ${t.notas} ${t.categoria} ${t.grupo}`).includes(q)).slice(0,12);
    renderModalResults(results);
  });
  pullToRefresh();
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.deferredPrompt = e;
    $('#install-btn').classList.remove('hidden');
  });
  $('#install-btn').addEventListener('click', async () => runAction('installPWA'));
}

function nav(view){
  $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view===view));
  if(view==='home') window.scrollTo({top:0,behavior:'smooth'});
  if(view==='favorites') $('.favorites-section').scrollIntoView({behavior:'smooth'});
  if(view==='search') openSpotlight();
  if(view==='all') $('.tools-section').scrollIntoView({behavior:'smooth'});
}

function runAction(action){
  if(action==='openSearch') openSpotlight();
  if(action==='showFavorites'){ state.categoria='favorites'; renderChips(); renderTools(); $('.tools-section').scrollIntoView({behavior:'smooth'}); }
  if(action==='refreshData') location.reload();
  if(action==='installPWA') installPWA();
}

async function installPWA(){
  if(!state.deferredPrompt){ toast('Usa “Agregar a pantalla de inicio” desde tu navegador'); return; }
  state.deferredPrompt.prompt();
  await state.deferredPrompt.userChoice;
  state.deferredPrompt = null;
  $('#install-btn').classList.add('hidden');
}

function openSpotlight(){
  const modal = $('#spotlight-modal');
  modal.showModal();
  const input = $('#modal-search-input');
  input.value = '';
  renderModalResults(state.herramientas.slice(0,10));
  setTimeout(()=>input.focus(),50);
}

function renderModalResults(results){
  $('#modal-results').innerHTML = results.map(t => `
    <div class="modal-result" role="button" tabindex="0" data-id="${t.id}">
      <div class="tool-icon">${t.icono}</div>
      <div><strong>${escapeHtml(t.nombre)}</strong><br><small>${t.categoriaIcono} ${escapeHtml(t.categoria)} · ${escapeHtml(t.notas)}</small></div>
    </div>
  `).join('');
  $$('.modal-result').forEach(row => row.addEventListener('click', () => {
    $('#spotlight-modal').close(); openTool(row.dataset.id);
  }));
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

function pullToRefresh(){
  let startY = 0;
  let pulling = false;
  const indicator = $('#pull-indicator');
  window.addEventListener('touchstart', e => { if(scrollY===0) startY = e.touches[0].clientY; }, {passive:true});
  window.addEventListener('touchmove', e => {
    if(scrollY===0 && e.touches[0].clientY - startY > 80){
      pulling = true; indicator.classList.add('show');
    }
  }, {passive:true});
  window.addEventListener('touchend', () => {
    if(pulling){ setTimeout(()=>location.reload(), 450); }
    pulling = false; indicator.classList.remove('show');
  });
}

function registerPWA(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }
}

function toast(message){
  const el = document.createElement('div');
  el.className='toast';
  el.textContent=message;
  $('#toast-root').appendChild(el);
  setTimeout(()=>el.remove(), 2600);
}

function emptyState(text){
  return `<div class="metric-card" style="grid-column:1/-1"><div class="metric-icon">☕</div><div><strong>${text}</strong><div class="metric-label">Intenta otra búsqueda o categoría.</div></div></div>`;
}

function escapeHtml(value=''){
  return value.toString().replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
}

boot().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="app-shell"><section class="hero-card"><h2>No se pudo cargar Distrito GO</h2><p>Revisa los archivos JSON de data.</p></section></main>`;
});
