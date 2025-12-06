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

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vérification de l'accès...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si mauvais rôle -> Accueil
  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  // 4. Tout est bon
  return children;
};

export default PrivateRoute;
