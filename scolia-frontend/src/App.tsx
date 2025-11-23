// scolia-frontend/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
// Assurez-vous que ce composant existe (sinon je peux vous donner le code)
import PrivateRoute from './components/PrivateRoute'; 

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
          <span>Scolia</span>
          <button onClick={logout} style={{ background: '#F77F00', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
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
            userRole === 'Parent' ? <Navigate to="/parent-dashboard" /> : // <--- 2. REDIRECTION PARENT
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

          {/* 3. NOUVELLE ROUTE PARENT */}
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

        </Routes>
      </main>
    </div>
  );
};

export default App;
