import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; // 👈 IMPORT UX : Gestionnaire de notifications

// Imports des pages
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import NotesPage from './pages/NotesPage'; // Dashboard Élève
import HelpPage from './pages/HelpPage';

import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const { userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    // Petit loader centré pour l'attente initiale
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0A2240' }}>
        Chargement de Scolia...
      </div>
    );
  }

  // 🛠 CORRECTION BUG HEADER :
  // On liste ici les rôles qui ont DÉJÀ leur propre Header dans leur page respective.
  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent', 'SuperAdmin', 'Élève'];
  
  // On affiche le Header global seulement si l'utilisateur est connecté ET qu'il n'a pas un rôle listé au-dessus.
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      {/* 🔔 UX : Ce composant va afficher les popups de succès/erreur par dessus tout le reste */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: { background: '#D4EDDA', color: '#155724' },
          },
          error: {
            style: { background: '#F8D7DA', color: '#721C24' },
          },
        }}
      />

      {/* En-tête global (Fallback) */}
      {showGlobalHeader && (
        <header style={{ padding: '10px 20px', backgroundColor: '#0A2240', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif' }}>Scolia</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link to="/help" style={{ textDecoration:'none', color:'white', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9rem', fontWeight: '500' }}>
                ❓ Aide
              </Link>

              <button 
                onClick={logout} 
                style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', cursor: 'pointer', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}
              >
                Déconnexion
              </button>
          </div>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0' }}>
        <Routes>
          {/* Route Publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* REDIRECTION INTELLIGENTE (Homepage) */}
          <Route path="/" element={
            !userRole ? <Navigate to="/login" replace /> :
            userRole === 'SuperAdmin' ? <Navigate to="/platform" replace /> :
            userRole === 'Admin' ? <Navigate to="/admin-dashboard" replace /> :
            userRole === 'Enseignant' ? <Navigate to="/teacher-dashboard" replace /> :
            userRole === 'Parent' ? <Navigate to="/parent-dashboard" replace /> : 
            userRole === 'Élève' ? <Navigate to="/student-dashboard" replace /> :
            <Navigate to="/login" replace />
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

          {/* Catch-all (404) -> Renvoie au login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
