import { DATA, state } from './state.js';
import { setJSON } from './storage.js';

export async function loadData(){
  const entries = await Promise.all(Object.entries(DATA).map(async ([key, url]) => {
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error(`No se pudo cargar ${url}`);
    return [key, await res.json()];
  }));
  const loaded = Object.fromEntries(entries);
  state.config = loaded.config;
  state.categorias = loaded.categorias;
  state.herramientas = loaded.herramientas.sort((a,b) => a.orden - b.orden);
  state.dashboard = loaded.dashboard;
  state.favoritosBase = loaded.favoritos;
  state.version = loaded.version;
  if(!state.favorites){
    state.favorites = loaded.favoritos.length ? loaded.favoritos : state.herramientas.filter(t => t.favorito).map(t => t.id);
    setJSON('dgx_favorites', state.favorites);
  }
}
