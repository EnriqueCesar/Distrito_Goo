import { DATA, state } from './state.js';
import { setJSON } from './storage.js';

async function fetchJson(key, url){
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if(!response.ok){
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }
    try {
      return [key, await response.json()];
    } catch(parseError){
      throw new Error(`JSON inválido: ${parseError.message}`);
    }
  } catch(error){
    console.error(`[Distrito Go] Error al cargar ${url}`, error);
    throw new Error(`No se pudo cargar ${url}: ${error.message}`, { cause: error });
  }
}

export async function loadData(){
  const entries = await Promise.all(
    Object.entries(DATA).map(([key, url]) => fetchJson(key, url))
  );
  const loaded = Object.fromEntries(entries);
  state.config = loaded.config;
  state.categorias = loaded.categorias;
  state.herramientas = loaded.herramientas.sort((a,b) => a.orden - b.orden);
  state.dashboard = loaded.dashboard;
  state.favoritosBase = loaded.favoritos;
  state.version = loaded.version;
  state.operacional = loaded.operacional;
  if(!state.favorites){
    state.favorites = loaded.favoritos.length ? loaded.favoritos : state.herramientas.filter(t => t.favorito).map(t => t.id);
    setJSON('dgx_favorites', state.favorites);
  }
}
