import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { ClassManager } from '../components/ClassManager';
import { BulletinEditor } from '../components/BulletinEditor';
import { StudentCard } from '../components/StudentCard';
import { SchoolNews } from '../components/SchoolNews';
import { TransactionValidator } from '../components/TransactionValidator';


interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  classe?: string;
  photo?: string;
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // État pour le formulaire de création
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'Enseignant', 
    nom: '',
    prenom: '',
    classe: '',
    parentId: '',
    photo: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Appel à la route sécurisée : le Backend ne renverra que les users de l'école
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
    } finally {
      setLoading(false);
    }
  };

  const availableParents = users.filter(user => user.role === 'Parent');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newUser };
      
      // Nettoyage des champs inutiles selon le rôle
      if (payload.role !== 'Élève') {
          delete payload.classe;
          delete payload.parentId;
      } else {
          if (payload.parentId) {
              payload.parentId = Number(payload.parentId);
          } else {
              delete payload.parentId;
          }
      }
      
      // On envoie. Le Backend ajoutera automatiquement le schoolId du directeur connecté.
      await api.post('/users', payload);
      
      alert('Utilisateur créé avec succès !');
      fetchUsers(); 
      setNewUser({ ...newUser, email: '', password: '', nom: '', prenom: '', classe: '', parentId: '', photo: '' });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création.");
    }
  };

  const handleUserClick = (user: User) => {
    if (user.role === 'Élève') {
       setSelectedStudent(user); 
    }
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px', color: '#333' }}>
      
      <header style={{ padding: '10px 0', borderBottom: '2px solid #F77F00', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={40} height={40} showText={false} />
            <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.5rem' }}>Espace Administration</h1>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
        </button>
      </header>

      {/* MODULE 1 : ACTUALITÉS */}
      <div style={{ marginBottom: '40px' }}>
        <SchoolNews />
      </div>

      {/* MODULE 2 : VALIDATION DES PAIEMENTS */}
      <div style={{ marginBottom: '40px' }}>
        <TransactionValidator />
      </div>

      {/* MODULE 3 : GESTION UTILISATEURS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        {/* Formulaire */}
        <div style={{ backgroundColor: '#F4F6F8', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>➕ Ajouter un utilisateur</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Rôle</label>
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
                
                <input type="text" placeholder="URL Photo (Optionnel)" value={newUser.photo} onChange={e => setNewUser({...newUser, photo: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                {newUser.role === 'Élève' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #90CAF9' }}>
                        <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#0D47A1'}}>Informations Scolaires</label>
                        <input type="text" placeholder="Classe (ex: 6ème A)" value={newUser.classe} onChange={e => setNewUser({...newUser, classe: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        <select value={newUser.parentId} onChange={e => setNewUser({...newUser, parentId: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="">-- Lier à un Parent --</option>
                            {availableParents.map(p => (<option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>))}
                        </select>
                    </div>
                )}
                <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Créer le compte</button>
            </form>
        </div>

        {/* Liste */}
        <div>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>📋 Liste des utilisateurs ({users.length})</h2>
            {loading ? <p>Chargement...</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0A2240', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Photo</th>
                                <th style={{ padding: '10px' }}>Rôle</th>
                                <th style={{ padding: '10px' }}>Identité</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Détails</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee', cursor: user.role === 'Élève' ? 'pointer' : 'default' }} onClick={() => handleUserClick(user)}>
                                    <td style={{ padding: '10px' }}>
                                        {user.photo ? <img src={user.photo} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} /> : '👤'}
                                    </td>
                                    <td style={{ padding: '10px' }}><span style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{user.role}</span></td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{user.nom} {user.prenom}</td>
                                    <td style={{ padding: '10px', color: '#666' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>{user.classe}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* MODULES GESTION CLASSES ET BULLETINS */}
      <ClassManager />
      <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '2px dashed #ccc' }}>
          <h2 style={{ color: '#0A2240' }}>📑 Supervision des Bulletins</h2>
          <BulletinEditor />
      </div>

      {/* MODALE FICHE ÉLÈVE */}
      {selectedStudent && <StudentCard student={selectedStudent} onClose={() => setSelectedStudent(null)} />}

    </div>
  );
};

export default AdminDashboard;
