import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserRole } from './types/userRole';
import { useAuth } from './contexts/AuthContext'; // Assurez-vous que ce hook existe
import { Toaster } from 'react-hot-toast'; 

// Imports des pages
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import NotesPage from './pages/NotesPage'; // Dashboard Élève
import HelpPage from './pages/HelpPage';
// ✅ CORRECTION : Import de la LandingPage
import LandingPage from './pages/LandingPage'; 

import PrivateRoute from './components/PrivateRoute'; // Assurez-vous que ce composant existe

const App: React.FC = () => {
  const { userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0A2240' }}>
        Chargement de Scolia...
      </div>
    );
  }

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
              <button 
                onClick={logout} 
                style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', cursor: 'pointer', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}
              >
                Déconnexion
              </button>
          </div>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0', flexGrow: 1 }}>
        <Routes>
          
          {/* ✅ CORRECTION : Si l'utilisateur est connecté, redirige vers /home, sinon affiche la Landing Page */}
          <Route path="/" element={!userRole ? <LandingPage /> : <Navigate to="/home" replace />} /> 

          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/login" element={userRole ? <Navigate to="/home" replace /> : <LoginPage />} />

          {/* REDIRECTION VERS LE DASHBOARD BASÉ SUR LE RÔLE */}
          <Route path="/home" element={
            !userRole ? <Navigate to="/login" replace /> : // Doit être connecté pour accéder à /home
            userRole === UserRole.SUPER_ADMIN ? <Navigate to="/platform" replace /> :
            userRole === UserRole.ADMIN ? <Navigate to="/admin-dashboard" replace /> :
            userRole === UserRole.TEACHER ? <Navigate to="/teacher-dashboard" replace /> :
            userRole === UserRole.PARENT ? <Navigate to="/parent-dashboard" replace /> : 
            userRole === UserRole.STUDENT ? <Navigate to="/student-dashboard" replace /> :
            <Navigate to="/login" replace />
          } />

          {/* --- ROUTES PROTÉGÉES --- */}
          <Route path="/platform" element={<PrivateRoute roles={[UserRole.SUPER_ADMIN]}><PlatformDashboard /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute roles={[UserRole.ADMIN]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/teacher-dashboard" element={<PrivateRoute roles={[UserRole.TEACHER]}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/parent-dashboard" element={<PrivateRoute roles={[UserRole.PARENT]}><ParentDashboard /></PrivateRoute>} />
          <Route path="/student-dashboard" element={<PrivateRoute roles={[UserRole.STUDENT]}><NotesPage /></PrivateRoute>} />

          {/* Route Aide */}
          <Route path="/help" element={<PrivateRoute roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT]}><HelpPage /></PrivateRoute>} />

          {/* Catch-all (404) -> Renvoie à la racine */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
