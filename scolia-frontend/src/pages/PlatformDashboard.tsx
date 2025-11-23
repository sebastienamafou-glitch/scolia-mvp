import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';

const PlatformDashboard: React.FC = () => {
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({
    schoolName: '', schoolAddress: '',
    adminNom: '', adminPrenom: '', adminEmail: '', adminPassword: ''
  });

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
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création de l'école.");
    }
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* HEADER RESPONSIVE */}
      <header style={{ padding: '15px 20px', borderBottom: '1px solid #333', backgroundColor: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo width={32} height={32} showText={false} />
            <h1 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Super Admin</h1>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>🚀 Onboarding Client</h2>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Nouvelle école & administrateur.</p>
        </div>

        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* SECTION ECOLE */}
                <div style={{ borderBottom: '1px solid #444', paddingBottom: '20px' }}>
                    <h3 style={{ color: '#F77F00', marginTop: 0, fontSize: '1.2rem' }}>🏫 L'École</h3>
                    {/* Flex-wrap permet de passer à la ligne sur mobile */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Nom de l'établissement</label>
                            <input name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Ex: Collège Saint-Viateur" required style={inputStyle} />
                        </div>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Adresse / Ville</label>
                            <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} placeholder="Ex: Abidjan, Cocody" required style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* SECTION DIRECTEUR */}
                <div>
                    <h3 style={{ color: '#4CAF50', marginTop: 0, fontSize: '1.2rem' }}>👤 Le Directeur</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Nom</label>
                            <input name="adminNom" value={formData.adminNom} onChange={handleChange} placeholder="Nom" required style={inputStyle} />
                        </div>
                        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Prénom</label>
                            <input name="adminPrenom" value={formData.adminPrenom} onChange={handleChange} placeholder="Prénom" required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Email de connexion</label>
                            <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@ecole.ci" required style={inputStyle} />
                        </div>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Mot de passe</label>
                            <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="Secret123" required style={inputStyle} />
                        </div>
                    </div>
                </div>

                <button type="submit" style={{ marginTop: '10px', padding: '15px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                    ⚡ Créer le Client
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
    padding: '12px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '6px',
    color: 'white',
    outline: 'none',
    fontSize: '16px', // Évite le zoom automatique sur iPhone
    width: '100%',    // Prend toute la largeur du conteneur parent
    boxSizing: 'border-box' as const // Empêche le dépassement (padding inclus dans la largeur)
};

export default PlatformDashboard;
