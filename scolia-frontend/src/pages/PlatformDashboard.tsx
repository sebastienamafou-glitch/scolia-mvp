// scolia-frontend/src/pages/PlatformDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';
import { FaSchool, FaCheckCircle, FaPowerOff, FaPlus } from 'react-icons/fa';

interface School {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

const PlatformDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    schoolName: '', schoolAddress: '',
    adminNom: '', adminPrenom: '', adminEmail: '', adminPassword: ''
  });

  // Charger la liste des écoles au démarrage
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch (error) {
      console.error("Erreur chargement écoles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/schools/onboard', formData);
      alert('✅ École et Administrateur créés avec succès !');
      setFormData({
        schoolName: '', schoolAddress: '',
        adminNom: '', adminPrenom: '', adminEmail: '', adminPassword: ''
      });
      setShowForm(false); // Fermer le formulaire
      fetchSchools(); // Rafraîchir la liste
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création de l'école.");
    }
  };

  const toggleSchoolStatus = async (school: School) => {
    if (!window.confirm(`Voulez-vous vraiment ${school.isActive ? 'DÉSACTIVER' : 'ACTIVER'} l'école ${school.name} ?`)) return;

    try {
      await api.patch(`/schools/${school.id}/status`, { isActive: !school.isActive });
      // Mise à jour optimiste de l'interface
      setSchools(prev => prev.map(s => s.id === school.id ? { ...s, isActive: !s.isActive } : s));
    } catch (error) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  const activeCount = schools.filter(s => s.isActive).length;

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ padding: '15px 20px', borderBottom: '1px solid #333', backgroundColor: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo width={32} height={32} showText={false} />
            <h1 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Super Admin</h1>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* STATS & ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaSchool size={30} color="#3182ce" />
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{schools.length}</div>
                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Écoles</div>
                </div>
            </div>
            <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaCheckCircle size={30} color="#38a169" />
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activeCount}</div>
                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Actives</div>
                </div>
            </div>
            <button 
                onClick={() => setShowForm(!showForm)}
                style={{ backgroundColor: '#F77F00', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }}
            >
                <FaPlus size={20} />
                {showForm ? 'Fermer' : 'Nouvelle École'}
            </button>
        </div>

        {/* FORMULAIRE (Repliable) */}
        {showForm && (
            <div style={{ backgroundColor: '#2a2a2a', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #444' }}>
                <h3 style={{ marginTop: 0, color: '#F77F00', borderBottom: '1px solid #444', paddingBottom: '10px' }}>🚀 Onboarding Client</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: '1 1 300px' }}><label style={labelStyle}>Nom École</label><input name="schoolName" value={formData.schoolName} onChange={handleChange} required style={inputStyle} /></div>
                        <div style={{ flex: '1 1 300px' }}><label style={labelStyle}>Ville</label><input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} required style={inputStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Nom Directeur</label><input name="adminNom" value={formData.adminNom} onChange={handleChange} required style={inputStyle} /></div>
                        <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Prénom</label><input name="adminPrenom" value={formData.adminPrenom} onChange={handleChange} required style={inputStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: '1 1 300px' }}><label style={labelStyle}>Email</label><input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required style={inputStyle} /></div>
                        <div style={{ flex: '1 1 300px' }}><label style={labelStyle}>Mot de passe</label><input type="text" name="adminPassword" value={formData.adminPassword} onChange={handleChange} required style={inputStyle} /></div>
                    </div>
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Valider la création</button>
                </form>
            </div>
        )}

        {/* LISTE DES ÉCOLES */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#333', color: '#aaa' }}>
                        <th style={{ padding: '15px' }}>École</th>
                        <th style={{ padding: '15px' }}>Localisation</th>
                        <th style={{ padding: '15px' }}>Date</th>
                        <th style={{ padding: '15px' }}>Statut</th>
                        <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Chargement...</td></tr> : 
                     schools.map(school => (
                        <tr key={school.id} style={{ borderBottom: '1px solid #444' }}>
                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{school.name}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>{school.address}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>{new Date(school.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '15px' }}>
                                {school.isActive ? 
                                    <span style={{ backgroundColor: 'rgba(56, 161, 105, 0.2)', color: '#48bb78', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>ACTIVE</span> 
                                    : 
                                    <span style={{ backgroundColor: 'rgba(229, 62, 62, 0.2)', color: '#f56565', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>SUSPENDUE</span>
                                }
                            </td>
                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                <button 
                                    onClick={() => toggleSchoolStatus(school)}
                                    style={{ 
                                        backgroundColor: school.isActive ? '#e53e3e' : '#38a169', 
                                        color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                                    }}
                                >
                                    <FaPowerOff /> {school.isActive ? 'Couper' : 'Activer'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

const inputStyle = { padding: '10px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '4px', color: 'white', width: '100%', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' };

export default PlatformDashboard;
