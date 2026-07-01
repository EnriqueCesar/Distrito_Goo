import { getJSON } from './storage.js';

export const DATA = {
  config: './data/config.v10.json',
  categorias: './data/categorias.v10.json',
  herramientas: './data/herramientas.v10.json',
  dashboard: './data/dashboard.v10.json',
  favoritos: './data/favoritos.v10.json',
  version: './data/version.v10.json'
};

export const state = {
  config: null,
  categorias: [],
  herramientas: [],
  dashboard: null,
  favoritosBase: [],
  version: null,
  query: '',
  categoria: 'all',
  visibleCount: 16,
  deferredPrompt: null,
  recents: getJSON('dgx_recents', []),
  usage: getJSON('dgx_usage', {}),
  favorites: getJSON('dgx_favorites', null)
};
