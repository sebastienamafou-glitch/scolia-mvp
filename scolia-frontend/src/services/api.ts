// scolia-frontend/src/services/api.ts

import axios from 'axios';

// L'URL de notre Backend NestJS
const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour insérer le token JWT dans toutes les requêtes (sauf login)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Le jeton est inséré au format 'Bearer <token>'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
