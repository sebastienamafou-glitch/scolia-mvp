// scolia-frontend/src/pages/TeacherDashboard.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NoteEntry, AttendanceEntry } from '../components/TeacherEntries';
import { Logo } from '../components/Logo'; // Import du composant Logo

const TeacherDashboard: React.FC = () => {
    const { userRole, logout } = useAuth();
    // État initialisé à 'menu' pour afficher les boutons par défaut
    const [view, setView] = useState<'menu' | 'notes' | 'attendance'>('menu'); 

    // Contenu des boutons du menu principal
    const menuContent = (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: '#0A2240', marginBottom: '40px' }}>
                Que souhaitez-vous faire aujourd'hui ?
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                {/* BOUTON SAISIR NOTES */}
                <button 
                    onClick={() => setView('notes')}
                    style={{ 
                        padding: '30px', 
                        fontSize: '1.2rem', 
                        backgroundColor: '#0A2240', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        width: '250px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s'
                    }}
                >
                    <span style={{ display: 'block', fontSize: '2rem', marginBottom: '10px' }}>📝</span>
                    Saisir Notes
                </button>

                {/* BOUTON FAIRE L'APPEL */}
                <button 
                    onClick={() => setView('attendance')}
                    style={{ 
                        padding: '30px', 
                        fontSize: '1.2rem', 
                        backgroundColor: '#F77F00', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        width: '250px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s'
                    }}
                >
                    <span style={{ display: 'block', fontSize: '2rem', marginBottom: '10px' }}>🔔</span>
                    Faire l'Appel
                </button>
            </div>
        </div>
    );

    // Fonction de sélection de la vue
    const renderView = () => {
        if (view === 'notes') {
            return <NoteEntry />;
        }
        if (view === 'attendance') {
            return <AttendanceEntry />;
        }
        return menuContent; 
    };

    return (
        // FIX : Fond blanc explicite pour garantir la lisibilité
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '20px', color: '#333' }}>
            
            {/* HEADER AVEC LOGO */}
            <header style={{ 
                padding: '10px 0', 
                borderBottom: '2px solid #F77F00', 
                marginBottom: '30px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                {/* Logo + Titre */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Le Logo graphique */}
                    <Logo width={40} height={40} showText={false} />
                    
                    <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.5rem' }}>
                        Espace {userRole}
                    </h1>
                </div>

                <button 
                    onClick={logout} 
                    style={{ 
                        backgroundColor: '#F77F00', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 15px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Déconnexion
                </button>
            </header>

            {/* BOUTON RETOUR AU MENU (Visible seulement si on n'est pas au menu) */}
            {view !== 'menu' && (
                <button 
                    onClick={() => setView('menu')} 
                    style={{ 
                        marginBottom: '20px', 
                        backgroundColor: '#E0E0E0', 
                        color: '#333',
                        border: 'none', 
                        padding: '10px 15px', 
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <span>←</span> Retour au Menu
                </button>
            )}

            {/* Rendu du contenu dynamique */}
            {renderView()}
            
        </div>
    );
};

export default TeacherDashboard;
