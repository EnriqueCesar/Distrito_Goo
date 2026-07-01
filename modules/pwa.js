import { state } from './state.js';
import { $ } from './utils.js';
import { toast } from './toast.js';

export function bindPWA(){
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.deferredPrompt = e;
    $('#install-btn').classList.remove('hidden');
  });
  $('#install-btn').addEventListener('click', installPWA);
  window.addEventListener('dgx:install', installPWA);
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => toast('Actualización preparada'));
    }).catch(console.warn);
  }
}

export async function installPWA(){
  if(!state.deferredPrompt){ toast('Usa “Agregar a pantalla de inicio” desde tu navegador'); return; }
  state.deferredPrompt.prompt();
  await state.deferredPrompt.userChoice;
  state.deferredPrompt = null;
  $('#install-btn').classList.add('hidden');
}

export function bindPullToRefresh(){
  let startY = 0;
  let pulling = false;
  const indicator = $('#pull-indicator');
  window.addEventListener('touchstart', e => { if(scrollY === 0) startY = e.touches[0].clientY; }, {passive:true});
  window.addEventListener('touchmove', e => {
    if(scrollY === 0 && e.touches[0].clientY - startY > 82){ pulling = true; indicator.classList.add('show'); }
  }, {passive:true});
  window.addEventListener('touchend', () => {
    if(pulling){ setTimeout(() => location.reload(), 450); }
    pulling = false;
    indicator.classList.remove('show');
  });
}
