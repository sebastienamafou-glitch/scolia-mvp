import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { ClassManager } from '../components/ClassManager';
import { BulletinEditor } from '../components/BulletinEditor';
import { StudentCard } from '../components/StudentCard';
import { SchoolNews } from '../components/SchoolNews';
import { TransactionValidator } from '../components/TransactionValidator';
// Assurez-vous d'avoir installé les icônes : npm install react-icons
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserShield, FaSearch, FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  
  // Données
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // États d'Interface (UI)
  const [activeTab, setActiveTab] = useState<string>('Tous'); // 'Tous', 'Élève', 'Enseignant', 'Parent', 'Admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Formulaire de création
  const [newUser, setNewUser] = useState({
    email: '', password: '', role: 'Enseignant', 
    nom: '', prenom: '', classe: '', parentId: '', photo: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE FILTRAGE ET RECHERCHE ---
  const filteredUsers = allUsers.filter(user => {
    // 1. Filtre par Rôle
    const roleMatch = activeTab === 'Tous' || user.role === activeTab;
    
    // 2. Filtre par Recherche (Nom, Prénom ou Email)
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
        user.nom.toLowerCase().includes(searchLower) || 
        user.prenom.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower);

    return roleMatch && searchMatch;
  });

  // --- LOGIQUE DE PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- LOGIQUE KPI (CALCULS) ---
  const countStudents = allUsers.filter(u => u.role === 'Élève').length;
  const countTeachers = allUsers.filter(u => u.role === 'Enseignant').length;
  const countParents = allUsers.filter(u => u.role === 'Parent').length;
  const countAdmins = allUsers.filter(u => u.role === 'Admin').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newUser };
      if (payload.role !== 'Élève') {
          delete payload.classe;
          delete payload.parentId;
      } else {
          payload.parentId = payload.parentId ? Number(payload.parentId) : undefined;
      }
      await api.post('/users', payload);
      alert('Utilisateur créé avec succès !');
      fetchUsers(); 
      setNewUser({ ...newUser, email: '', password: '', nom: '', prenom: '', classe: '', parentId: '', photo: '' });
      setShowCreateForm(false); // Fermer le formulaire après succès
    } catch (error) {
      alert("Erreur lors de la création.");
    }
  };

  const availableParents = allUsers.filter(user => user.role === 'Parent');

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={36} height={36} showText={false} />
            <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.3rem' }}>Dashboard Administration</h1>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>

        {/* 1. SECTION KPI (INDICATEURS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <KpiCard title="Élèves" count={countStudents} icon={<FaUserGraduate />} color="#3498db" />
            <KpiCard title="Enseignants" count={countTeachers} icon={<FaChalkboardTeacher />} color="#e67e22" />
            <KpiCard title="Parents" count={countParents} icon={<FaUserTie />} color="#2ecc71" />
            <KpiCard title="Admin Staff" count={countAdmins} icon={<FaUserShield />} color="#34495e" />
        </div>

        {/* 2. MODULES ALERTES (News & Paiements) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <SchoolNews />
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <TransactionValidator />
            </div>
        </div>

        {/* 3. GESTION UTILISATEURS (LA GRANDE LISTE) */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* BARRE D'OUTILS (Onglets + Recherche + Bouton Ajout) */}
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Onglets */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['Tous', 'Élève', 'Enseignant', 'Parent', 'Admin'].map(role => (
                        <button 
                            key={role}
                            onClick={() => { setActiveTab(role); setCurrentPage(1); }}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                                backgroundColor: activeTab === role ? '#0A2240' : '#f0f2f5',
                                color: activeTab === role ? 'white' : '#555'
                            }}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {/* Recherche & Ajout */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#aaa' }} />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 10px 8px 35px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {showCreateForm ? <><FaTimes /> Fermer</> : <><FaPlus /> Nouveau</>}
                    </button>
                </div>
            </div>

            {/* FORMULAIRE DE CRÉATION (TIROIR) */}
            {showCreateForm && (
                <div style={{ padding: '20px', backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ marginTop: 0, color: '#0A2240' }}>Ajouter un utilisateur</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={inputStyle}>
                            <option value="Enseignant">Enseignant</option>
                            <option value="Élève">Élève</option>
                            <option value="Parent">Parent</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <input type="text" placeholder="Nom" required value={newUser.nom} onChange={e => setNewUser({...newUser, nom: e.target.value})} style={inputStyle} />
                        <input type="text" placeholder="Prénom" required value={newUser.prenom} onChange={e => setNewUser({...newUser, prenom: e.target.value})} style={inputStyle} />
                        <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={inputStyle} />
                        <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={inputStyle} />
                        <input type="text" placeholder="URL Photo (opt)" value={newUser.photo} onChange={e => setNewUser({...newUser, photo: e.target.value})} style={inputStyle} />
                        
                        {newUser.role === 'Élève' && (
                            <>
                                <input type="text" placeholder="Classe (ex: 6ème A)" value={newUser.classe} onChange={e => setNewUser({...newUser, classe: e.target.value})} style={inputStyle} />
                                <select value={newUser.parentId} onChange={e => setNewUser({...newUser, parentId: e.target.value})} style={inputStyle}>
                                    <option value="">-- Lier à un Parent --</option>
                                    {availableParents.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                                </select>
                            </>
                        )}
                        <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: '#008F39', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Valider</button>
                    </form>
                </div>
            )}

            {/* TABLEAU DES DONNÉES */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ backgroundColor: '#f8f9fa', color: '#666' }}>
                    <tr>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Photo</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Identité</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Rôle</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Contact</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Infos</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Chargement...</td></tr> : 
                     currentUsers.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Aucun résultat trouvé.</td></tr> :
                     currentUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee', cursor: user.role === 'Élève' ? 'pointer' : 'default' }} onClick={() => user.role === 'Élève' && setSelectedStudent(user)}>
                            <td style={{ padding: '10px 15px' }}>
                                {user.photo ? <img src={user.photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} /> : 
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ddd', display:'flex', alignItems:'center', justifyContent:'center' }}>{user.nom[0]}</div>}
                            </td>
                            <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{user.nom} {user.prenom}</td>
                            <td style={{ padding: '10px 15px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: getRoleColor(user.role).bg, color: getRoleColor(user.role).text }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '10px 15px', color: '#666' }}>{user.email}</td>
                            <td style={{ padding: '10px 15px' }}>{user.classe || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Page {currentPage} sur {totalPages}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={paginationBtnStyle}><FaChevronLeft /></button>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={paginationBtnStyle}><FaChevronRight /></button>
                </div>
            </div>
        </div>

        {/* MODULES DE GESTION (EN BAS) */}
        <div style={{ marginTop: '40px', display: 'grid', gap: '30px' }}>
            <ClassManager />
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                <h2 style={{ color: '#0A2240', marginTop: 0 }}>📑 Bulletins</h2>
                <BulletinEditor />
            </div>
        </div>

      </div>

      {/* MODALE ÉLÈVE */}
      {selectedStudent && <StudentCard student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
};

// --- Petits composants & Styles ---

const KpiCard = ({ title, count, icon, color }: any) => (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: color, padding: '15px', borderRadius: '50%', color: 'white', display: 'flex' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{count}</div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{title}</div>
        </div>
    </div>
);

const getRoleColor = (role: string) => {
    switch(role) {
        case 'Élève': return { bg: '#E3F2FD', text: '#1565C0' };
        case 'Enseignant': return { bg: '#FFF3E0', text: '#E65100' };
        case 'Parent': return { bg: '#E8F5E9', text: '#2E7D32' };
        default: return { bg: '#EEEEEE', text: '#616161' };
    }
};

const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' as const };
const paginationBtnStyle = { padding: '8px 12px', border: '1px solid #ddd', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' };

export default AdminDashboard;
