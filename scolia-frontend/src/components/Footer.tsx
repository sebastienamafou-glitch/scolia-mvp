import React from 'react';
// Importez votre logo ici
import webappciLogo from '../assets/webappci-logo.png'; // Ajustez le chemin et le nom

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        marginTop: 'auto', // Pousse le footer vers le bas si la page est courte
        borderTop: '1px solid #eee',
        color: '#888',
        fontSize: '0.85rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px'
    }}>
      <span>© {currentYear} Scolia. Tous droits réservés.</span>
      <span style={{ margin: '0 5px' }}>|</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Créé par 
          <a href="https://webapp.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#555', fontWeight: 'bold' }}>
            {/* Si vous avez l'image : */}
            <img src={webappciLogo} alt="webappci" style={{ height: '20px', marginRight: '4px' }} />
            {/* Ou juste du texte stylisé si pas d'image : */}
            {/* <span style={{ color: '#F77F00' }}>web</span>appci */}
             webappci
          </a>
      </span>
    </footer>
  );
};
