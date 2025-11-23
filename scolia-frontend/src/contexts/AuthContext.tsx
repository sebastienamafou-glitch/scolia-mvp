// scolia-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import api from '../services/api';
import type { Role } from '../types/role';

// 1. On définit l'interface de l'Utilisateur complet
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  schoolId: number | null; // On garde ça, c'est toujours utile
}

// 2. On ajoute 'user' dans le type du Contexte
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
      // 1. On configure le token dans les headers de l'API
      api.defaults.headers.common['Authorization'] = `Bearer ${_token}`;
      
      // 2. On appelle /auth/me pour vérifier le token et récupérer les données
      const response = await api.get('/auth/me'); 
      
      // 3. On stocke TOUT l'utilisateur
      const userData: User = response.data;
      
      setUser(userData);           
      setUserRole(userData.role);  
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => { 
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;

    localStorage.setItem('access_token', access_token);
    await verifyToken(access_token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
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
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
