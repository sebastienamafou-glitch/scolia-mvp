// scolia-frontend/src/services/api.ts

import axios from 'axios';

// Utilise la variable d'environnement VITE_API_URL, ou localhost par défaut si elle n'existe pas
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 L'INTERCEPTEUR MAGIQUE
// Avant chaque requête, il regarde dans la poche (localStorage) s'il y a un token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // S'il le trouve, il l'attache au dossier (Header)
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
