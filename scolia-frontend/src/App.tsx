// scolia-frontend/src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserRole } from './types/userRole';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; 

// Imports des pages
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import NotesPage from './pages/NotesPage'; // Dashboard Élève
import HelpPage from './pages/HelpPage';
import LandingPage from './pages/LandingPage'; 

// Composant de protection
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const { userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0A2240' }}>
        Chargement de Scolia...
      </div>
    );
  }

  // Détermine si on affiche le header global (pour les pages non-dashboard ou fallback)
  const rolesWithCustomHeader = [UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT, UserRole.SUPER_ADMIN, UserRole.STUDENT];
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '8px' },
          success: { style: { background: '#D4EDDA', color: '#155724' } },
          error: { style: { background: '#F8D7DA', color: '#721C24' } },
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
              <button onClick={logout} style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', cursor: 'pointer', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>
                Déconnexion
              </button>
          </div>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0', flexGrow: 1 }}>
        <Routes>
          
          {/* Racine : Landing Page ou Home si connecté */}
          <Route path="/" element={!userRole ? <LandingPage /> : <Navigate to="/home" replace />} /> 

          {/* Login : Formulaire ou Home si déjà connecté */}
          <Route path="/login" element={userRole ? <Navigate to="/home" replace /> : <LoginPage />} />

          {/* ROUTEUR INTELLIGENT /home */}
          <Route path="/home" element={
            !userRole ? <Navigate to="/login" replace /> : 
            userRole === UserRole.SUPER_ADMIN ? <Navigate to="/platform" replace /> :
            userRole === UserRole.ADMIN ? <Navigate to="/admin-dashboard" replace /> :
            userRole === UserRole.TEACHER ? <Navigate to="/teacher-dashboard" replace /> :
            userRole === UserRole.PARENT ? <Navigate to="/parent-dashboard" replace /> : 
            userRole === UserRole.STUDENT ? <Navigate to="/student-dashboard" replace /> :
            // Sécurité anti-boucle : Si le rôle est inconnu, on ne renvoie PAS au login, mais vers une page d'erreur ou la racine
            <div style={{padding: 50, textAlign: 'center'}}>Rôle utilisateur inconnu. Contactez le support.</div>
          } />

          {/* ROUTES PROTÉGÉES */}
          <Route path="/platform" element={<PrivateRoute roles={[UserRole.SUPER_ADMIN]}><PlatformDashboard /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute roles={[UserRole.ADMIN]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/teacher-dashboard" element={<PrivateRoute roles={[UserRole.TEACHER]}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/parent-dashboard" element={<PrivateRoute roles={[UserRole.PARENT]}><ParentDashboard /></PrivateRoute>} />
          <Route path="/student-dashboard" element={<PrivateRoute roles={[UserRole.STUDENT]}><NotesPage /></PrivateRoute>} />

          <Route path="/help" element={<PrivateRoute roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT]}><HelpPage /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
