// scolia-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react'; // Ajout de PropsWithChildren
import api from '../services/api';

// 💡 CORRECTION 1 : Ajout de 'type' pour l'importation type-only
import type { Role } from '../types/role'; 

// Définition de ce que le contexte va contenir
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 💡 CORRECTION 2 : Utilisation de PropsWithChildren pour typer 'children'
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie si un token est présent au chargement et vérifie /auth/me
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Le type 'token: string' peut générer un avertissement TS6133 car l'argument n'est pas lu directement
  // (il est géré par l'intercepteur Axios, mais TS ne le sait pas)
  const verifyToken = async (_token: string) => { 
    try {
      // Axios interceptera et utilisera ce token pour la requête /auth/me
      const response = await api.get('/auth/me'); 
      const { role } = response.data;
      
      setUserRole(role as Role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (email: string, password: string) => { 
    // Requête POST DIRECTE sans l'intercepteur (car nous n'avons pas encore le token)
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;

    localStorage.setItem('access_token', access_token);
    await verifyToken(access_token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, isLoading }}>
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
