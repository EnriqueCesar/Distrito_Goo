import { toast } from './toast.js';

export function openNativeApp(tool){
  const intentUrl = tool.url || `intent://#Intent;package=${tool.package};end`;
  const fallback = tool.playStore || tool.webUrl || tool.url;
  let didHide = false;
  const markHidden = () => { if(document.hidden) didHide = true; };
  document.addEventListener('visibilitychange', markHidden, { once: true });
  toast(`Intentando abrir ${tool.nombre}`);
  window.location.href = intentUrl;
  setTimeout(() => {
    document.removeEventListener('visibilitychange', markHidden);
    if(!didHide && fallback){
      toast('App no detectada, abriendo alternativa');
      window.location.href = fallback;
    }
  }, 1350);
}
