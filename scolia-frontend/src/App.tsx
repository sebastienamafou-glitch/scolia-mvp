// scolia-frontend/src/App.tsx

import React from 'react';
// 👇 AJOUT DE 'Link' DANS LES IMPORTS
import { Routes, Route, Navigate, Link } from 'react-router-dom'; 
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import PrivateRoute from './components/PrivateRoute'; 
import NotesPage from './pages/NotesPage';
import HelpPage from './pages/HelpPage'; 

const App: React.FC = () => {
  const { userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Chargement...</div>;
  }

  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent', 'SuperAdmin']; 
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      {/* En-tête global pour les rôles simples (ex: Élève) */}
      {showGlobalHeader && (
        <header style={{ padding: '10px 20px', backgroundColor: '#0A2240', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Scolia - {userRole}</span>
          
          {/* 👇 NOUVEAU BLOC : AIDE + DÉCONNEXION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* BOUTON AIDE */}
              <Link to="/help" style={{ textDecoration:'none', color:'white', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9rem', fontWeight: '500' }}>
                ❓ Aide
              </Link>

              <button onClick={logout} style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', cursor: 'pointer', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>
                Déconnexion
              </button>
          </div>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0' }}>
        <Routes>
          {/* Route Publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* REDIRECTION INTELLIGENTE */}
          <Route path="/" element={
            !userRole ? <Navigate to="/login" replace /> :
            userRole === 'SuperAdmin' ? <Navigate to="/platform" replace /> :
            userRole === 'Admin' ? <Navigate to="/admin-dashboard" replace /> :
            userRole === 'Enseignant' ? <Navigate to="/teacher-dashboard" replace /> :
            userRole === 'Parent' ? <Navigate to="/parent-dashboard" replace /> : 
            <Navigate to="/student-dashboard" replace />
          } />

          {/* --- ROUTES PROTÉGÉES --- */}

          <Route path="/platform" element={
            <PrivateRoute roles={['SuperAdmin']}>
              <PlatformDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <PrivateRoute roles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          <Route path="/teacher-dashboard" element={
            <PrivateRoute roles={['Enseignant']}>
              <TeacherDashboard />
            </PrivateRoute>
          } />

          <Route path="/parent-dashboard" element={
            <PrivateRoute roles={['Parent']}>
              <ParentDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/student-dashboard" element={
            <PrivateRoute roles={['Élève']}>
              <NotesPage />
            </PrivateRoute>
          } />

          {/* Route Aide (Accessible à tous les connectés) */}
          <Route path="/help" element={
            <PrivateRoute roles={['SuperAdmin', 'Admin', 'Enseignant', 'Parent', 'Élève']}>
              <HelpPage />
            </PrivateRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
