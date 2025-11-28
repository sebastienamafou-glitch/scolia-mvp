// scolia-frontend/src/pages/TeacherDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

// Imports des modules
import { NoteEntry, AttendanceEntry } from '../components/TeacherEntries';
import { BulletinEditor } from '../components/BulletinEditor';
import { SchoolNews } from '../components/SchoolNews';
import { SkillsEvaluator } from '../components/SkillsEvaluator';
// 👇 AJOUT IMPORT VIDEO
import { VideoClassroom } from '../components/VideoClassroom';

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // 👇 AJOUT 'visio' dans les types possibles
    const [activeTab, setActiveTab] = useState<'appel' | 'notes' | 'bulletins' | 'skills' | 'visio'>('appel');

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

                {/* BOUTONS (AIDE + DÉCONNEXION) */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Link 
                        to="/help" 
                        style={{ 
                            backgroundColor: '#E3F2FD', color: '#0A2240', 
                            padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', 
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem'
                        }}
                    >
                        ❓ Aide
                    </Link>

                    <button onClick={logout} style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                
                {/* MODULE ACTUALITÉS */}
                <div style={{ marginBottom: '30px' }}>
                    <SchoolNews />
                </div>
                
                {/* BARRE DE NAVIGATION (ONGLETS) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                    <button 
                        onClick={() => setActiveTab('appel')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'appel' ? '#0A2240' : 'white',
                            color: activeTab === 'appel' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
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
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
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
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🎓 Conseils de Classe
                    </button>
                    <button 
                        onClick={() => setActiveTab('skills')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'skills' ? '#0A2240' : 'white',
                            color: activeTab === 'skills' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🌟 Compétences
                    </button>
                    {/* 👇 NOUVEAU BOUTON VISIO */}
                    <button 
                        onClick={() => setActiveTab('visio')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'visio' ? '#E53935' : 'white', // Rouge Vidéo
                            color: activeTab === 'visio' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        🎥 Classe Virtuelle
                    </button>
                </div>

                {/* CONTENU DYNAMIQUE */}
                <div>
                    {activeTab === 'appel' && <AttendanceEntry />}
                    {activeTab === 'notes' && <NoteEntry />}
                    {activeTab === 'bulletins' && <BulletinEditor />}
                    {activeTab === 'skills' && <SkillsManagerWrapper />} 
                    
                    {/* 👇 CONTENU VISIO */}
                    {activeTab === 'visio' && user && (
                        <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                            <h2 style={{ color: '#0A2240', marginTop: 0, marginBottom: '10px' }}>Salle de cours en direct</h2>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                Vous allez rejoindre la salle en tant que <strong>{user.prenom} {user.nom}</strong>.
                            </p>
                            
                            {/* Nom de salle unique basé sur l'ID du prof pour l'instant */}
                            <VideoClassroom 
                                user={{ nom: user.nom, prenom: user.prenom, email: user.email }}
                                roomName={`Scolia-Live-Prof-${user.id}`} 
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// --- SOUS-COMPOSANT LOCAL POUR GÉRER LA SÉLECTION DE CLASSE ---
const SkillsManagerWrapper = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                setClasses(res.data);
            } catch (error) {
                console.error("Erreur chargement classes", error);
            }
        };
        fetchClasses();
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#0A2240', marginBottom: '15px' }}>Évaluation des Compétences</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>Choisir la classe :</label>
                    <select 
                        onChange={e => setSelectedClassId(e.target.value)} 
                        value={selectedClassId}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px' }}
                    >
                        <option value="">-- Sélectionner une classe --</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedClassId ? (
                // Correction du type (string -> number si nécessaire, ou string si SkillsEvaluator attend string)
                <SkillsEvaluator classId={selectedClassId} />
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }}>
                    Veuillez sélectionner une classe ci-dessus pour commencer l'évaluation.
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
