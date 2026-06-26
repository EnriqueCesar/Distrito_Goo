export const $ = (q, root = document) => root.querySelector(q);
export const $$ = (q, root = document) => [...root.querySelectorAll(q)];
export function esc(v = '') { return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
export function first(obj = {}, keys = []) { for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k]; return ''; }
export function normalize(v = '') { return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
export function todayName(date = new Date()) { return date.toLocaleDateString('es-MX', { weekday: 'long' }).replace(/^./, c => c.toUpperCase()); }
export function formatDateMX(d) { return d.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', hour:'2-digit', minute:'2-digit' }); }
export function excelSerialToDate(n){ const d = new Date(Date.UTC(1899,11,30)); d.setUTCDate(d.getUTCDate()+Number(n)); return d; }
export function toDate(v, end=false){
  let d;
  if (typeof v === 'number') d = excelSerialToDate(v);
  else if (/^\d+(\.\d+)?$/.test(String(v).trim())) d = excelSerialToDate(Number(v));
  else if (/^\d{1,2}-[a-záéíóú]{3}/i.test(String(v).trim())) {
    const [day, mon] = String(v).trim().split('-');
    const months = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
    d = new Date(new Date().getFullYear(), months[normalize(mon).slice(0,3)] ?? 0, Number(day));
  } else d = new Date(v || '1900-01-01');
  if (isNaN(d)) d = new Date('1900-01-01');
  if(end)d.setHours(23,59,59,999); else d.setHours(0,0,0,0);
  return d;
}
export function currentWeekRange(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const monday = new Date(d); const diff = (d.getDay() + 6) % 7; monday.setDate(d.getDate() - diff);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const fmt = x => x.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  return `${fmt(monday)} al ${fmt(sunday)}`;
}
export function sameMonthDay(a,b=new Date()){ const d=toDate(a); return d.getDate()===b.getDate() && d.getMonth()===b.getMonth(); }
export function shortName(full=''){ const parts=String(full).trim().split(/\s+/).filter(Boolean); return parts.slice(0,2).join(' '); }
