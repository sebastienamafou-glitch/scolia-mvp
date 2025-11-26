import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
        textAlign: 'center',
        padding: '15px 20px', // Un peu moins de padding vertical
        marginTop: 'auto',
        color: '#666',
        fontSize: '0.9rem',
        borderTop: '1px solid #eee', // Ajout d'une petite bordure discrète
        backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>Scolia © {new Date().getFullYear()} — Propulsé par</span>
          
          {/* LE VRAI LOGO ICI */}
          <img 
              src="/assets/webappci-logo.png" 
              alt="webappci Logo" 
              style={{ 
                  height: '24px', // Hauteur ajustée pour s'aligner avec le texte
                  width: 'auto',
                  verticalAlign: 'middle',
                  // Petit effet au survol (optionnel, pour le style)
                  transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
      </div>
    </footer>
  );
};
