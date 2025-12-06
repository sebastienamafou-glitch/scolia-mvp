// scolia-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import api from '../services/api';
import { UserRole } from '../types/userRole';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole; // Utilisation directe du type importé
  schoolId: number | null; 
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => { 
    try {
      // 1. On configure axios globalement pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 2. On envoie le token dans cette requête spécifique pour garantir l'actualité
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` } 
      }); 
      
      const userData = response.data;
      
      setUser(userData);           
      // Force le typage ici pour rassurer TypeScript que la string reçue est bien un UserRole
      setUserRole(userData.role as UserRole);
      setIsAuthenticated(true);
    } catch (error: any) { 
      console.error('Token verification failed:', error);
      
      // 👇 CONDITION DE SÉCURITÉ : Déconnecter uniquement si le token est invalide/expiré (401) ou non autorisé (403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('access_token');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => { 
    setIsLoading(true); 
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 👇 ROBUSTESSE : On cherche le token sous plusieurs noms possibles
      const token = response.data.access_token || response.data.accessToken || response.data.token;

      if (!token) {
        throw new Error("Token introuvable dans la réponse du serveur");
      }

      // Sauvegarde
      localStorage.setItem('access_token', token);
      
      // On lance la vérification immédiatement avec le token reçu
      await verifyToken(token);

    } catch (error) {
      console.error("Erreur Login:", error);
      // En cas d'erreur au login, on s'assure que rien ne traine
      localStorage.removeItem('access_token');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization']; // On nettoie le header
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
