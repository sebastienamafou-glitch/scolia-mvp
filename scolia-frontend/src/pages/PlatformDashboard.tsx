import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';

const PlatformDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  
  // États pour le formulaire de création d'école
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    adminNom: '',
    adminPrenom: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Appel à la route sécurisée que nous avons créée dans schools.controller.ts
      await api.post('/schools/onboard', formData);
      alert('✅ École et Administrateur créés avec succès !');
      // Reset du formulaire
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
      
      {/* HEADER SUPER ADMIN */}
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={40} height={40} showText={false} />
            <div>
                <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Super Admin Platform</h1>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Bienvenue, {user?.prenom} (Maître du SaaS)</span>
            </div>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>🚀 Onboarding Client</h2>
            <p style={{ color: '#aaa' }}>Créez une nouvelle instance d'école et son administrateur principal.</p>
        </div>

        {/* FORMULAIRE DE CRÉATION D'ÉCOLE */}
        <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* SECTION ECOLE */}
                <div style={{ borderBottom: '1px solid #444', paddingBottom: '20px' }}>
                    <h3 style={{ color: '#F77F00', marginTop: 0 }}>🏫 L'École</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Nom de l'établissement</label>
                            <input name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Ex: Collège Saint-Viateur" required style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Adresse / Ville</label>
                            <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} placeholder="Ex: Abidjan, Cocody" required style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* SECTION DIRECTEUR */}
                <div>
                    <h3 style={{ color: '#4CAF50', marginTop: 0 }}>👤 Le Directeur (Admin Client)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Nom</label>
                            <input name="adminNom" value={formData.adminNom} onChange={handleChange} placeholder="Nom" required style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Prénom</label>
                            <input name="adminPrenom" value={formData.adminPrenom} onChange={handleChange} placeholder="Prénom" required style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Email de connexion</label>
                            <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@ecole.ci" required style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>Mot de passe provisoire</label>
                            <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="Secret123" required style={inputStyle} />
                        </div>
                    </div>
                </div>

                <button type="submit" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ⚡ Créer le Client
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

// Petit style inline pour les inputs
const inputStyle = {
    padding: '12px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '6px',
    color: 'white',
    outline: 'none'
};

export default PlatformDashboard;
