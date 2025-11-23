// scolia-frontend/src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 👈 Import important

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, userRole, isLoading } = useAuth(); // On récupère isLoading
  const navigate = useNavigate(); // 👈 Hook de navigation
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- EFFET DE REDIRECTION AUTOMATIQUE ---
  useEffect(() => {
    // Si l'utilisateur est connecté et que le rôle est chargé...
    if (isAuthenticated && userRole) {
        // ...on le redirige vers la racine '/'
        // C'est App.tsx qui se chargera de l'envoyer au bon endroit (Platform ou Admin)
        navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);
  // ----------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // La redirection se fera grâce au useEffect ci-dessus
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  // Si déjà connecté, on affiche un loader temporaire le temps que le useEffect redirige
  if (isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8' }}>
             <h2>🔄 Redirection vers l'espace {userRole}...</h2>
        </div>
      );
  }

  return (
    <div style={{ /* ... vos styles existants ... */ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8' }}>
      {/* ... Votre formulaire de login existant ... */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
         <h2 style={{ textAlign: 'center', color: '#0A2240', marginBottom: '30px' }}>Connexion</h2>
         
         {error && <div style={{ backgroundColor: '#FFEBEE', color: '#D32F2F', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

         <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
         </div>

         <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
         </div>

         <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Chargement...' : 'Se connecter'}
         </button>
      </form>
    </div>
  );
};

export default LoginPage;
