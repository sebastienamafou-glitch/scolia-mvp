// scolia-frontend/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { ClassManager } from '../components/ClassManager';
import { BulletinEditor } from '../components/BulletinEditor';
import { StudentCard } from '../components/StudentCard';
import { SchoolNews } from '../components/SchoolNews';
import { TransactionValidator } from '../components/TransactionValidator';
import { RiskRadarWidget } from '../components/RiskRadarWidget';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserShield, FaSearch, FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaCog, FaUnlockAlt } from 'react-icons/fa'; // Ajout de FaUnlockAlt
import { SkillsManager } from '../components/SkillsManager';
import { TimetableManager } from '../components/TimetableManager';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  classe?: string;
  photo?: string;
  dateNaissance?: string;
  adresse?: string;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  infosMedicales?: string;
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  
  // Données Utilisateurs
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Données École (Paramètres)
  const [mySchool, setMySchool] = useState<any>(null);
  const [schoolForm, setSchoolForm] = useState({ name: '', address: '', logo: '', description: '' });

  // États d'Interface (UI)
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ❌ CORRIGÉ : L'email est retiré de l'état initial
  const [newUser, setNewUser] = useState({
    password: '', role: 'Enseignant', 
    nom: '', prenom: '', classe: '', parentId: '', photo: '',
    dateNaissance: '',
    adresse: '',
    contactUrgenceNom: '',
    contactUrgenceTel: '',
    infosMedicales: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchMySchool();
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

  const fetchMySchool = async () => {
    try {
        const res = await api.get('/schools/my-school');
        setMySchool(res.data);
        // Pré-remplir le formulaire
        setSchoolForm({
            name: res.data.name || '',
            address: res.data.address || '',
            logo: res.data.logo || '',
            description: res.data.description || ''
        });
    } catch (e) {
        console.error("Erreur chargement école", e);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.patch('/schools/my-school', schoolForm);
        alert('Informations de l\'école mises à jour !');
        fetchMySchool();
    } catch (e) {
        alert("Erreur lors de la mise à jour.");
    }
  };

  // FONCTION POUR L'IMPORT CSV
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/import/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`✅ Import réussi ! ${res.data.message || ''}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Erreur serveur lors de l'importation. Vérifiez le format du fichier.");
    }
  };

  // --- LOGIQUE DE FILTRAGE ET RECHERCHE ---
  const filteredUsers = allUsers.filter(user => {
    const roleMatch = activeTab === 'Tous' || user.role === activeTab;
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

  // --- LOGIQUE KPI ---
  const countStudents = allUsers.filter(u => u.role === 'Élève').length;
  const countTeachers = allUsers.filter(u => u.role === 'Enseignant').length;
  const countParents = allUsers.filter(u => u.role === 'Parent').length;
  const countAdmins = allUsers.filter(u => u.role === 'Admin').length;

  // --- HANDLER DE CRÉATION UTILISATEUR ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newUser };
      
      // Nettoyage des champs inutiles selon le rôle
      if (payload.role !== 'Élève') {
          delete payload.classe;
          delete payload.parentId;
          delete payload.dateNaissance;
          delete payload.adresse;
          delete payload.contactUrgenceNom;
          delete payload.contactUrgenceTel;
          delete payload.infosMedicales;
      } else {
          payload.parentId = payload.parentId ? Number(payload.parentId) : undefined;
      }

      // 1. Envoi au serveur
      const response = await api.post('/users', payload);
      const createdUser = response.data;

      // 2. Déterminer quel mot de passe afficher
      const passwordDisplay = createdUser.temporaryPassword || newUser.password || 'scolia123';

      // 3. Affichage de l'alerte avec les identifiants
      alert(`✅ Utilisateur créé avec succès !\n\n📧 Identifiant : ${createdUser.email}\n🔑 Mot de passe : ${passwordDisplay}`);
      
      fetchUsers(); 
      
      // Réinitialisation du formulaire
      setNewUser({ 
          password: '', role: 'Enseignant', nom: '', prenom: '', 
          classe: '', parentId: '', photo: '', dateNaissance: '', adresse: '',
          contactUrgenceNom: '', contactUrgenceTel: '', infosMedicales: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création. Vérifiez que tous les champs obligatoires sont remplis.");
    }
  };
  
  // 👇 AJOUT : Gère le clic sur le bouton Reset
  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Confirmer la réinitialisation du mot de passe pour ${user.prenom} ${user.nom} ?`)) {
        return;
    }

    try {
        // Appel à la nouvelle route PATCH /users/:id/reset-password
        const res = await api.patch(`/users/${user.id}/reset-password`);
        
        // Afficher le nouveau mot de passe temporaire
        const newPassword = res.data.plainPassword;
        
        alert(`✅ NOUVEAU MOT DE PASSE : ${newPassword}\n\nL'utilisateur doit l'utiliser immédiatement pour se connecter.`);
        
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        alert("Erreur lors de la réinitialisation du mot de passe.");
    }
  };
  // ... (Reste du code inchangé)
  
  const availableParents = allUsers.filter(user => user.role === 'Parent');

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif' }}>
      
      {/* HEADER DYNAMIQUE */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {mySchool?.logo ? (
                <img src={mySchool.logo} alt="Logo École" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '5px' }} />
            ) : (
                <Logo width={36} height={36} showText={false} />
            )}
            
            <div>
                <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.3rem' }}>
                    {mySchool ? mySchool.name : 'Dashboard Administration'}
                </h1>
                {mySchool && <span style={{ fontSize: '0.8rem', color: '#666' }}>{mySchool.address}</span>}
            </div>
        </div>
        
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

            <button onClick={logout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Déconnexion
            </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>

        {/* ZONE PRIORITAIRE : WIDGET RADAR */}
        {activeTab !== 'Paramètres' && (
            <div style={{ marginBottom: '30px' }}>
                <RiskRadarWidget />
            </div>
        )}

        {/* 1. SECTION KPI */}
        {activeTab !== 'Paramètres' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Élèves" count={countStudents} icon={<FaUserGraduate />} color="#3498db" />
                <KpiCard title="Enseignants" count={countTeachers} icon={<FaChalkboardTeacher />} color="#e67e22" />
                <KpiCard title="Parents" count={countParents} icon={<FaUserTie />} color="#2ecc71" />
                <KpiCard title="Admin Staff" count={countAdmins} icon={<FaUserShield />} color="#34495e" />
            </div>
        )}

        {/* 2. MODULES ALERTES */}
        {activeTab !== 'Paramètres' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <SchoolNews />
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <TransactionValidator />
                </div>
            </div>
        )}

        {/* 3. GESTION PRINCIPALE */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* BARRE D'OUTILS ET ONGLETS */}
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {['Tous', 'Élève', 'Enseignant', 'Parent', 'Admin'].map(role => (
                        <button 
                            key={role}
                            onClick={() => { setActiveTab(role); setCurrentPage(1); }}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                                backgroundColor: activeTab === role ? '#0A2240' : '#f0f2f5',
                                color: activeTab === role ? 'white' : '#555',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {role}
                        </button>
                    ))}

                    <button 
                        onClick={() => setActiveTab('Paramètres')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                            backgroundColor: activeTab === 'Paramètres' ? '#F77F00' : '#f0f2f5',
                            color: activeTab === 'Paramètres' ? 'white' : '#555',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FaCog /> Paramètres École
                    </button>
                </div>

                {activeTab !== 'Paramètres' && (
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
                        
                        {/* BOUTON IMPORT CSV */}
                        <input type="file" accept=".csv" onChange={handleFileImport} style={{ display: 'none' }} id="csv-upload" />
                        <label 
                            htmlFor="csv-upload" 
                            style={{ 
                                backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', 
                                fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' 
                            }}
                        >
                            Importer CSV
                        </label>
                        {/* ------------------------------------ */}

                        <button 
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {showCreateForm ? <><FaTimes /> Fermer</> : <><FaPlus /> Nouveau</>}
                        </button>
                    </div>
                )}
            </div>

            {/* --- CONTENU PRINCIPAL --- */}

            {activeTab === 'Paramètres' ? (
                // --- VUE PARAMÈTRES ---
                <div style={{ padding: '30px' }}>
                    <h2 style={{ color: '#0A2240', marginTop: 0 }}>Personnaliser mon Établissement</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Modifiez ici les informations visibles sur votre espace et les bulletins.</p>
                    
                    <form onSubmit={handleUpdateSchool} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#444' }}>Nom de l'établissement</label>
                            <input type="text" value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} style={inputStyle} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#444' }}>Adresse / Ville</label>
                            <input type="text" value={schoolForm.address} onChange={e => setSchoolForm({...schoolForm, address: e.target.value})} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#444' }}>URL du Logo</label>
                            <input type="text" placeholder="https://mon-ecole.com/logo.png" value={schoolForm.logo} onChange={e => setSchoolForm({...schoolForm, logo: e.target.value})} style={inputStyle} />
                        </div>
                        {schoolForm.logo && (
                            <div style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                                <img src={schoolForm.logo} alt="Aperçu" style={{ maxHeight: '80px', objectFit: 'contain' }} />
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#444' }}>Description / Slogan</label>
                            <textarea placeholder="Une école d'excellence..." value={schoolForm.description} onChange={e => setSchoolForm({...schoolForm, description: e.target.value})} style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }} />
                        </div>

                        <button type="submit" style={{ padding: '14px', backgroundColor: '#008F39', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}>
                            💾 Enregistrer les modifications
                        </button>
                    </form>
                </div>
            ) : (
                // --- VUE TABLEAU UTILISATEURS ---
                <>
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
                                {/* ❌ CORRIGÉ : L'input Email a été retiré */}
                                <input type="password" placeholder="Mot de passe (laisser vide pour auto)" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="URL Photo (opt)" value={newUser.photo} onChange={e => setNewUser({...newUser, photo: e.target.value})} style={inputStyle} />
                                
                                {newUser.role === 'Élève' && (
                                    <div style={{ gridColumn: '1 / -1', backgroundColor: '#E3F2FD', padding: '15px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                        <h4 style={{ gridColumn: '1 / -1', margin: '0 0 10px 0', color: '#1565C0' }}>Dossier Scolaire & Vie</h4>
                                        <input type="text" placeholder="Classe (ex: 6ème A)" value={newUser.classe} onChange={e => setNewUser({...newUser, classe: e.target.value})} style={inputStyle} />
                                        <select value={newUser.parentId} onChange={e => setNewUser({...newUser, parentId: e.target.value})} style={inputStyle}>
                                            <option value="">-- Lier à un Parent --</option>
                                            {availableParents.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                                        </select>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{fontSize:'0.8rem', color:'#666'}}>Date de Naissance</label>
                                            <input type="date" value={newUser.dateNaissance} onChange={e => setNewUser({...newUser, dateNaissance: e.target.value})} style={inputStyle} />
                                        </div>
                                        <input type="text" placeholder="Adresse de résidence" value={newUser.adresse} onChange={e => setNewUser({...newUser, adresse: e.target.value})} style={inputStyle} />
                                        <input type="text" placeholder="Nom Contact Urgence" value={newUser.contactUrgenceNom} onChange={e => setNewUser({...newUser, contactUrgenceTel: e.target.value})} style={inputStyle} />
                                        <input type="text" placeholder="Tél Contact Urgence" value={newUser.contactUrgenceTel} onChange={e => setNewUser({...newUser, contactUrgenceTel: e.target.value})} style={inputStyle} />
                                        <textarea placeholder="Infos Médicales / Allergies (R.A.S par défaut)" value={newUser.infosMedicales} onChange={e => setNewUser({...newUser, infosMedicales: e.target.value})} style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: '60px' }} />
                                    </div>
                                )}
                                <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: '#008F39', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Valider la création</button>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '700px' }}> {/* Augmenté la taille min */}
                            <thead style={{ backgroundColor: '#f8f9fa', color: '#666' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Photo</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Identité</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Rôle</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Contact</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Infos</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th> {/* Nouvelle colonne */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Chargement...</td></tr> : 
                                currentUsers.length === 0 ? <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Aucun résultat trouvé.</td></tr> :
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
                                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleResetPassword(user); }} // Empêcher l'ouverture de la carte élève
                                                title="Réinitialiser le mot de passe"
                                                style={{ 
                                                    padding: '6px 10px', 
                                                    backgroundColor: '#ffc107', 
                                                    color: '#333', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '0.9rem' 
                                                }}
                                            >
                                                <FaUnlockAlt /> Reset
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Page {currentPage} sur {totalPages}</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={paginationBtnStyle}><FaChevronLeft /></button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={paginationBtnStyle}><FaChevronRight /></button>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* MODULES DE GESTION BAS DE PAGE */}
        {activeTab !== 'Paramètres' && (
            <>
                <div style={{ marginTop: '40px', display: 'grid', gap: '30px' }}>
                    <ClassManager />
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h2 style={{ color: '#0A2240', marginTop: 0 }}>📅 Gestion des Emplois du Temps</h2>
                        <TimetableManager />
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h2 style={{ color: '#0A2240', marginTop: 0 }}>📑 Bulletins</h2>
                        <BulletinEditor />
                    </div>
                </div>

                <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '2px dashed #ccc' }}>
                    <h3 style={{ color: '#0A2240', marginTop: 0 }}>🌟 Compétences & Soft Skills</h3>
                    <SkillsManager />
                </div>
            </>
        )}

      </div>

      {/* MODALE ÉLÈVE */}
      {selectedStudent && <StudentCard student={selectedStudent} onClose={() => setSelectedStudent(null)} />}

      <Footer />

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
