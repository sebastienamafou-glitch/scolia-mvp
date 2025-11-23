// scolia-frontend/src/components/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  // CORRECTION ICI : On remplace JSX.Element par React.ReactElement
  children: React.ReactElement; 
  roles?: string[]; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  // 1. Pendant le chargement
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vérification de l'accès...</div>;
  }

  // 2. Si pas connecté -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 3. Si mauvais rôle -> Accueil
  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  // 4. Tout est bon
  return children;
};

export default PrivateRoute;
