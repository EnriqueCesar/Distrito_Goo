export const $ = (q, root = document) => root.querySelector(q);
export const $$ = (q, root = document) => [...root.querySelectorAll(q)];
export function esc(v = '') { return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
export function first(obj = {}, keys = []) { for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k]; return ''; }
export function normalize(v = '') { return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
export function todayName() { return new Date().toLocaleDateString('es-MX', { weekday: 'long' }).replace(/^./, c => c.toUpperCase()); }
export function formatDateMX(d) { return d.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' }); }
export function currentWeekRange(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const monday = new Date(d); const diff = (d.getDay() + 6) % 7; monday.setDate(d.getDate() - diff);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const fmt = x => x.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} al ${fmt(sunday)}`;
}
