import { state } from './state.js';
import { $, $$, escapeHtml } from './utils.js';
import { categoryHub, chip } from './components.js';
import { renderTools } from './cards.js';
import { openSpotlight } from './search.js';
import { toast } from './toast.js';
import { goToSection } from './operational.js';
import { revealWorkspace } from './navigation.js';

export function renderDashboard(){
  // Premium: sin métricas redundantes; el foco vive en los bloques accionables.
}

export function renderQuickActions(){
  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay()+6)%7)); weekStart.setHours(0,0,0,0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6); weekEnd.setHours(23,59,59,999);
  const eventosSemana = (state.operacional.eventos || []).filter(e => {
    const start = new Date(`${e['Fecha Inicio']}T00:00:00`);
    const end = new Date(`${e['Fecha Fin'] || e['Fecha Inicio']}T23:59:59`);
    return end >= weekStart && start <= weekEnd;
  }).length;
  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const duty = (state.operacional.dutyRoster || []).find(d => d['Día'] === dayNames[today.getDay()]);
  const cards = [
    {title:'Concursos activos', icon:'🏆', text:'Conoce nuestros 2 concursos activos. Vigencia 03/jul al 10/ago.', action:'openContest', badge:'Ranking'},
    {title:'Mi día operativo', icon:'✅', text:'Rutina diaria, WFM y actividad semanal de hoy.', action:'showToday'},
    {title:'Eventos activos', icon:'📅', text:'Semana o mes con fechas DD/MM y recordatorios CMS.', action:'showEvents', badge:eventosSemana ? `${eventosSemana} semana` : ''},
    {title:'Duty Roster', icon:'🧭', text:duty ? `${duty['Día']}: ${duty.Estaciones}` : 'Imagen y detalle operativo del día.', action:'showDuty'},
    {title:'Desarrollo Partner', icon:'🌱', text:'BT / SS juntos y TBW separado por avance.', action:'showAltas'},
    {title:'Herramientas', icon:'🧰', text:'Buscador, favoritos y categorías cuando lo necesites.', action:'showTools'}
  ];
  $('#command-grid').innerHTML = cards.map(c => `<button class="command-card" type="button" data-action="${c.action}"><span class="command-icon">${c.icon}</span><strong>${escapeHtml(c.title)}</strong><p>${escapeHtml(c.text)}</p>${c.badge?`<em>${escapeHtml(c.badge)}</em>`:''}</button>`).join('');
  $$('#command-grid .command-card').forEach(btn => btn.addEventListener('click', () => runAction(btn.dataset.action)));
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
    renderChips(); renderTools(true);
  }));
}

export function renderCategories(){
  const withCounts = state.categorias.map(c => ({...c, contador: state.herramientas.filter(t => t.categoriaId === c.id).length}));
  $('#category-hubs').innerHTML = withCounts.map(categoryHub).join('');
  $$('.category-card').forEach(card => card.addEventListener('click', () => {
    revealWorkspace(false);
    state.categoria = card.dataset.category;
    renderChips(); renderTools(true);
    document.querySelector('.tools-section').scrollIntoView({behavior:'smooth', block:'start'});
  }));
}

export function runAction(action){
  if(action === 'openSearch') openSpotlight();
  if(action === 'showToday') goToSection('dia-a-dia');
  if(action === 'showEvents') goToSection('eventos-cms');
  if(action === 'showAltas') goToSection('altas-curso');
  if(action === 'showDuty') goToSection('duty-roster');
  if(action === 'showTools') revealWorkspace();
  if(action === 'openContest') window.open('https://enriquecesar.github.io/concurso_venta/', '_blank', 'noopener');
  if(action === 'showFavorites') { revealWorkspace(false); state.categoria = 'favorites'; renderChips(); renderTools(true); document.querySelector('.tools-section').scrollIntoView({behavior:'smooth'}); }
  if(action === 'showRecent') { revealWorkspace(false); state.categoria = 'recent'; renderChips(); renderTools(true); document.querySelector('.tools-section').scrollIntoView({behavior:'smooth'}); }
  if(action === 'refreshData') location.reload();
  if(!['openSearch','showFavorites','showRecent','showToday','showEvents','showAltas','showDuty','refreshData','showTools','openContest'].includes(action)) toast('Acción preparada');
}
