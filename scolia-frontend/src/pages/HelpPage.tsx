import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { FaArrowLeft, FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaUsers, FaLifeRing, FaCode } from 'react-icons/fa';

const HelpPage: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  // Par défaut, on ouvre l'onglet correspondant au rôle de l'utilisateur
  const defaultTab = 
    userRole === 'SuperAdmin' ? 'superadmin' :
    userRole === 'Admin' ? 'admin' :
    userRole === 'Enseignant' ? 'prof' : 
    'parent';

  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div style={{ backgroundColor: '#F4F6F8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER SIMPLE */}
      <header style={{ backgroundColor: 'white', padding: '15px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666' }}>
            <FaArrowLeft /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo width={32} height={32} showText={false} />
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#0A2240' }}>Centre d'Aide Scolia</h1>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* BARRE D'ONGLETS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
            
            {/* Onglet SuperAdmin (Visible uniquement par le SuperAdmin) */}
            {userRole === 'SuperAdmin' && (
                <TabButton id="superadmin" label="Super Admin" icon={<FaCode />} active={activeTab} onClick={setActiveTab} />
            )}
            
            <TabButton id="admin" label="Directeur" icon={<FaUserTie />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="prof" label="Enseignant" icon={<FaChalkboardTeacher />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="parent" label="Parents & Élèves" icon={<FaUsers />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="support" label="Support & FAQ" icon={<FaLifeRing />} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* CONTENU */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#444' }}>
            
            {activeTab === 'superadmin' && (
                <section>
                    <h2 style={titleStyle}>👑 Guide Super Admin (Développeur)</h2>
                    <p><em>Réservé au gestionnaire technique de la plateforme.</em></p>
                    
                    <h3>1. Créer une nouvelle école (Onboarding)</h3>
                    <p>Depuis le tableau de bord <strong>Platform</strong> :</p>
                    <ol>
                        <li>Cliquez sur <strong>"Nouveau Client"</strong>.</li>
                        <li>Renseignez le nom de l'école et la ville.</li>
                        <li>Créez le compte du <strong>Directeur</strong> (Nom, Email, Mot de passe provisoire).</li>
                        <li>Validez. Le directeur peut désormais se connecter.</li>
                    </ol>

                    <h3>2. Gérer les abonnements</h3>
                    <p>Vous pouvez suspendre une école en cliquant sur le bouton <strong>"Couper"</strong> dans la liste des clients.</p>
                </section>
            )}

            {activeTab === 'admin' && (
                <section>
                    <h2 style={titleStyle}>🎓 Guide Administrateur (Directeur)</h2>
                    
                    <h3>1. Configuration Initiale</h3>
                    <p>Allez dans le module <strong>Gestion des Classes</strong> en bas de votre tableau de bord pour créer la structure de l'école (6ème A, 5ème B...).</p>

                    <h3>2. Créer des Utilisateurs</h3>
                    <p>Utilisez le formulaire "Ajouter un utilisateur" :</p>
                    <ul>
                        <li><strong>Enseignants :</strong> Créez les comptes profs.</li>
                        <li><strong>Élèves :</strong> Créez les élèves en les assignant à une classe et <strong>en les liant à un Parent</strong>.</li>
                    </ul>

                    <h3>3. Gestion Financière</h3>
                    <p>Pour définir la scolarité d'un élève :</p>
                    <ol>
                        <li>Cliquez sur l'élève dans la liste.</li>
                        <li>Dans sa fiche, allez à la section <strong>Configuration Scolarité</strong>.</li>
                        <li>Définissez le montant dû et la date limite.</li>
                    </ol>
                    <p>Pour <strong>Valider un paiement</strong>, utilisez le module "Validation des Paiements" en haut du dashboard.</p>
                </section>
            )}

            {activeTab === 'prof' && (
                <section>
                    <h2 style={titleStyle}>👨‍🏫 Guide Enseignant</h2>
                    
                    <h3>1. Faire l'Appel</h3>
                    <p>Cliquez sur l'onglet <strong>"Faire l'Appel"</strong>, choisissez votre classe, et marquez les absents. C'est instantané.</p>

                    <h3>2. Saisir des Notes</h3>
                    <ol>
                        <li>Onglet <strong>"Saisir des Notes"</strong>.</li>
                        <li>Choisissez la Classe et la Matière.</li>
                        <li>Entrez le titre du devoir (ex: "Interro 1") et le barème.</li>
                        <li>Notez les élèves et validez. Les parents sont notifiés immédiatement.</li>
                    </ol>

                    <h3>3. Évaluer les Compétences</h3>
                    <p>Utilisez l'onglet <strong>"Compétences"</strong> pour noter les "Soft Skills" (Autonomie, Discipline...) avec des étoiles.</p>
                </section>
            )}

            {activeTab === 'parent' && (
                <section>
                    <h2 style={titleStyle}>👪 Guide Parent & Élève</h2>
                    
                    <h3>1. Suivi Scolaire</h3>
                    <p>Sur votre tableau de bord, cliquez sur le prénom de votre enfant pour voir :</p>
                    <ul>
                        <li>Ses dernières notes en temps réel.</li>
                        <li>Son bulletin (Moyenne et Appréciation).</li>
                        <li>Le bouton pour <strong>Télécharger le Bulletin PDF</strong>.</li>
                    </ul>

                    <h3>2. Paiement de la Scolarité</h3>
                    <p>Si un solde est dû :</p>
                    <ol>
                        <li>Effectuez votre transfert Mobile Money (Orange/MTN/Moov) sur le numéro de l'école.</li>
                        <li>Dans l'application, entrez le montant et la <strong>Référence de la transaction</strong>.</li>
                        <li>Cliquez sur "Soumettre". L'administration validera votre paiement.</li>
                    </ol>
                    <p style={{ color: '#D32F2F', backgroundColor: '#FFEBEE', padding: '10px', borderRadius: '5px' }}>
                        ⚠️ <strong>Note :</strong> Si le paiement est insuffisant, l'accès au bulletin peut être temporairement bloqué.
                    </p>
                </section>
            )}

            {activeTab === 'support' && (
                <section>
                    <h2 style={titleStyle}>🆘 Support et FAQ</h2>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <strong>J'ai oublié mon mot de passe.</strong><br/>
                        Contactez l'administration de votre école pour qu'elle réinitialise votre mot de passe.
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Je ne vois pas mon enfant.</strong><br/>
                        Assurez-vous que l'administration a bien lié votre compte Parent à la fiche de l'Élève avec la bonne adresse email.
                    </div>

                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <p><strong>Besoin d'une assistance technique ?</strong></p>
                        <p>Email : support@scolia.ci</p>
                    </div>
                </section>
            )}

        </div>
      </div>
    </div>
  );
};

// --- Styles & Composants ---

const TabButton = ({ id, label, icon, active, onClick }: any) => (
    <button 
        onClick={() => onClick(id)}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px',
            borderRadius: '30px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            backgroundColor: active === id ? '#0A2240' : 'white',
            color: active === id ? 'white' : '#666',
            boxShadow: active === id ? '0 4px 10px rgba(10,34,64,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);

const titleStyle: React.CSSProperties = {
    color: '#F77F00',
    borderBottom: '2px solid #F77F00',
    paddingBottom: '10px',
    marginTop: 0
};

export default HelpPage;
