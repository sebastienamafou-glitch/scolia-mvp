// scolia-frontend/src/services/api.ts

import axios from 'axios';

// UTILISER LA VARIABLE D'ENVIRONNEMENT
// Si on est en local, on utilise localhost.
// Si on est en prod, Vite injectera l'URL de production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log("API URL active :", API_URL); // Pour le débogage

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour insérer le token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
