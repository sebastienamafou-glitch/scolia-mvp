// scolia-frontend/src/pages/TeacherDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // <--- NOUVEL IMPORT DE TOAST

// Imports des modules
import { NoteEntry, AttendanceEntry } from '../components/TeacherEntries';
import { BulletinEditor } from '../components/BulletinEditor';
import { SchoolNews } from '../components/SchoolNews';
import { SkillsEvaluator } from '../components/SkillsEvaluator';
import { VideoClassroom } from '../components/VideoClassroom';
import { TeacherAlertForm } from '../components/TeacherAlertForm';

// 👇 FONCTION UTILITAIRE : Génère une clé unique basée sur la date (YYYYMMDD)
// Cela permet de changer l'URL de la salle de classe chaque jour automatiquement.
const generateDailyHash = () => {
    const date = new Date();
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
};

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // États
    const [activeTab, setActiveTab] = useState<'appel' | 'notes' | 'bulletins' | 'skills' | 'visio' | 'alert'>('appel');

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

                    <button 
                        onClick={() => { // <--- MODIFICATION ICI
                            logout();
                            toast.success("Vous avez été déconnecté avec succès !");
                        }} 
                        style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
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
                    <TabButton 
                        label="🔔 Faire l'Appel" 
                        isActive={activeTab === 'appel'} 
                        onClick={() => setActiveTab('appel')} 
                    />
                    <TabButton 
                        label="📝 Saisir des Notes" 
                        isActive={activeTab === 'notes'} 
                        onClick={() => setActiveTab('notes')} 
                    />
                    <TabButton 
                        label="🎓 Conseils de Classe" 
                        isActive={activeTab === 'bulletins'} 
                        onClick={() => setActiveTab('bulletins')} 
                    />
                    <TabButton 
                        label="🌟 Compétences" 
                        isActive={activeTab === 'skills'} 
                        onClick={() => setActiveTab('skills')} 
                    />
                    
                    {/* Onglet Visio (Rouge pour se démarquer) */}
                    <button 
                        onClick={() => setActiveTab('visio')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                            backgroundColor: activeTab === 'visio' ? '#E53935' : 'white', 
                            color: activeTab === 'visio' ? 'white' : '#666',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        🎥 Classe Virtuelle
                    </button>

                    <TabButton 
                        label="⚠️ Déclarer Absence" 
                        isActive={activeTab === 'alert'} 
                        onClick={() => setActiveTab('alert')} 
                        colorOverride="#dc3545" // Rouge
                    />
                </div>

                {/* CONTENU DYNAMIQUE */}
                <div style={{ paddingBottom: '50px' }}>
                    
                    {/* CONTENU VISIO (Toujours monté pour garder la connexion, caché via CSS si inactif) */}
                    <div style={{ display: activeTab === 'visio' ? 'block' : 'none' }}>
                        {user ? (
                            <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h2 style={{ color: '#0A2240', marginTop: 0, marginBottom: '10px' }}>Salle de cours en direct</h2>
                                <p style={{ color: '#666', marginBottom: '20px' }}>
                                    Cette salle est sécurisée et le lien change automatiquement chaque jour.
                                </p>
                                <VideoClassroom 
                                    user={{ nom: user.nom, prenom: user.prenom, email: user.email }}
                                    // Room unique : Scolia + ID Ecole + ID Prof + Date
                                    roomName={`Scolia-Secure-${user.schoolId || '0'}-${user.id}-${generateDailyHash()}`}
                                />
                            </div>
                        ) : <p>Chargement du profil...</p>}
                    </div>

                    {/* LES AUTRES ONGLETS (Ceux-ci peuvent être démontés sans risque) */}
                    {activeTab === 'appel' && <AttendanceEntry />}
                    {activeTab === 'notes' && <NoteEntry />}
                    {activeTab === 'bulletins' && <BulletinEditor />}
                    {activeTab === 'skills' && <SkillsManagerWrapper />} 
                    {activeTab === 'alert' && <TeacherAlertForm />}
                </div>

            </div>
        </div>
    );
};

// --- Petits composants Helper pour alléger le code ---

const TabButton = ({ label, isActive, onClick, colorOverride }: any) => {
    // Si une couleur override est fournie et que l'onglet est actif, on l'utilise
    const bgColor = isActive ? (colorOverride || '#0A2240') : 'white';
    
    return (
        <button 
            onClick={onClick}
            style={{
                padding: '12px 25px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                backgroundColor: bgColor,
                color: isActive ? 'white' : '#666',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap'
            }}
        >
            {label}
        </button>
    );
};

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
                toast.error("Impossible de charger la liste des classes."); // <--- MODIFICATION ICI
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
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic', backgroundColor: 'white', borderRadius: '8px' }}>
                    👆 Veuillez sélectionner une classe ci-dessus pour commencer l'évaluation.
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
