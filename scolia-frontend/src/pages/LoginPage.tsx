// scolia-frontend/src/pages/LoginPage.tsx

import React from 'react';
import LoginForm from '../components/LoginForm';
import { Logo } from '../components/Logo'; // <-- Import du logo

const LoginPage: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#F4F6F8',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      
      {/* En-tête avec le LOGO */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {/* Grand Logo pour la page de login */}
            <Logo width={80} height={80} showText={true} />
        </div>
        <p style={{ color: '#666', marginTop: '5px', fontSize: '1rem' }}>
            Le lien numérique de votre école
        </p>
      </div>

      <LoginForm />

      <div style={{ marginTop: '40px', color: '#999', fontSize: '0.8rem' }}>
        © 2025 Scolia Éducation.
      </div>
    </div>
  );
};

export default LoginPage;
