// scolia-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import api from '../services/api';

// On définit le type Role localement
export type Role = 'Admin' | 'Enseignant' | 'Parent' | 'Élève' | 'SuperAdmin';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  schoolId: number | null; 
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: Role | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (_token: string) => { 
    try {
      // 1. On met à jour la config globale pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${_token}`;

      // 2. ⚡ CORRECTION CRITIQUE ICI ⚡
      // On force l'envoi du token DANS cette requête spécifique pour éviter le 401
      // car parfois la config globale 'api.defaults' prend quelques millisecondes à s'appliquer.
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${_token}` } 
      }); 
      
      const userData = response.data;
      
      setUser(userData);           
      setUserRole(userData.role as Role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      // Nettoyage en cas d'erreur
      localStorage.removeItem('access_token');
      delete api.defaults.headers.common['Authorization'];
      
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => { 
    setIsLoading(true); 
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      localStorage.setItem('access_token', access_token);
      
      // On lance la vérification immédiatement
      await verifyToken(access_token);
    } catch (error) {
      console.error("Erreur Login:", error);
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
