// scolia-frontend/src/pages/TeacherDashboard.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

// Imports des modules
import { NoteEntry, AttendanceEntry } from '../components/TeacherEntries';
import { BulletinEditor } from '../components/BulletinEditor';
import { SchoolNews } from '../components/SchoolNews'; // <--- 1. IMPORT AJOUTÉ

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // On remplace 'view' par 'activeTab' pour la logique d'onglets
    const [activeTab, setActiveTab] = useState<'appel' | 'notes' | 'bulletins'>('appel');

    return (
        <div style={{ backgroundColor: '#F4F6F8', minHeight: '100vh' }}>
            
            {/* HEADER */}
            <header style={{ backgroundColor: 'white', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Logo width={40} height={40} showText={false} />
                    <div>
                        <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.2rem' }}>Espace Enseignant</h1>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Bonjour, {user?.prenom} {user?.nom}</span>
                    </div>
                </div>
                <button onClick={logout} style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Déconnexion
                </button>
            </header>

            <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                
                {/* 2. MODULE ACTUALITÉS */}
                <div style={{ marginBottom: '30px' }}>
                    <SchoolNews />
                </div>
                
                {/* BARRE DE NAVIGATION (ONGLETS) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        onClick={() => setActiveTab('appel')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'appel' ? '#0A2240' : 'white',
                            color: activeTab === 'appel' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        🔔 Faire l'Appel
                    </button>
                    <button 
                        onClick={() => setActiveTab('notes')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'notes' ? '#0A2240' : 'white',
                            color: activeTab === 'notes' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        📝 Saisir des Notes
                    </button>
                    <button 
                        onClick={() => setActiveTab('bulletins')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'bulletins' ? '#0A2240' : 'white',
                            color: activeTab === 'bulletins' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        🎓 Conseils de Classe
                    </button>
                </div>

                {/* CONTENU DYNAMIQUE */}
                <div>
                    {activeTab === 'appel' && <AttendanceEntry />}
                    {activeTab === 'notes' && <NoteEntry />}
                    {activeTab === 'bulletins' && <BulletinEditor />}
                </div>

            </div>
        </div>
    );
};

export default TeacherDashboard;
