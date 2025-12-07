// scolia-frontend/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // ✅ CORRECTION : Import simplifié (retrait de type Toast inutilisé)

// Imports des modules fonctionnels
import { ClassManager } from '../components/ClassManager';
import { BulletinEditor } from '../components/BulletinEditor';
import { StudentCard } from '../components/StudentCard';
import { SchoolNews } from '../components/SchoolNews';
import { TransactionValidator } from '../components/TransactionValidator';
import { RiskRadarWidget } from '../components/RiskRadarWidget';
import { SkillsManager } from '../components/SkillsManager';
import { TimetableManager } from '../components/TimetableManager';
import { Footer } from '../components/Footer';

import { 
    FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserShield, 
    FaSearch, FaPlus, FaTimes, FaChevronLeft, FaChevronRight, 
    FaCog, FaUnlockAlt, FaLock 
} from 'react-icons/fa';

export const UserRole = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
  STUDENT: 'Student',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// --- TYPES ---

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  class?: {
      id: number;
      name: string;
  }; 
  photo?: string;
  dateNaissance?: string;
  adresse?: string;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  infosMedicales?: string;
}

interface SchoolInfo {
    id: number;
    name: string;
    address: string;
    logo: string;
    description: string;
    modules: {
        cards: boolean;
        sms: boolean;
        ai_planning: boolean;
        risk_radar: boolean;
    };
}

interface ClassOption {
    id: number;
    name: string;
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [mySchool, setMySchool] = useState<SchoolInfo | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [schoolLoading, setSchoolLoading] = useState(true);

  // États UI
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [schoolForm, setSchoolForm] = useState({ name: '', address: '', logo: '', description: '' });
  
  const [newUser, setNewUser] = useState({
    password: '', 
    role: UserRole.TEACHER as UserRole,
    nom: '', prenom: '', 
    classId: '',
    parentId: '', photo: '',
    dateNaissance: '', adresse: '',
    contactUrgenceNom: '', contactUrgenceTel: '', infosMedicales: ''
  });

  useEffect(() => {
    const init = async () => {
        await Promise.all([fetchUsers(), fetchMySchool(), fetchClasses()]);
        setLoading(false);
    };
    init();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data as User[]);
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
      toast.error("Erreur lors du chargement des utilisateurs.");
    }
  };
  
  const fetchClasses = async () => {
      try {
          const res = await api.get('/classes');
          setAvailableClasses(res.data);
      } catch (e) { console.error("Erreur classes", e); }
  };

  const fetchMySchool = async () => {
    setSchoolLoading(true);
    try {
        const res = await api.get('/schools/my-school');
        let mod = res.data.modules;
        if (typeof mod === 'string') {
             mod = JSON.parse(mod);
        }
        res.data.modules = mod;
        setMySchool(res.data);
        setSchoolForm({
            name: res.data.name || '',
            address: res.data.address || '',
            logo: res.data.logo || '',
            description: res.data.description || ''
        });
    } catch (e) {
        console.error("Erreur chargement école", e);
        toast.error("Impossible de charger les infos de l'école.");
    } finally {
        setSchoolLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.patch('/schools/my-school', schoolForm);
        toast.success('✅ Informations mises à jour !');
        fetchMySchool();
    } catch (e) {
        toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Importation en cours...");
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/import/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`✅ Import réussi ! ${res.data.message || ''}`, { id: toastId });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'importation. Vérifiez le format CSV.", { id: toastId });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newUser };
      
      if (payload.role !== UserRole.STUDENT) {
          delete payload.classId;
          delete payload.parentId; delete payload.dateNaissance;
          delete payload.adresse; delete payload.contactUrgenceNom;
          delete payload.contactUrgenceTel; delete payload.infosMedicales;
      } else {
          payload.parentId = payload.parentId ? Number(payload.parentId) : undefined;
          payload.classId = payload.classId ? Number(payload.classId) : undefined;
      }

      const response = await api.post('/users', payload);
      const createdUser = response.data;
      const passwordDisplay = createdUser.plainPassword || 'Envoyé par email';

      toast(() => (
        <div>
            <b>✅ Utilisateur créé !</b><br/>
            Email: {createdUser.email}<br/>
            Mdp: <strong>{passwordDisplay}</strong>
        </div>
      ), { duration: 8000, style: { background: '#E8F5E9', border: '1px solid #4CAF50' } });
      
      fetchUsers();
      setNewUser({ 
          password: '', role: UserRole.TEACHER, nom: '', prenom: '', 
          classId: '', parentId: '', photo: '', dateNaissance: '', adresse: '',
          contactUrgenceNom: '', contactUrgenceTel: '', infosMedicales: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Erreur création. Vérifiez les champs obligatoires.");
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${user.prenom} ${user.nom} ?`)) return;
    try {
        const res = await api.patch(`/users/${user.id}/reset-password`);
        prompt(`✅ Nouveau mot de passe pour ${user.nom} :`, res.data.plainPassword);
    } catch (error) {
        toast.error("Erreur lors de la réinitialisation.");
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const roleMatch = activeTab === 'Tous' || user.role === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
        user.nom.toLowerCase().includes(searchLower) || 
        user.prenom.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower);
    return roleMatch && searchMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- KPI ---
  const countStudents = allUsers.filter(u => u.role === UserRole.STUDENT).length;
  const countTeachers = allUsers.filter(u => u.role === UserRole.TEACHER).length;
  const countParents = allUsers.filter(u => u.role === UserRole.PARENT).length;
  const countAdmins = allUsers.filter(u => u.role === UserRole.ADMIN).length;
  const availableParents = allUsers.filter(user => user.role === UserRole.PARENT);
  
  const defaultModules: SchoolInfo['modules'] = { risk_radar: false, ai_planning: false, sms: false, cards: false };
  const safeModules = mySchool?.modules ? { ...defaultModules, ...mySchool.modules } : defaultModules;
  
  if (schoolLoading || loading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: '#f0f2f5', color: '#0A2240', fontFamily: 'sans-serif' }}>
              <div style={{ border: '4px solid #f3f3f3', borderRadius: '50%', borderTop: '4px solid #0A2240', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Chargement de l'espace administration...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
      );
  }
  
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {mySchool?.logo ? (
             <img src={mySchool.logo} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '5px' }} />
            ) : (
                <Logo width={36} height={36} showText={false} />
            )}
            <div>
                <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.3rem' }}>
                    {mySchool ? mySchool.name : 'Chargement...'}
                </h1>
                {mySchool && <span style={{ fontSize: '0.8rem', color: '#666' }}>Administration</span>}
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link to="/help" style={{ textDecoration: 'none', color: '#0A2240', fontWeight: 'bold', fontSize: '0.9rem' }}>❓ Aide</Link>
            <button onClick={logout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Déconnexion</button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>

        {/* RISK RADAR */}
        {activeTab !== 'Paramètres' && (
            <div style={{ marginBottom: '30px' }}>
                {safeModules.risk_radar ? ( <RiskRadarWidget /> ) : (
                    <UpsellBanner title="Radar de Risque & Rétention" description="Détectez automatiquement les élèves en décrochage." />
                )}
            </div>
        )}

        {/* SECTION KPI */}
        {activeTab !== 'Paramètres' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Élèves Inscrits" count={countStudents} icon={<FaUserGraduate />} color="#3498db" />
                <KpiCard title="Enseignants" count={countTeachers} icon={<FaChalkboardTeacher />} color="#e67e22" />
                <KpiCard title="Parents Liés" count={countParents} icon={<FaUserTie />} color="#2ecc71" />
                <KpiCard title="Admin Staff" count={countAdmins} icon={<FaUserShield />} color="#34495e" />
            </div>
        )}

        {/* GESTION QUOTIDIENNE */}
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

        {/* TABLEAU DE BORD PRINCIPAL */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {[ 'Tous', UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.ADMIN ].map(role => (
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
                            display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'
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
                                type="text" placeholder="Rechercher..." 
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '8px 10px 8px 35px', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <input type="file" accept=".csv" onChange={handleFileImport} style={{ display: 'none' }} id="csv-upload" />
                        <label htmlFor="csv-upload" style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Importer CSV
                        </label>
                        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {showCreateForm ? <><FaTimes /> Fermer</> : <><FaPlus /> Nouveau</>}
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'Paramètres' ? (
                <div style={{ padding: '30px' }}>
                    <h2 style={{ color: '#0A2240', marginTop: 0 }}>Personnaliser mon Établissement</h2>
                    <form onSubmit={handleUpdateSchool} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                        <div><label style={labelStyle}>Nom Établissement</label><input type="text" value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} style={inputStyle} required /></div>
                        <div><label style={labelStyle}>Ville / Adresse</label><input type="text" value={schoolForm.address} onChange={e => setSchoolForm({...schoolForm, address: e.target.value})} style={inputStyle} /></div>
                        <div><label style={labelStyle}>URL Logo</label><input type="text" value={schoolForm.logo} onChange={e => setSchoolForm({...schoolForm, logo: e.target.value})} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Description</label><textarea value={schoolForm.description} onChange={e => setSchoolForm({...schoolForm, description: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} /></div>
                        <button type="submit" style={{ padding: '14px', backgroundColor: '#008F39', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>💾 Enregistrer</button>
                    </form>
                </div>
            ) : (
                <>
                    {showCreateForm && (
                        <div style={{ padding: '20px', backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} style={inputStyle}>
                                    <option value={UserRole.TEACHER}>{UserRole.TEACHER}</option>
                                    <option value={UserRole.STUDENT}>{UserRole.STUDENT}</option>
                                    <option value={UserRole.PARENT}>{UserRole.PARENT}</option>
                                    <option value={UserRole.ADMIN}>{UserRole.ADMIN}</option>
                                </select>
                                <input type="text" placeholder="Nom" required value={newUser.nom} onChange={e => setNewUser({...newUser, nom: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Prénom" required value={newUser.prenom} onChange={e => setNewUser({...newUser, prenom: e.target.value})} style={inputStyle} />
                                
                                {newUser.role === UserRole.STUDENT && (
                                    <div style={{ gridColumn: '1 / -1', backgroundColor: '#E3F2FD', padding: '15px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                        
                                        <select 
                                            value={newUser.classId} 
                                            onChange={e => setNewUser({...newUser, classId: e.target.value})} 
                                            style={inputStyle}
                                        >
                                            <option value="">-- Choisir une Classe --</option>
                                            {availableClasses.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        <select value={newUser.parentId} onChange={e => setNewUser({...newUser, parentId: e.target.value})} style={inputStyle}>
                                            <option value="">-- Lier à un Parent --</option>
                                            {availableParents.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                                        </select>
                                        <input type="date" value={newUser.dateNaissance} onChange={e => setNewUser({...newUser, dateNaissance: e.target.value})} style={inputStyle} />
                                        <input type="text" placeholder="Contact Urgence (Nom & Tel)" value={newUser.contactUrgenceNom} onChange={e => setNewUser({...newUser, contactUrgenceNom: e.target.value})} style={inputStyle} />
                                    </div>
                                )}
                                <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: '#008F39', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>Valider</button>
                            </form>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '700px' }}>
                            <thead style={{ backgroundColor: '#f8f9fa', color: '#666' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Identité</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Rôle</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Classe</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Aucun résultat.</td></tr> :
                                currentUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #eee', cursor: user.role === UserRole.STUDENT ? 'pointer' : 'default' }} onClick={() => user.role === UserRole.STUDENT && setSelectedStudent(user)}>
                                        <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{user.nom} {user.prenom}</td>
                                        <td style={{ padding: '10px 15px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: getRoleColor(user.role).bg, color: getRoleColor(user.role).text }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 15px', color: '#666' }}>{user.email}</td>
                                        <td style={{ padding: '10px 15px' }}>{user.class?.name || '-'}</td>
                                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleResetPassword(user); }} title="Réinitialiser Mot de Passe" style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                <FaUnlockAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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

        {/* --- MODULES GESTION (Bas de page) --- */}
        {activeTab !== 'Paramètres' && (
            <>
                <div style={{ marginTop: '40px', display: 'grid', gap: '30px' }}>
                    <ClassManager onClassCreated={fetchClasses} />
                    
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h2 style={{ color: '#0A2240', marginTop: 0 }}>📅 Gestion des Emplois du Temps</h2>
                        {safeModules.ai_planning ? ( <TimetableManager /> ) : ( <UpsellBannerSmall title="Générateur IA d'Emploi du temps" /> )}
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

const KpiCard = ({ title, count, icon, color }: any) => (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: color, padding: '15px', borderRadius: '50%', color: 'white', display: 'flex' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{count}</div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{title}</div>
        </div>
    </div>
);

const UpsellBanner = ({ title, description }: any) => (
    <div style={{ background: 'linear-gradient(90deg, #FFF3E0 0%, #FFFFFF 100%)', border: '1px dashed #F77F00', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 10px rgba(247, 127, 0, 0.1)' }}>
        <div style={{ backgroundColor: '#FFE0B2', padding: '15px', borderRadius: '50%', color: '#E65100', fontSize: '1.5rem' }}><FaLock /></div>
        <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#E65100', fontSize: '1.1rem' }}>Module {title} Verrouillé</h3>
            <p style={{ margin: 0, color: '#555' }}>{description}</p>
        </div>
        <a href="mailto:commercial@scolia.ci" style={{ textDecoration: 'none', backgroundColor: '#E65100', color: 'white', fontWeight: 'bold', padding: '10px 20px', borderRadius: '6px', fontSize: '0.9rem' }}>
            Activer ce module
        </a>
    </div>
);

const UpsellBannerSmall = ({ title }: any) => (
    <div style={{ padding: '30px', textAlign: 'center', color: '#888', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px dashed #ccc' }}>
        <FaLock size={24} color="#F77F00" style={{ marginBottom: '10px' }} />
        <p>Le module <b>{title}</b> n'est pas inclus dans votre offre.</p>
        <button style={{ color: '#F77F00', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
            Contacter le service commercial
        </button>
    </div>
);

const getRoleColor = (role: string) => {
    switch(role) {
        case UserRole.STUDENT: return { bg: '#E3F2FD', text: '#1565C0' };
        case UserRole.TEACHER: return { bg: '#FFF3E0', text: '#E65100' };
        case UserRole.PARENT: return { bg: '#E8F5E9', text: '#2E7D32' };
        default: return { bg: '#EEEEEE', text: '#616161' };
    }
};

const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555', fontWeight: 'bold' };
const paginationBtnStyle = { padding: '8px 12px', border: '1px solid #ddd', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' };

export default AdminDashboard;
