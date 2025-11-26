import React from 'react';
// Assurez-vous d'avoir votre image de logo ici, sinon ajustez le chemin
// Si vous n'avez pas d'image, le composant affichera une boîte colorée par défaut
import logoImg from '../assets/logo.png'; 

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  textColor?: string; // 👈 AJOUT DE LA PROPRIÉTÉ
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 50, 
  height = 50, 
  showText = true, 
  textColor = '#0A2240' // Couleur par défaut (Bleu nuit)
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Image du Logo */}
      <img 
        src={logoImg} 
        alt="Scolia" 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          objectFit: 'contain' 
        }} 
        // Fallback si l'image n'est pas trouvée (carré orange)
        onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `<div style="width:${width}px; height:${height}px; background-color:#F77F00; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">S</div>` + (showText ? `<span style="margin-left:10px; font-size:1.5rem; font-weight:bold; color:${textColor}">Scolia</span>` : '');
        }}
      />

      {/* Texte du Logo */}
      {showText && (
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: textColor, // 👈 UTILISATION DE LA COULEUR ICI
          fontFamily: '"Poppins", sans-serif'
        }}>
          Scolia
        </span>
      )}
    </div>
  );
};
