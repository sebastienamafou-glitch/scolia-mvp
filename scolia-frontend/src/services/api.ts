// scolia-frontend/src/services/api.ts

import axios from 'axios';

// On détermine l'URL de base selon si on est en local ou en production
// Si vous testez en local, assurez-vous que c'est localhost:3000
const API_URL = 'https://scolia-backend-nfqc.onrender.com'; 

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
