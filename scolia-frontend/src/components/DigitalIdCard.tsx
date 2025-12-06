import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';

interface Student {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
  classe?: string;
  dateNaissance?: string;
  schoolName: string;
}

export const DigitalIdCard: React.FC<{ student: Student }> = ({ student }) => {
  
  // ✅ CORRECTION MAJEURE : Si l'objet student n'est pas encore chargé, on ne rend rien.
  // Cela empêche l'erreur "cannot access property of undefined"
  if (!student) {
      return <div style={{ color: '#ccc', padding: '20px', border: '1px dashed #ccc', borderRadius: '10px' }}>Chargement de la carte...</div>;
  }

  // Données contenues dans le QR Code
  const qrData = JSON.stringify({ 
      id: student.id, 
      type: 'student_access', 
      valid: '2024-2025' 
  });

  // Helper pour sécuriser l'affichage de la date
  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString();
      } catch (e) {
          return 'N/A';
      }
  };

  return (
    <div style={{
        width: '350px',
        height: '220px',
        borderRadius: '15px',
        background: 'linear-gradient(135deg, #0A2240 0%, #005f99 100%)', 
        color: 'white',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }}>
        
        {/* Filigrane décoratif */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
            <Logo width={150} height={150} showText={false} textColor="white" />
        </div>

        {/* EN-TÊTE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background:'white', padding:'4px', borderRadius:'50%' }}>
                    <Logo width={20} height={20} showText={false} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {student.schoolName || 'Scolia Academy'}
                </span>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, border: '1px solid rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                2024-2025
            </span>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', zIndex: 2, marginTop: '10px' }}>
            
            {/* Photo Élève */}
            <div style={{ 
                width: '90px', height: '90px', 
                borderRadius: '10px', 
                border: '3px solid rgba(255,255,255,0.5)', 
                overflow: 'hidden',
                backgroundColor: '#ddd' 
            }}>
                {student.photo ? (
                    <img src={student.photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center', color:'#555', fontSize:'2rem', fontWeight:'bold' }}>
                        {(student.nom && student.nom[0]) || '?'}
                    </div>
                )}
            </div>

            {/* Infos Texte */}
            <div>
                <h3 style={{ margin: '0', fontSize: '1.2rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    {student.nom}
                </h3>
                <p style={{ margin: '0', fontSize: '1rem', fontWeight: 300 }}>{student.prenom}</p>
                <div style={{ marginTop: '10px', display: 'inline-block', backgroundColor: '#F77F00', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Classe : {student.classe || 'Non assigné'}
                </div>
            </div>
        </div>

        {/* PIED DE CARTE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', zIndex: 2 }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                ID: {String(student.id || '000').padStart(6, '0')} <br/>
                {/* ✅ Utilisation du helper sécurisé */}
                Né(e) le : {formatDate(student.dateNaissance)}
            </div>
            
            <div style={{ background: 'white', padding: '5px', borderRadius: '5px' }}>
                <QRCodeSVG value={qrData} size={50} />
            </div>
        </div>

    </div>
  );
};
