import React, { useState } from 'react';
import logoImg from '../assets/logo.png'; 

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  textColor?: string; 
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 50, 
  height = 50, 
  showText = true, 
  textColor = '#0A2240' 
}) => {
  // Gestion propre de l'erreur d'image sans innerHTML
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      
      {/* Rendu Conditionnel : Soit l'image, soit le fallback */}
      {!imgError ? (
          <img 
            src={logoImg} 
            alt="Scolia" 
            style={{ 
              width: `${width}px`, 
              height: `${height}px`, 
              objectFit: 'contain' 
            }} 
            onError={() => setImgError(true)}
          />
      ) : (
          // Fallback natif React
          <div style={{
              width: `${width}px`, 
              height: `${height}px`, 
              backgroundColor: '#F77F00', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: `${height * 0.5}px` // Taille police proportionnelle
          }}>
              S
          </div>
      )}

      {/* Texte du Logo */}
      {showText && (
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: textColor, 
          fontFamily: '"Poppins", sans-serif'
        }}>
          Scolia
        </span>
      )}
    </div>
  );
};
