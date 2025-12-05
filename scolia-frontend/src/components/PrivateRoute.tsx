import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement; 
  roles?: string[]; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display:'flex', justifyContent:'center', marginTop:'50px', color: '#0A2240' }}>Chargement en cours...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
