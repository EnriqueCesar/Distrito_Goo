export function getJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function setJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
export function remove(key){ localStorage.removeItem(key); }
