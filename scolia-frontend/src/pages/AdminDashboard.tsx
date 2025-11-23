// scolia-frontend/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { ClassManager } from '../components/ClassManager';
import { BulletinEditor } from '../components/BulletinEditor';
import { StudentCard } from '../components/StudentCard';
import { SchoolNews } from '../components/SchoolNews';
import { TransactionValidator } from '../components/TransactionValidator'; // 👈 NOUVEL IMPORT

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
  
  // NOUVEAU STATE POUR LA FICHE ÉLÈVE
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // État pour le formulaire
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
      // NOTE: Dans une vraie appli multi-tenant, cette route devrait être filtrée par schoolId, 
      // ou réservée uniquement au Super Admin si elle renvoie TOUS les utilisateurs.
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
      
      await api.post('/users', payload);
      alert('Utilisateur créé avec succès !');
      fetchUsers(); 
      setNewUser({ ...newUser, email: '', password: '', nom: '', prenom: '', classe: '', parentId: '', photo: '' });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création.");
    }
  };

  // <--- GESTION DU CLIC SUR UN UTILISATEUR --->
  const handleUserClick = async (user: User) => {
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

      {/* 2. INSERTION DU MODULE ACTUALITÉS */}
      <div style={{ marginBottom: '40px' }}>
        <SchoolNews />
      </div>

      {/* AJOUT DU VALIDATEUR DE TRANSACTIONS */}
      <div style={{ marginBottom: '40px' }}>
        <TransactionValidator />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        {/* FORMULAIRE */}
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
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>URL Photo (Optionnel)</label>
                    <input 
                        type="text" 
                        placeholder="https://..." 
                        value={newUser.photo} 
                        onChange={e => setNewUser({...newUser, photo: e.target.value})} 
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                    />
                    {newUser.photo && (
                        <img src={newUser.photo} alt="Prévisualisation" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    )}
                </div>

                {newUser.role === 'Élève' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #90CAF9' }}>
                        <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#0D47A1'}}>Informations Scolaires</label>
                        <input 
                            type="text" 
                            placeholder="Classe (ex: 6ème A)" 
                            value={newUser.classe} 
                            onChange={e => setNewUser({...newUser, classe: e.target.value})} 
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                        />
                        <select
                            value={newUser.parentId}
                            onChange={e => setNewUser({...newUser, parentId: e.target.value})}
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- Lier à un Parent (Optionnel) --</option>
                            {availableParents.map(parent => (
                                <option key={parent.id} value={parent.id}>
                                    Parent : {parent.nom} {parent.prenom}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Créer le compte
                </button>
            </form>
        </div>

        {/* LISTE */}
        <div>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>📋 Liste des utilisateurs ({users.length})</h2>
            {loading ? <p>Chargement...</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0A2240', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '10px', borderRadius: '8px 0 0 8px' }}>Photo</th>
                                <th style={{ padding: '10px' }}>Rôle</th>
                                <th style={{ padding: '10px' }}>Identité</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px', borderRadius: '0 8px 8px 0' }}>Détails</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr 
                                    key={user.id} 
                                    style={{ 
                                        borderBottom: '1px solid #eee',
                                        cursor: user.role === 'Élève' ? 'pointer' : 'default',
                                        backgroundColor: selectedStudent?.id === user.id ? '#F0F8FF' : 'transparent',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <td style={{ padding: '10px' }}>
                                        {user.photo ? (
                                            <img 
                                                src={user.photo} 
                                                alt={user.prenom} 
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666' }}>
                                                {user.prenom ? user.prenom[0] : ''}{user.nom ? user.nom[0] : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            backgroundColor: user.role === 'Admin' ? '#000' : user.role === 'Enseignant' ? '#F77F00' : '#eee',
                                            color: user.role === 'Parent' || user.role === 'Élève' ? '#333' : 'white',
                                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                        {user.nom} {user.prenom}
                                        {user.role === 'Élève' && <span style={{fontSize:'0.7rem', color:'#F77F00', marginLeft:'5px'}}> (Voir fiche)</span>}
                                    </td>
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

      {/* MODULE CLASSE */}
      <ClassManager />

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px dashed #ccc' }} />

      {/* MODULE BULLETIN */}
      <div style={{ marginTop: '40px' }}>
          <h2 style={{ color: '#0A2240' }}>📑 Supervision des Bulletins</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
             En tant qu'administrateur, vous pouvez consulter et modifier les bulletins de toutes les classes.
          </p>
          <BulletinEditor />
      </div>

      {/* MODIF: AFFICHAGE CONDITIONNEL DE LA FICHE ÉLÈVE */}
      {selectedStudent && (
          <StudentCard 
              student={selectedStudent} 
              onClose={() => setSelectedStudent(null)} 
          />
      )}

    </div>
  );
};

export default AdminDashboard;
