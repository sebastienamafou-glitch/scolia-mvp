import React from 'react';
// Assurez-vous que l'image est bien dans src/assets/ et qu'elle s'appelle webappci-logo.png
import webappciLogo from '../assets/webappci-logo.png';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            padding: '20px 30px',
            marginTop: 'auto', // Pousse le footer vers le bas
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: '0.85rem',
            color: '#666',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
        }}>
            
            {/* GAUCHE : Logo & Crédit Développeur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Développé par</span>
                <a href="https://webappci.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <img 
                        src={webappciLogo} 
                        alt="Logo WebappCI" 
                        style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <span style={{ fontWeight: 'bold', color: '#0A2240', marginLeft: '10px', fontSize: '1rem' }}>WebappCI</span>
                </a>
            </div>

            {/* CENTRE : Copyright */}
            <div style={{ textAlign: 'center' }}>
                &copy; {currentYear} Scolia. Une solution <strong>WebappCI</strong>.
                <br />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Tous droits réservés.</span>
            </div>

            {/* DROITE : Liens Légaux */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <a 
                    href="/privacy" 
                    style={linkStyle}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0A2240'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                    Politique de Confidentialité
                </a>
                <span style={{ opacity: 0.3 }}>|</span>
                <a 
                    href="/terms" 
                    style={linkStyle}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0A2240'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                    Mentions Légales
                </a>
            </div>
        </footer>
    );
};

// Style des liens
const linkStyle = {
    color: '#666',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
    fontSize: '0.85rem'
};
