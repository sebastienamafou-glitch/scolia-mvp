import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { FaSchool, FaCheckCircle, FaBan, FaSearch, FaPlus, FaPowerOff, FaTimes, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 

interface School {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  modules: {
      cards: boolean;
      sms: boolean;
      ai_planning: boolean;
      risk_radar: boolean;
  };
}

const PlatformDashboard: React.FC = () => {
  const { logout } = useAuth();
  
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // États d'Interface (UI)
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'Active' | 'Suspendue'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);

  // Formulaire de création
  const [formData, setFormData] = useState({
    schoolName: '', schoolAddress: '',
    adminNom: '', adminPrenom: '', adminEmail: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setAllSchools(res.data);
    } catch (error) {
      console.error("Erreur chargement écoles", error);
      toast.error("Impossible de charger la liste des écoles.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRES ---
  const filteredSchools = allSchools.filter(school => {
    const statusMatch = 
        filterStatus === 'Tous' || 
        (filterStatus === 'Active' && school.isActive) ||
        (filterStatus === 'Suspendue' && !school.isActive);
    
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
        school.name.toLowerCase().includes(searchLower) || 
        school.address.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

  const totalCount = allSchools.length;
  const activeCount = allSchools.filter(s => s.isActive).length;
  const suspendedCount = totalCount - activeCount;

  // --- ACTIONS ---

  // 1. Création d'un client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!window.confirm("Confirmer la création de ce nouveau client ?")) return;

    try {
      const response = await api.post('/schools/onboard', formData);
      const { admin } = response.data;

      // UX : Affichage propre des identifiants (plus d'alert moche)
      toast((t) => (
        <div style={{minWidth: '300px'}}>
            <h4 style={{marginTop:0, color: '#38a169'}}>✅ École créée avec succès !</h4>
            <div style={{backgroundColor: '#EDF2F7', padding: '10px', borderRadius: '5px', fontFamily: 'monospace'}}>
                Email : <strong>{admin.generatedEmail}</strong><br/>
                Pass : <strong>{admin.generatedPassword}</strong>
            </div>
            <p style={{marginBottom:0, fontSize:'0.8rem', color:'#718096'}}>Notez ces accès maintenant.</p>
        </div>
      ), { duration: 15000, position: 'top-center' }); // 15 secondes pour copier

      setFormData({ schoolName: '', schoolAddress: '', adminNom: '', adminPrenom: '', adminEmail: '' });
      setShowForm(false);
      fetchSchools(); 
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création.");
    }
  };

  // 2. Activer / Suspendre
  const toggleSchoolStatus = async (school: School) => {
    if (!window.confirm(`Voulez-vous vraiment ${school.isActive ? 'DÉSACTIVER' : 'ACTIVER'} l'école ${school.name} ?`)) return;

    try {
      await api.patch(`/schools/${school.id}/status`, { isActive: !school.isActive });
      setAllSchools(prev => prev.map(s => s.id === school.id ? { ...s, isActive: !s.isActive } : s));
      toast.success(`Statut mis à jour pour ${school.name}`);
    } catch (error) {
      toast.error("Erreur lors de la modification.");
    }
  };

  // 3. Modules
  const toggleModule = async (school: School, moduleName: string) => {
    // @ts-ignore
    const newValue = !school.modules?.[moduleName];

    try {
        await api.patch(`/schools/${school.id}/modules`, { [moduleName]: newValue });
        
        setAllSchools(prev => prev.map(s => {
            if (s.id === school.id) {
                return {
                    ...s,
                    modules: { ...s.modules, [moduleName]: newValue }
                };
            }
            return s;
        }));
        
        toast.success(`Module ${moduleName} ${newValue ? 'activé' : 'désactivé'}`);
    } catch (error) {
        toast.error("Erreur lors de la modification du module.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ backgroundColor: '#1a202c', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#2d3748', padding: '15px 30px', borderBottom: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={36} height={36} showText={false} />
            <div>
                <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Platform Manager</h1>
                <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Super Admin Control Center</span>
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link 
                to="/help" 
                style={{ 
                    backgroundColor: '#4a5568', color: 'white', 
                    padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', 
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' 
                }}
            >
                ❓ Aide
            </Link>

            <button onClick={logout} style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Déconnexion
            </button>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <KpiCard title="Total Clients" count={totalCount} icon={<FaSchool />} color="#3182ce" />
            <KpiCard title="Abonnements Actifs" count={activeCount} icon={<FaCheckCircle />} color="#38a169" />
            <KpiCard title="Suspendus" count={suspendedCount} icon={<FaBan />} color="#e53e3e" />
        </div>

        <div style={{ backgroundColor: '#2d3748', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* BARRE D'OUTILS */}
            <div style={{ padding: '20px', borderBottom: '1px solid #4a5568', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['Tous', 'Active', 'Suspendue'].map((status: any) => (
                        <button 
                            key={status}
                            onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                                backgroundColor: filterStatus === status ? '#F77F00' : '#4a5568',
                                color: 'white', transition: '0.2s'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#a0aec0' }} />
                        <input 
                            type="text" 
                            placeholder="Rechercher une école..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 10px 8px 35px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: 'white' }}
                        />
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#38a169', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {showForm ? <><FaTimes /> Fermer</> : <><FaPlus /> Nouveau Client</>}
                    </button>
                </div>
            </div>

            {/* FORMULAIRE */}
            {showForm && (
                <div style={{ padding: '25px', backgroundColor: '#232c3b', borderBottom: '1px solid #4a5568' }}>
                    <h3 style={{ marginTop: 0, color: '#F77F00', marginBottom: '20px' }}>🚀 Onboarding Nouveau Client</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div><label style={labelStyle}>Nom École</label><input name="schoolName" value={formData.schoolName} onChange={handleChange} required style={inputStyle} /></div>
                        <div><label style={labelStyle}>Ville</label><input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} required style={inputStyle} /></div>
                        <div><label style={labelStyle}>Nom Directeur</label><input name="adminNom" value={formData.adminNom} onChange={handleChange} required style={inputStyle} /></div>
                        <div><label style={labelStyle}>Prénom Directeur</label><input name="adminPrenom" value={formData.adminPrenom} onChange={handleChange} required style={inputStyle} /></div>
                        
                        <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                            Valider la création
                        </button>
                    </form>
                </div>
            )}

            {/* LISTE */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                    <thead style={{ backgroundColor: '#4a5568', color: '#cbd5e0' }}>
                        <tr>
                            <th style={{ padding: '15px' }}>École</th>
                            <th style={{ padding: '15px' }}>Localisation</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>💳 Cartes</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>🤖 IA</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>🚨 Radar</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>📱 SMS</th>
                            <th style={{ padding: '15px' }}>État</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center' }}>Chargement...</td></tr> : 
                        currentSchools.length === 0 ? <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>Aucun résultat.</td></tr> :
                        currentSchools.map(school => (
                            <tr key={school.id} style={{ borderBottom: '1px solid #4a5568', transition: 'background 0.2s' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaSchool color="#a0aec0" /> 
                                    <div>
                                        {school.name}
                                        <div style={{ fontSize: '0.7rem', color:'#718096', fontWeight:'normal' }}>Créée le {new Date(school.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px', color: '#cbd5e0' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt size={12}/> {school.address}</span>
                                </td>
                                
                                <td style={{ textAlign: 'center' }}><ModuleSwitch active={school.modules?.cards} onClick={() => toggleModule(school, 'cards')} /></td>
                                <td style={{ textAlign: 'center' }}><ModuleSwitch active={school.modules?.ai_planning} onClick={() => toggleModule(school, 'ai_planning')} /></td>
                                <td style={{ textAlign: 'center' }}><ModuleSwitch active={school.modules?.risk_radar} onClick={() => toggleModule(school, 'risk_radar')} /></td>
                                <td style={{ textAlign: 'center' }}><ModuleSwitch active={school.modules?.sms} onClick={() => toggleModule(school, 'sms')} /></td>

                                <td style={{ padding: '15px' }}>
                                    {school.isActive ? 
                                        <span style={{ backgroundColor: 'rgba(56, 161, 105, 0.2)', color: '#48bb78', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE</span> 
                                        : 
                                        <span style={{ backgroundColor: 'rgba(229, 62, 62, 0.2)', color: '#f56565', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>SUSPENDUE</span>
                                    }
                                </td>
                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => toggleSchoolStatus(school)}
                                        title={school.isActive ? "Couper l'accès" : "Rétablir l'accès"}
                                        style={{ 
                                            backgroundColor: school.isActive ? '#fc8181' : '#68d391', 
                                            color: school.isActive ? '#742a2a' : '#22543d',
                                            border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
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

            {totalPages > 1 && (
                <div style={{ padding: '15px', borderTop: '1px solid #4a5568', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Page {currentPage} sur {totalPages}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={paginationBtnStyle}><FaChevronLeft /></button>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={paginationBtnStyle}><FaChevronRight /></button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

const KpiCard = ({ title, count, icon, color }: any) => (
    <div style={{ backgroundColor: '#2d3748', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: color, padding: '15px', borderRadius: '50%', color: 'white', display: 'flex' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{count}</div>
            <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>{title}</div>
        </div>
    </div>
);

const ModuleSwitch = ({ active, onClick }: any) => (
    <div 
        onClick={onClick}
        title={active ? "Désactiver ce module" : "Activer ce module"}
        style={{
            width: '40px', height: '20px', 
            backgroundColor: active ? '#48bb78' : '#4a5568',
            borderRadius: '20px', position: 'relative', cursor: 'pointer',
            transition: 'background 0.3s', margin: '0 auto',
            border: '1px solid #4a5568'
        }}
    >
        <div style={{
            width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
            position: 'absolute', top: '1px', 
            left: active ? '21px' : '2px',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
    </div>
);

const inputStyle = { padding: '10px', backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '5px', color: 'white', width: '100%', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0aec0' };
const paginationBtnStyle = { padding: '8px 12px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: 'white', borderRadius: '4px', cursor: 'pointer' };

export default PlatformDashboard;
