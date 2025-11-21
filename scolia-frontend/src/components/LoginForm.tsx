// scolia-frontend/src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; 

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
        <div style={{ textAlign: 'center', color: '#0A2240' }}>
            <p>Redirection vers l'espace {userRole}...</p>
        </div>
    );
  }

  return (
    <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '16px', // Bords bien arrondis (style iOS/Android moderne)
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', // Ombre douce et moderne
        width: '100%', 
        maxWidth: '400px' 
    }}>
      
      <h2 style={{ 
          color: '#0A2240', 
          marginTop: 0, 
          marginBottom: '20px', 
          fontSize: '1.5rem',
          textAlign: 'center'
      }}>
          Connexion
      </h2>
      
      {error && (
        <div style={{ 
            backgroundColor: '#FFEBEE', 
            color: '#D32F2F', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
        }}>
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', color: '#555', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="ex: parent@scolia.ci"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
                width: '100%', 
                padding: '12px 15px', 
                border: '1px solid #E0E0E0', 
                borderRadius: '8px', 
                fontSize: '1rem',
                backgroundColor: '#FAFAFA',
                outline: 'none',
                boxSizing: 'border-box' // Important pour que le padding ne casse pas la largeur
            }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="password" style={{ display: 'block', color: '#555', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
                width: '100%', 
                padding: '12px 15px', 
                border: '1px solid #E0E0E0', 
                borderRadius: '8px', 
                fontSize: '1rem',
                backgroundColor: '#FAFAFA',
                outline: 'none',
                boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: '#F77F00', // Orange Vif Scolia
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 6px rgba(247, 127, 0, 0.2)', // Légère ombre orangée
            transition: 'transform 0.1s'
          }}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="#" style={{ color: '#0A2240', fontSize: '0.9rem', textDecoration: 'none' }}>
              Mot de passe oublié ?
          </a>
      </div>
    </div>
  );
};

export default LoginForm;
