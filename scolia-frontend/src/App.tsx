// scolia-frontend/src/App.tsx

import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard'; 
import AdminDashboard from './pages/AdminDashboard'; // <-- Import du vrai dashboard Admin

// Composant "Placeholder" pour le rôle pas encore codé
const StudentDashboard = () => <h1>Tableau de Bord Élève 📚</h1>;

const App: React.FC = () => {
  const { isAuthenticated, userRole, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Chargement...</div>;
  }

  if (!isAuthenticated || !userRole) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'Parent':
        return <ParentDashboard />;
      case 'Enseignant':
        return <TeacherDashboard />;
      case 'Admin':
        // Utilisation du vrai composant AdminDashboard
        return <AdminDashboard />;
      case 'Élève':
        return <StudentDashboard />;
      default:
        return <div>Rôle inconnu. <button onClick={logout}>Déconnexion</button></div>;
    }
  };

  // Liste des rôles qui ont leur PROPRE header interne (donc on cache le global)
  const rolesWithCustomHeader = ['Enseignant', 'Admin']; 
  const showGlobalHeader = !rolesWithCustomHeader.includes(userRole);

  return (
    <div>
      {/* En-tête global (affiché uniquement pour Parent et Élève pour l'instant) */}
      {showGlobalHeader && (
        <header style={{ padding: '10px', backgroundColor: '#0A2240', color: 'white' }}>
            Scolia - {userRole}
            <button onClick={logout} style={{ float: 'right', backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Déconnexion</button>
        </header>
      )}

      <main style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0' 
      }}>
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;
