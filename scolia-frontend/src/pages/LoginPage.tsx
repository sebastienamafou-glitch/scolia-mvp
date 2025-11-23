import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo'; // Assurez-vous que ce composant existe

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- REDIRECTION AUTOMATIQUE ---
  useEffect(() => {
    if (isAuthenticated && userRole) {
        navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  // Loader pendant la redirection
  if (isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8' }}>
             <div style={{ marginBottom: '20px' }}><Logo width={60} height={60} /></div>
             <h2 style={{ color: '#0A2240' }}>🔄 Redirection vers l'espace {userRole}...</h2>
        </div>
      );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8', padding: '20px' }}>
      
      {/* --- 1. BLOC LOGO & IDENTITÉ (C'est ce qui manquait) --- */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <Logo width={80} height={80} showText={false} />
        </div>
        <h1 style={{ margin: '0 0 10px 0', color: '#0A2240', fontSize: '2.5rem', fontWeight: 'bold' }}>Scolia</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>Le lien numérique de votre école</p>
      </div>

      {/* --- 2. FORMULAIRE --- */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
         <h2 style={{ textAlign: 'center', color: '#0A2240', marginBottom: '30px', marginTop: 0 }}>Connexion</h2>
         
         {error && <div style={{ backgroundColor: '#FFEBEE', color: '#D32F2F', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

         <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Email</label>
            <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="ex: parent@scolia.ci"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} 
            />
         </div>

         <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Mot de passe</label>
            <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} 
            />
         </div>

         <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'background 0.2s' }}>
            {isLoading ? 'Chargement...' : 'Se connecter'}
         </button>

         {/* Lien mot de passe oublié */}
         <div style={{ textAlign: 'center', marginTop: '20px' }}>
             <a href="#" style={{ color: '#0A2240', fontSize: '0.9rem', textDecoration: 'none' }}>Mot de passe oublié ?</a>
         </div>
      </form>

      <div style={{ marginTop: '40px', color: '#999', fontSize: '0.8rem' }}>
          © 2025 Scolia Éducation.
      </div>
    </div>
  );
};

export default LoginPage;
