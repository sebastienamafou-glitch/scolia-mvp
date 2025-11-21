// scolia-frontend/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

// Type pour l'affichage
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  classe?: string;
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État pour le formulaire de création
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'Enseignant', // Valeur par défaut
    nom: '',
    prenom: '',
    classe: '' // Optionnel (pour élèves)
  });

  // Chargement initial
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // On nettoie les champs vides (ex: classe si c'est un prof)
      const payload = { ...newUser };
      if (payload.role !== 'Élève') delete (payload as any).classe;

      await api.post('/users', payload);
      
      alert('Utilisateur créé avec succès !');
      fetchUsers(); // Rafraîchir la liste
      // Reset du formulaire (sauf le rôle pour enchainer)
      setNewUser({ ...newUser, email: '', password: '', nom: '', prenom: '' });

    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création.");
    }
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px', color: '#333' }}>
      
      {/* HEADER */}
      <header style={{ padding: '10px 0', borderBottom: '2px solid #F77F00', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={40} height={40} showText={false} />
            <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.5rem' }}>Espace Administration</h1>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        
        {/* COLONNE GAUCHE : FORMULAIRE D'AJOUT */}
        <div style={{ backgroundColor: '#F4F6F8', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>➕ Ajouter un utilisateur</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="Enseignant">Enseignant</option>
                    <option value="Élève">Élève</option>
                    <option value="Parent">Parent</option>
                    <option value="Admin">Administrateur</option>
                </select>

                <input type="text" placeholder="Nom" required value={newUser.nom} onChange={e => setNewUser({...newUser, nom: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Prénom" required value={newUser.prenom} onChange={e => setNewUser({...newUser, prenom: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                
                {newUser.role === 'Élève' && (
                    <input type="text" placeholder="Classe (ex: 6ème A)" value={newUser.classe} onChange={e => setNewUser({...newUser, classe: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                )}

                <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Créer le compte
                </button>
            </form>
        </div>

        {/* COLONNE DROITE : LISTE DES UTILISATEURS */}
        <div>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>📋 Liste des utilisateurs ({users.length})</h2>
            
            {loading ? <p>Chargement...</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0A2240', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '10px', borderRadius: '8px 0 0 8px' }}>Rôle</th>
                                <th style={{ padding: '10px' }}>Nom Prénom</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px', borderRadius: '0 8px 8px 0' }}>Classe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            backgroundColor: user.role === 'Admin' ? '#000' : user.role === 'Enseignant' ? '#F77F00' : '#eee',
                                            color: user.role === 'Parent' || user.role === 'Élève' ? '#333' : 'white',
                                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{user.nom} {user.prenom}</td>
                                    <td style={{ padding: '10px', color: '#666' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>{user.classe || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
