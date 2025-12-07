import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ CORRECTION : Link retiré
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Imports des pages
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import NotesPage from './pages/NotesPage';
import HelpPage from './pages/HelpPage';
import { LandingPage } from './pages/LandingPage'; 

import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const { userRole, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0A2240', flexDirection: 'column' }}>
        <div className="spinner" style={{width: '40px', height: '40px', border: '4px solid #eee', borderTop: '4px solid #F77F00', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        <p style={{marginTop: '20px', fontWeight: 'bold'}}>Chargement de Scolia...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Header Global : Affiché uniquement si connecté ET pas sur une page qui a déjà son header
  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent', 'SuperAdmin', 'Élève'];
  const showGlobalHeader = isAuthenticated && userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      <Toaster position="top-right" />

      {showGlobalHeader && (
        <header style={{ padding: '10px 20px', backgroundColor: '#0A2240', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Scolia</span>
          <button onClick={logout} style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', color: 'white', borderRadius: '4px' }}>
            Déconnexion
          </button>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0' }}>
        <Routes>
          
          {/* ROUTE RACINE (/) */}
          <Route path="/" element={
            !isAuthenticated ? (
                <LandingPage />
            ) : (
                userRole === 'SuperAdmin' ? <Navigate to="/platform" replace /> :
                userRole === 'Admin' ? <Navigate to="/admin-dashboard" replace /> :
                userRole === 'Enseignant' ? <Navigate to="/teacher-dashboard" replace /> :
                userRole === 'Parent' ? <Navigate to="/parent-dashboard" replace /> : 
                userRole === 'Student' ? <Navigate to="/student-dashboard" replace /> :  
                <Navigate to="/login" replace />
            )
          } />

          {/* Route Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* --- ROUTES PROTÉGÉES --- */}
          <Route path="/platform" element={<PrivateRoute roles={['SuperAdmin']}><PlatformDashboard /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/teacher-dashboard" element={<PrivateRoute roles={['Enseignant']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/parent-dashboard" element={<PrivateRoute roles={['Parent']}><ParentDashboard /></PrivateRoute>} />
          <Route path="/student-dashboard" element={<PrivateRoute roles={['Élève']}><NotesPage /></PrivateRoute>} />
          
          <Route path="/help" element={
            <PrivateRoute roles={['SuperAdmin', 'Admin', 'Enseignant', 'Parent', 'Élève']}>
              <HelpPage />
            </PrivateRoute>
          } />

          {/* 404 -> Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
