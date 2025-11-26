// scolia-frontend/src/pages/TeacherDashboard.tsx

import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Ajout de api
import { Logo } from '../components/Logo';

// Imports des modules
import { NoteEntry, AttendanceEntry } from '../components/TeacherEntries';
import { BulletinEditor } from '../components/BulletinEditor';
import { SchoolNews } from '../components/SchoolNews';
import { SkillsEvaluator } from '../components/SkillsEvaluator'; // 👈 IMPORT AJOUTÉ

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // Mise à jour des onglets possibles avec 'skills'
    const [activeTab, setActiveTab] = useState<'appel' | 'notes' | 'bulletins' | 'skills'>('appel');

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
                    {/* 👈 NOUVEAU BOUTON AJOUTÉ */}
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
                </div>

                {/* CONTENU DYNAMIQUE */}
                <div>
                    {activeTab === 'appel' && <AttendanceEntry />}
                    {activeTab === 'notes' && <NoteEntry />}
                    {activeTab === 'bulletins' && <BulletinEditor />}
                    {/* 👈 NOUVEAU CONTENU AJOUTÉ */}
                    {activeTab === 'skills' && <SkillsManagerWrapper />} 
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
        // Charger la liste des classes disponibles pour cet enseignant
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
