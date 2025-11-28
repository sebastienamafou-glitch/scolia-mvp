// scolia-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import api from '../services/api';

// On définit le type Role localement pour être sûr qu'il inclut SuperAdmin
export type Role = 'Admin' | 'Enseignant' | 'Parent' | 'Élève' | 'SuperAdmin';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  schoolId: number | null; // Champ essentiel pour le Multi-Tenant
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
      const response = await api.get('/auth/me'); 
      const userData = response.data;
      
      setUser(userData);           
      setUserRole(userData.role as Role); // Force le typage
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

  // 👇 FONCTION LOGIN MISE À JOUR
  const login = async (email: string, password: string) => { 
    setIsLoading(true); // 1. ON ACTIVE LE CHARGEMENT DÈS LE CLIC
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      localStorage.setItem('access_token', access_token);
      await verifyToken(access_token);
    } catch (error) {
      console.error("Erreur Login:", error);
      throw error; 
    } finally {
      setIsLoading(false); // 2. ON DÉSACTIVE À LA FIN (Réussite ou Échec)
    }
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
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
