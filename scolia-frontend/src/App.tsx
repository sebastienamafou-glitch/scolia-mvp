import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // 👈 Assurez-vous que ce hook existe
import { Toaster } from 'react-hot-toast'; 

// Imports des pages (Assurez-vous que les chemins d'accès sont corrects)
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import NotesPage from './pages/NotesPage'; // Dashboard Élève
import HelpPage from './pages/HelpPage';
// ✅ Import de la Landing Page
import LandingPage from './pages/LandingPage'; 

// 👈 Assurez-vous que ce composant existe (c'est lui qui gère la logique de rôle)
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

  // Liste des rôles qui gèrent leur propre header pour éviter la duplication
  const rolesWithCustomHeader = ['Enseignant', 'Admin', 'Parent', 'SuperAdmin', 'Élève'];
  
  // Le header global est affiché uniquement si l'utilisateur est connecté et n'a pas de header custom
  const showGlobalHeader = userRole && !rolesWithCustomHeader.includes(userRole);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showGlobalHeader && (
        <header style={{ padding: '15px 30px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0A2240', fontWeight: 'bold' }}>Accueil Scolia</Link>
          <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Déconnexion</button>
        </header>
      )}
      
      <main style={{ flexGrow: 1 }}>
        <Toaster />
        <Routes>
          
          {/* ✅ CORRECTION : Route de la Landing Page au démarrage */}
          <Route path="/" element={<LandingPage />} /> 

          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/login" element={<LoginPage />} />

          {/* Route par défaut après connexion (Redirection vers le dashboard basé sur le rôle) */}
          <Route path="/home" element={
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

          {/* Catch-all (404) -> Si l'utilisateur est connecté, le renvoie à son home, sinon à la Landing Page */}
          <Route path="*" element={
            userRole ? <Navigate to="/home" replace /> : <Navigate to="/" replace />
          } />

        </Routes>
      </main>
    </div>
  );
};

export default App;
