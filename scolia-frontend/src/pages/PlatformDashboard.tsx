import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PlatformDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    adminNom: '',
    adminPrenom: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!window.confirm("Créer ce nouveau client (École) ?")) return;

    try {
      await api.post('/schools/onboard', formData);
      alert(`✅ École "${formData.schoolName}" créée !\nLe client peut se connecter.`);
      setFormData({ schoolName: '', schoolAddress: '', adminNom: '', adminPrenom: '', adminEmail: '', adminPassword: '' });
    } catch (error) {
      console.error(error);
      alert("Erreur création. Vérifiez que l'email n'existe pas déjà.");
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#2c3e50', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>🚀 Espace Développeur (Super Admin)</h1>
          <button onClick={logout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Déconnexion</button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', color: '#333', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🏢 Nouvel Abonnement École</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <label style={{fontWeight:'bold'}}>L'Établissement</label>
            <input type="text" placeholder="Nom de l'école" required value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Ville" required value={formData.schoolAddress} onChange={e => setFormData({...formData, schoolAddress: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />

            <label style={{fontWeight:'bold', marginTop:'10px'}}>Le Directeur (Premier Compte)</label>
            <input type="text" placeholder="Nom" required value={formData.adminNom} onChange={e => setFormData({...formData, adminNom: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Prénom" required value={formData.adminPrenom} onChange={e => setFormData({...formData, adminPrenom: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Email Admin" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Mot de passe provisoire" required value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />

            <button type="submit" style={{ marginTop: '20px', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Créer l'abonnement
            </button>
        </form>
      </div>
    </div>
  );
};

export default PlatformDashboard;
