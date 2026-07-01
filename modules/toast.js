import { $ } from './utils.js';

export function toast(message, type = 'default'){
  const root = $('#toast-root');
  if(!root) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.classList.add('is-leaving'), 2300);
  setTimeout(() => el.remove(), 2700);
}
