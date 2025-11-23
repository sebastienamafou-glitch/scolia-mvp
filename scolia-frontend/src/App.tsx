// scolia-frontend/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute'; 
import PlatformDashboard from './pages/PlatformDashboard'; // 👈 NOUVEL IMPORT

// Placeholder pour les élèves (à faire plus tard)
const StudentDashboard = () => <h1 style={{textAlign:'center', marginTop:'50px'}}>🎒 Espace Élève (Bientôt disponible)</h1>;

const App: React.FC = () => {
  const { userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Chargement...</div>;
  }

  // 1. MODIF : On ajoute 'Parent' ici car il a son propre Header intégré
  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent']; 
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      {/* En-tête global (affiché seulement pour les rôles simples comme Élève pour l'instant) */}
      {showGlobalHeader && (
        <header style={{ padding: '10px 20px', backgroundColor: '#0A2240', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Scolia - {userRole}</span>
          <button onClick={logout} style={{ backgroundColor: '#F77F00', border: 'none', padding: '8px 15px', cursor: 'pointer', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>
            Déconnexion
          </button>
        </header>
      )}

      <main style={{ maxWidth: '100vw', margin: '0 auto', padding: '0' }}>
        <Routes>
          {/* Route Publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirection intelligente à la racine */}
          <Route path="/" element={
            !userRole ? <Navigate to="/login" /> :
            userRole === 'Admin' ? <Navigate to="/admin-dashboard" /> :
            userRole === 'Enseignant' ? <Navigate to="/teacher-dashboard" /> :
            userRole === 'Parent' ? <Navigate to="/parent-dashboard" /> : 
            <Navigate to="/student-dashboard" />
          } />

          {/* --- ROUTES PROTÉGÉES --- */}

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
          
          {/* 4. NOUVELLE ROUTE PLATEFORM SUPER ADMIN */}
          <Route path="/platform" element={
            <PrivateRoute roles={['Admin']}>
              <PlatformDashboard />
            </PrivateRoute>
          } />

          <Route path="/student-dashboard" element={
            <PrivateRoute roles={['Élève']}>
              <StudentDashboard />
            </PrivateRoute>
          } />

        </Routes>
      </main>
    </div>
  );
};

export default App;
