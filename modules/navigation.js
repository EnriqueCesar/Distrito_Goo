import { state } from './state.js';
import { $, $$ } from './utils.js';
import { renderTools } from './cards.js';
import { openSpotlight } from './search.js';

export function bindNavigation(){
  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => nav(btn.dataset.view)));
  $('#show-all').addEventListener('click', () => {
    revealWorkspace(false);
    state.categoria = 'all'; state.query = '';
    $('#spotlight-input').value = '';
    window.dispatchEvent(new CustomEvent('dgx:filtersChanged'));
    renderTools(true);
  });
}

export function revealWorkspace(scroll = true){
  const section = $('#tool-workspace');
  const body = $('#workspace-body');
  if(body.hidden){
    body.hidden = false; section.classList.remove('is-collapsed');
    $('#toggle-tools').textContent = 'Ocultar herramientas';
  }
  if(scroll) section.scrollIntoView({behavior:'smooth', block:'start'});
}

export function nav(view){
  $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  if(view === 'home') window.scrollTo({top:0, behavior:'smooth'});
  if(view === 'contest') $('#concurso-venta').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'today') $('#dia-a-dia').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'events') $('#eventos-cms').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'altas') $('#altas-curso').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'search') openSpotlight();
  if(view === 'all') revealWorkspace();
}
