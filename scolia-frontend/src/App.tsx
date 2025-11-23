// scolia-frontend/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute'; 
import PlatformDashboard from './pages/PlatformDashboard'; // Dashboard Super Admin

// Placeholder pour les élève
const StudentDashboard = () => <h1 style={{textAlign:'center', marginTop:'50px'}}>🎒 Espace Élève (Bientôt disponible)</h1>;

const App: React.FC = () => {
  // AJOUT DE 'user' pour la logique Multi-Tenant/Super Admin
  const { user, userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Chargement...</div>;
  }

  // Les rôles Admin, Enseignant, et Parent ont leur propre header intégré au dashboard.
  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent']; 
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      {/* En-tête global (affiché pour les rôles sans header intégré, comme Élève) */}
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

          {/* REDIRECTION INTELLIGENTE À LA RACINE (LOGIQUE MULTI-TENANT) */}
          <Route path="/" element={
            !userRole ? <Navigate to="/login" /> :
            
            // 1. LOGIQUE ADMIN : Différenciation Super Admin vs Admin Client
            userRole === 'Admin' ? (
                user?.schoolId === null 
                    ? <Navigate to="/platform" /> // -> Super Admin (Gestion de toutes les écoles)
                    : <Navigate to="/admin-dashboard" /> // -> Admin Client (Directeur d'une seule école)
            ) :
            
            // 2. AUTRES RÔLES
            userRole === 'Enseignant' ? <Navigate to="/teacher-dashboard" /> :
            userRole === 'Parent' ? <Navigate to="/parent-dashboard" /> : 
            <Navigate to="/student-dashboard" />
          } />

          {/* --- ROUTES PROTÉGÉES --- */}

          {/* Route Plateforme Super Admin (schoolId === null) */}
          <Route path="/platform" element={
            <PrivateRoute roles={['Admin']}>
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
              <StudentDashboard />
            </PrivateRoute>
          } />

          {/* Redirection par défaut (catch-all) */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
