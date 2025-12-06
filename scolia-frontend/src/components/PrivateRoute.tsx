// scolia-frontend/src/components/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  // BEST PRACTICE : ReactNode couvre plus de cas (Fragments, texte, null, etc.) que ReactElement
  children: React.ReactNode; 
  roles?: string[]; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  // 1. Pendant le chargement
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: '#666' }}>
        Vérification de l'accès...
      </div>
    );
  }

  // 2. Si pas connecté -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si mauvais rôle -> Accueil (ou une page 403 Forbidden)
  if (roles && userRole && !roles.includes(userRole)) {
    // Redirection selon le rôle pour éviter de boucler sur "/"
    return <Navigate to="/" replace />;
  }

  // 4. Tout est bon
  return <>{children}</>;
};

export default PrivateRoute;
