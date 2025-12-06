// scolia-frontend/src/pages/HelpPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { FaArrowLeft, FaUserTie, FaChalkboardTeacher, FaUsers, FaLifeRing, FaCode } from 'react-icons/fa';

const HelpPage: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  // Par défaut, on ouvre l'onglet correspondant au rôle de l'utilisateur
  const defaultTab = 
    userRole === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN :
    userRole === UserRole.ADMIN ? UserRole.ADMIN :
    userRole === UserRole.TEACHER ? 'prof' : 
    UserRole.PARENT;

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
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#0A2240' }}>Centre d'Aide Scolia V2</h1>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* BARRE D'ONGLETS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
            
            {/* Onglet SuperAdmin (Visible uniquement par le SuperAdmin) */}
            {userRole === UserRole.SUPER_ADMIN && (
                <TabButton id="superadmin" label="Super Admin" icon={<FaCode />} active={activeTab} onClick={setActiveTab} />
            )}
            
            <TabButton id="admin" label="Directeur" icon={<FaUserTie />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="prof" label="Enseignant" icon={<FaChalkboardTeacher />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="parent" label="Parents & Élèves" icon={<FaUsers />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="support" label="FAQ & Support" icon={<FaLifeRing />} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* CONTENU */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#444' }}>
            
            {activeTab === UserRole.SUPER_ADMIN && (
                <section>
                    <h2 style={titleStyle}>👑 Guide Super Admin (Propriétaire)</h2>
                    <p><em>Réservé au gestionnaire technique de la plateforme.</em></p>
                    
                    <h3>A. Créer une nouvelle école (Onboarding)</h3>
                    <p>Depuis le tableau de bord <strong>Platform</strong> :</p>
                    <ol>
                        <li>Cliquez sur le bouton vert <strong>"Nouveau Client"</strong>.</li>
                        <li>Renseignez le nom de l'école et le nom du directeur.</li>
                        <li>Validez. Une fenêtre s'ouvrira avec l'Email (<code>nom.prenom@scolia.ci</code>) et le Mot de passe.</li>
                        <li><strong>Important :</strong> Copiez ces accès immédiatement pour les transmettre au client.</li>
                    </ol>

                    <h3>B. Gérer les Options (Feature Flipping)</h3>
                    <p>Activez ou désactivez les modules payants via les interrupteurs :</p>
                    <ul>
                        <li>💳 <strong>Cartes :</strong> Module de génération des cartes scolaires.</li>
                        <li>🤖 <strong>IA :</strong> Générateur d'emploi du temps automatique.</li>
                        <li>🚨 <strong>Radar :</strong> Analyse prédictive des risques.</li>
                        <li>📱 <strong>SMS :</strong> Envoi de notifications SMS.</li>
                    </ul>

                    <h3>C. Suspendre un mauvais payeur</h3>
                    <p>Cliquez sur le bouton rouge <strong>"Couper"</strong> pour bloquer l'accès instantanément.</p>
                </section>
            )}

            {activeTab === UserRole.ADMIN && (
                <section>
                    <h2 style={titleStyle}>🎓 Guide Directeur (Admin École)</h2>
                    
                    <h3>A. Configuration Initiale</h3>
                    <p>Lors de votre première connexion :</p>
                    <ol>
                        <li>Allez dans l'onglet <strong>"Paramètres École"</strong>.</li>
                        <li>Ajoutez le Logo de votre école et une description.</li>
                        <li>Allez ensuite dans <strong>"Gestion des Classes"</strong> pour créer la structure (6ème A, 5ème B...). <em>Sans classe, impossible d'inscrire des élèves.</em></li>
                    </ol>

                    <h3>B. Inscrire des Élèves</h3>
                    <ul>
                        <li><strong>Méthode 1 (Unitaire) :</strong> Bouton "+ Nouveau", choisissez le rôle "Élève", sa classe et son parent.</li>
                        <li><strong>Méthode 2 (Masse) :</strong> Utilisez le bouton <strong>"Importer CSV"</strong> avec le modèle Excel fourni. <em>Attention : Le nom de la classe dans le fichier doit correspondre exactement à une classe créée.</em></li>
                    </ul>

                    <h3>C. Gestion Financière</h3>
                    <p>Pour définir la scolarité d'un élève, cliquez sur son nom dans la liste. Dans la section "Configuration Scolarité", définissez le montant dû.</p>

                    <h3>D. Mot de passe oublié (Parent/Prof)</h3>
                    <p>Si un utilisateur perd son accès :</p>
                    <ol>
                        <li>Trouvez-le dans votre liste.</li>
                        <li>Cliquez sur le <strong>cadenas jaune</strong> 🔓 à droite.</li>
                        <li>Le système vous donnera un code temporaire (ex: <code>x8k2m</code>) à transmettre.</li>
                    </ol>
                </section>
            )}

            {activeTab === 'prof' && (
                <section>
                    <h2 style={titleStyle}>👨‍🏫 Guide Enseignant</h2>
                    
                    <h3>1. Faire l'Appel (Quotidien)</h3>
                    <p>Cliquez sur l'onglet <strong>"Faire l'Appel"</strong>, choisissez votre classe, cochez les absents et validez. Les parents reçoivent une notification instantanée.</p>

                    <h3>2. Saisir des Notes</h3>
                    <ol>
                        <li>Onglet <strong>"Saisir des Notes"</strong>.</li>
                        <li>Choisissez la Classe, la Matière et le titre du devoir.</li>
                        <li>Notez les élèves sur 20 et validez. La moyenne est recalculée automatiquement.</li>
                    </ol>

                    <h3>3. Déclarer une absence</h3>
                    <p>Utilisez le bouton rouge <strong>"Déclarer Absence"</strong>. Le directeur sera prévenu immédiatement pour organiser votre remplacement.</p>
                </section>
            )}

            {activeTab === UserRole.PARENT && (
                <section>
                    <h2 style={titleStyle}>👪 Guide Parent & Élève</h2>
                    
                    <h3>1. Suivi Scolaire</h3>
                    <p>Sur votre tableau de bord, cliquez sur le prénom de votre enfant pour voir :</p>
                    <ul>
                        <li>Ses dernières notes en temps réel.</li>
                        <li>Ses absences et retards.</li>
                        <li>Son bulletin (téléchargeable en PDF).</li>
                    </ul>

                    <h3>2. Paiement de la Scolarité</h3>
                    <p>Si vous payez par Mobile Money sur le numéro de l'école :</p>
                    <ol>
                        <li>Effectuez votre transfert.</li>
                        <li>Notez l'ID de Transaction reçu par SMS.</li>
                        <li>Dans Scolia, entrez le montant et cet ID, puis cliquez sur "Soumettre".</li>
                    </ol>
                    <p>L'école validera votre paiement et votre solde sera mis à jour.</p>
                </section>
            )}

            {activeTab === 'support' && (
                <section>
                    <h2 style={titleStyle}>🆘 FAQ & Support</h2>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <strong>🔒 Pourquoi certains boutons ont un cadenas ?</strong><br/>
                        Cela signifie que votre école n'a pas souscrit à cette option (ex: Radar de Risque). Contactez le service commercial Scolia pour l'activer.
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>🔎 Je ne vois pas ma classe dans la liste.</strong><br/>
                        Demandez au Directeur de créer la classe dans les paramètres <em>avant</em> d'essayer d'y ajouter des élèves.
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>📄 L'import CSV ne marche pas.</strong><br/>
                        Vérifiez que votre fichier est bien au format <strong>CSV (Séparateur virgule)</strong> et encodé en <strong>UTF-8</strong> pour les accents.
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
