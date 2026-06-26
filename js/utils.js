export const $=(s,root=document)=>root.querySelector(s);export const $$=(s,root=document)=>[...root.querySelectorAll(s)];
export const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export function todayName(){return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()]}
export function fmtDate(d){if(!d)return'';let x=new Date(String(d).replace(/(\d+)-(\w+)/,'$1 $2'));if(isNaN(x)){const p=String(d).split('-');return d}return x.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}
export function normalize(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim()}
export function parseDate(s){if(!s)return null;let t=String(s).trim().toLowerCase();const meses={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};let m=t.match(/(\d{1,2})[-\/ ]([a-záéíóú]{3,})/i);if(m){let mm=meses[normalize(m[2]).slice(0,3)]??0;return new Date(new Date().getFullYear(),mm,+m[1])}let d=new Date(t.replace(/\//g,'-'));return isNaN(d)?null:d}
export function inRange(start,end){const now=new Date();now.setHours(0,0,0,0);const s=parseDate(start),e=parseDate(end||start);if(!s)return false;s.setHours(0,0,0,0);(e||s).setHours(23,59,59,999);return now>=s&&now<=(e||s)}
export function upcoming(start){const now=new Date();now.setHours(0,0,0,0);const s=parseDate(start);return s && s>=now}
export function first(o,names){for(const n of names){if(o[n]!==undefined&&o[n]!==null&&String(o[n]).trim()!=='')return o[n]}return''}
