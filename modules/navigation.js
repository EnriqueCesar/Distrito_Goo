import { state } from './state.js';
import { $, $$ } from './utils.js';
import { renderTools } from './cards.js';
import { openSpotlight } from './search.js';

export function bindNavigation(){
  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => nav(btn.dataset.view)));
  $('#show-all').addEventListener('click', () => {
    state.categoria = 'all';
    state.query = '';
    $('#spotlight-input').value = '';
    window.dispatchEvent(new CustomEvent('dgx:filtersChanged'));
    renderTools(true);
  });
}

export function nav(view){
  $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  if(view === 'home') window.scrollTo({top:0, behavior:'smooth'});
  if(view === 'today') $('#dia-a-dia').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'events') $('#eventos-cms').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'favorites') $('.favorites-section').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'recent') $('.recent-section').scrollIntoView({behavior:'smooth', block:'start'});
  if(view === 'search') openSpotlight();
  if(view === 'all') $('.tools-section').scrollIntoView({behavior:'smooth', block:'start'});
}
