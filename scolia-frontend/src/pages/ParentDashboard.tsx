// scolia-frontend/src/pages/ParentDashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';
import { SchoolNews } from '../components/SchoolNews';
import { PaymentSubmissionForm } from '../components/PaymentSubmissionForm';
import { useReactToPrint } from 'react-to-print';
import { requestForToken } from '../firebase-config';
import { FaLock } from 'react-icons/fa'; 
import { Footer } from '../components/Footer';
import { DigitalIdCard } from '../components/DigitalIdCard';
import toast from 'react-hot-toast'; // Import UX

// --- Types ---
interface Student {
  id: number;
  prenom: string;
  nom: string;
  class?: { name: string };
  photo?: string;
  dateNaissance?: string; 
}

interface BulletinData {
  subjects: {
    matiere: string;
    moyenne: number;
    coefTotal: number;
  }[];
  globalAverage: number;
  bulletinData: {
    appreciation: string;
  };
  isBlocked?: boolean; 
}

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  // États
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Référence pour l'impression PDF
  const componentRef = useRef<HTMLDivElement>(null); 

  // Fonction d'impression
  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: `Bulletin_${user?.nom || 'Scolia'}`,
  });

  // 1. Initialisation
  useEffect(() => {
    const initNotif = async () => {
        const token = await requestForToken();
        if (token) {
            try {
                await api.post('/notifications/subscribe', { token });
            } catch (e) {
                console.error("Erreur abonnement notif", e);
            }
        }
    };
    initNotif();
    fetchChildren();
  }, [refreshKey]);

  // 2. Charger le bulletin
  useEffect(() => {
    if (selectedChildId) {
      fetchBulletin(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res = await api.get('/students/my-children');
      setChildren(res.data);
      if (res.data.length > 0 && selectedChildId === null) {
        setSelectedChildId(res.data[0].id);
      }
    } catch (error) {
      console.error("Erreur chargement enfants", error);
      toast.error("Impossible de charger les informations des enfants.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBulletin = async (studentId: number) => {
    setBulletin(null);
    try {
      const res = await api.get(`/bulletins?studentId=${studentId}&period=T1`);
      setBulletin(res.data);
    } catch (error) {
      console.error("Erreur chargement bulletin", error);
      // On ne spamme pas d'erreur si le bulletin n'existe juste pas encore
    }
  };
  
  const handlePaymentSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const currentChild = children.find(c => c.id === selectedChildId);

  return (
    <div style={{ backgroundColor: '#F4F6F8', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={40} height={40} showText={false} />
            <div>
                <h1 style={{ color: '#0A2240', margin: 0, fontSize: '1.2rem' }}>Espace Parents</h1>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Famille {user?.nom}</span>
            </div>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        <SchoolNews />

        <h2 style={{ color: '#0A2240', marginTop: '40px' }}>👶 Mes Enfants</h2>
        
        {loading ? <p>Chargement...</p> : children.length === 0 ? (
            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center' }}>
                <p>Aucun enfant lié.</p>
            </div>
        ) : (
            <div>
                {/* ONGLETS */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: selectedChildId === child.id ? '2px solid #0A2240' : '1px solid #ddd',
                                cursor: 'pointer',
                                backgroundColor: selectedChildId === child.id ? 'white' : '#F9F9F9',
                                boxShadow: selectedChildId === child.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ddd', overflow:'hidden' }}>
                                {child.photo ? <img src={child.photo} alt="" style={{width:'100%'}}/> : null}
                            </div>
                            <span style={{ fontWeight: 'bold', color: selectedChildId === child.id ? '#0A2240' : '#666' }}>
                                {child.prenom}
                            </span>
                        </button>
                    ))}
                </div>

                {/* FICHE ENFANT */}
                {currentChild && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        
                        {/* --- ZONE IMPRIMABLE (Début) --- */}
                        <div ref={componentRef}> 
                            
                            {/* BANDEAU IDENTITÉ */}
                            <div style={{ backgroundColor: '#0A2240', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{currentChild.prenom} {currentChild.nom}</h2>
                                    <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Classe : {currentChild.class?.name || 'Non assigné'}</span>
                                </div>
                                
                                {/* Moyenne + Bouton PDF */}
                                {bulletin && (
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                        
                                        {/* Affichage Conditionnel : Cacher la moyenne si bloqué */}
                                        {bulletin.isBlocked ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
                                                <FaLock /> <span>Accès restreint</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Moyenne Générale</div>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#F77F00' }}>
                                                    {bulletin.globalAverage} <span style={{fontSize:'1rem', color:'white'}}>/ 20</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* BOUTON D'IMPRESSION (Caché si bloqué) */}
                                        {!bulletin.isBlocked && (
                                            <button 
                                                onClick={() => handlePrint && handlePrint()}
                                                style={{ 
                                                    backgroundColor: 'white', color: '#0A2240', 
                                                    border: 'none', padding: '5px 10px', borderRadius: '4px', 
                                                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem',
                                                    display: 'flex', alignItems: 'center', gap: '5px'
                                                }}
                                            >
                                                🖨️ Télécharger PDF
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* CONTENU PRINCIPAL */}
                            <div style={{ padding: '25px' }}>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
                                    
                                    {/* SECTION GAUCHE : CARTE SCOLAIRE */}
                                    <div style={{ flex: '0 0 auto' }}>
                                        <h3 style={{ marginTop: 0, color: '#0A2240', marginBottom: '15px' }}>🆔 Carte Scolaire</h3>
                                        <DigitalIdCard 
                                            student={{
                                                id: currentChild.id,
                                                nom: currentChild.nom,
                                                prenom: currentChild.prenom,
                                                photo: currentChild.photo,
                                                classe: currentChild.class?.name,
                                                dateNaissance: currentChild.dateNaissance,
                                                schoolName: "Scolia Academy"
                                            }}
                                        />
                                        <button style={{ marginTop: '10px', border: 'none', background: 'transparent', color: '#666', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            Télécharger la carte
                                        </button>
                                    </div>

                                    {/* SECTION DROITE : BULLETIN & PAIEMENT */}
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        {bulletin ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                                                
                                                {/* NOTES OU BLOCAGE */}
                                                <div>
                                                    <h3 style={{ marginTop: 0, color: '#0A2240', borderBottom: '2px solid #F0F0F0', paddingBottom: '10px' }}>📊 Résultats par matière</h3>
                                                    
                                                    {bulletin.isBlocked ? (
                                                        <div style={{ 
                                                            backgroundColor: '#FFEBEE', 
                                                            color: '#D32F2F', 
                                                            padding: '30px', 
                                                            borderRadius: '10px', 
                                                            textAlign: 'center',
                                                            border: '1px solid #FFCDD2'
                                                        }}>
                                                            <FaLock size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
                                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Bulletin non disponible</h4>
                                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                                                Les résultats scolaires sont temporairement masqués. 
                                                                Veuillez régulariser la situation financière ci-contre ou contacter l'administration.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <tbody>
                                                                {bulletin.subjects.map((sub, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                                        <td style={{ padding: '12px 0', color: '#444', fontWeight: '500' }}>{sub.matiere}</td>
                                                                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                                            <span style={{ 
                                                                                fontWeight: 'bold', 
                                                                                color: sub.moyenne >= 10 ? '#008F39' : '#D32F2F',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '6px',
                                                                                border: '1px solid #eee'
                                                                            }}>
                                                                                {sub.moyenne}/20
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>

                                                {/* APPRÉCIATION & PAIEMENT */}
                                                <div>
                                                    {!bulletin.isBlocked && (
                                                        <>
                                                            <h3 style={{ marginTop: 0, color: '#0A2240', borderBottom: '2px solid #F0F0F0', paddingBottom: '10px' }}>👨‍🏫 Avis du Conseil</h3>
                                                            <div style={{ backgroundColor: '#FFF8E1', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #FFC107', marginBottom: '30px' }}>
                                                                {bulletin.bulletinData?.appreciation ? (
                                                                    <p style={{ margin: 0, color: '#5D4037', fontStyle: 'italic', lineHeight: '1.6' }}>
                                                                        "{bulletin.bulletinData.appreciation}"
                                                                    </p>
                                                                ) : (
                                                                    <p style={{ color: '#999', margin: 0 }}>Aucune appréciation.</p>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="no-print"> 
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>💰 Gestion Scolarité</h4>
                                                        <PaymentSubmissionForm 
                                                            studentId={currentChild.id}
                                                            onTransactionSubmitted={handlePaymentSubmitted}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                Chargement des résultats...
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div> 
                        {/* --- FIN ZONE IMPRIMABLE --- */}

                    </div>
                )}
            </div>
        )}
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          button { display: none !important; }
        }
      `}</style>
      
      <Footer />

    </div>
  );
};

export default ParentDashboard;
