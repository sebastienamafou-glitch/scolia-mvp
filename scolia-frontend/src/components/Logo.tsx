// scolia-frontend/src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'light' | 'dark'; // Pour s'adapter aux fonds blancs ou bleus
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40, 
  showText = true,
  variant = 'dark' // 'dark' = texte bleu (pour fond blanc), 'light' = texte blanc (pour fond sombre)
}) => {
  
  const primaryColor = '#F77F00'; // Orange Scolia (Le lien)
  const secondaryColor = variant === 'dark' ? '#0A2240' : '#FFFFFF'; // Bleu Nuit ou Blanc

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* L'ICÔNE (Le S Stylisé en maillons) */}
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fond optionnel pour l'icône (cercle doux) */}
        <rect width="100" height="100" rx="25" fill={secondaryColor} fillOpacity="0.1"/>
        
        {/* Partie supérieure du S (Bleu ou Blanc) */}
        <path 
          d="M70 35C70 26.7157 63.2843 20 55 20H45C36.7157 20 30 26.7157 30 35V45" 
          stroke={variant === 'dark' ? '#0A2240' : '#FFFFFF'} 
          strokeWidth="12" 
          strokeLinecap="round"
        />
        
        {/* Partie inférieure du S (Orange - Le lien actif) */}
        <path 
          d="M30 65C30 73.2843 36.7157 80 45 80H55C63.2843 80 70 73.2843 70 65V55" 
          stroke={primaryColor} 
          strokeWidth="12" 
          strokeLinecap="round"
        />
        
        {/* Le point de connexion central */}
        <circle cx="50" cy="50" r="8" fill={primaryColor} />
      </svg>

      {/* LE TEXTE (Optionnel) */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ 
            fontFamily: 'sans-serif', 
            fontWeight: '800', 
            fontSize: `${width * 0.6}px`, 
            lineHeight: 1,
            color: secondaryColor,
            letterSpacing: '-1px'
          }}>
            Scolia
          </span>
        </div>
      )}
    </div>
  );
};
