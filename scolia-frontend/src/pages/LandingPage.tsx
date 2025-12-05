import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaMobileAlt, FaChartLine, FaCheckCircle, FaUserGraduate, FaSchool, FaChalkboardTeacher, FaLightbulb } from 'react-icons/fa';
import { Logo } from '../components/Logo'; // Assure-toi que le chemin est bon

// --- NOUVEAU COMPOSANT : Logo WebappCi ---
// NOTE: L'image que vous avez fournie (IMG_1383-removebg-preview(1).png) doit être accessible via un chemin.
// Pour cet exemple, j'utilise un chemin local/relatif. Assurez-vous que l'image est placée 
// dans le dossier 'public' ou 'assets' et que le chemin est correct.
const WebappCiLogo: React.FC<{ width?: number, height?: number }> = ({ width = 80, height = 24 }) => (
    <div style={{ display: 'inline-block', opacity: 0.7 }}>
        {/* REMPLACER CE CHEMIN PAR LE CHEMIN RÉEL VERS VOTRE IMAGE DANS LE PROJET */}
        <img 
            src="/images/webappci-logo.png" // <--- IMPORTANT : Mettre le chemin correct ici
            alt="Développé par WebappCi"
            style={{ 
                width: width, 
                height: 'auto', 
                objectFit: 'contain',
                // Styles subtils pour s'intégrer dans le footer sombre
                filter: 'grayscale(100%) brightness(150%)', 
                transition: 'filter 0.3s'
            }}
        />
    </div>
);

// --- STYLES CSS-in-JS (Conservés) ---
const colors = {
    blue: '#0A2240',
    orange: '#F77F00',
    lightGray: '#F4F6F8',
    darkText: '#333',
    lightText: 'white',
};

const navLinkStyle: React.CSSProperties = { 
    color: colors.blue, 
    textDecoration: 'none', 
    fontWeight: '600', 
    transition: 'color 0.3s' 
};

const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: colors.orange,
    color: colors.lightText,
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background 0.3s, transform 0.2s',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(247, 127, 0, 0.3)'
};

const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: colors.lightText,
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: `2px solid rgba(255,255,255,0.4)`,
    display: 'inline-block',
    transition: 'background 0.3s, border-color 0.3s',
};

// --- COMPOSANTS UTILITAIRES (Conservés) ---

const FeatureCard = ({ icon, title, description }: any) => (
    <div style={{ 
        padding: '30px', 
        backgroundColor: colors.lightText, 
        borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)', 
        textAlign: 'center',
        borderTop: `4px solid ${colors.orange}`,
        transition: 'transform 0.3s',
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ color: colors.blue, marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ color: colors.blue, fontSize: '1.4rem', fontWeight: '700' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '1rem', marginTop: '10px' }}>{description}</p>
    </div>
);

const SectionPoint = ({ points }: any) => (
    <div style={{ marginTop: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {points.map((p: string, i: number) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', opacity: 0.9 }}>
                    <FaCheckCircle color={colors.orange} size={16} style={{ marginTop: '4px', minWidth: '16px' }} /> <span>{p}</span>
                </li>
            ))}
        </ul>
    </div>
);

const Stat = ({ number, label }: any) => (
    <div style={{ borderLeft: `1px solid rgba(255, 255, 255, 0.3)`, paddingLeft: '30px' }}>
        <div style={{ fontSize: '3rem', fontWeight: '800', color: colors.lightText, lineHeight: 1.1 }}>{number}</div>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>{label}</div>
    </div>
);


// --- MAIN COMPONENT ---
const LandingPage: React.FC = () => {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: colors.darkText, overflowX: 'hidden', minHeight: '100vh', backgroundColor: colors.lightGray }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 5%', 
          backgroundColor: 'white', 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)' 
      }}>
        <Logo width={40} height={40} showText={true} />
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#features" style={navLinkStyle}>Fonctionnalités</a>
            <a href="#roles" style={navLinkStyle}>Pour qui ?</a>
            <a href="#pilot" style={navLinkStyle}>Offre Pilote</a> 
            <Link to="/login" style={{ textDecoration: 'none', color: colors.blue, fontWeight: 'bold' }}>Connexion</Link>
            <Link to="/login" style={primaryButtonStyle}>Essai Gratuit</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
          backgroundColor: colors.blue,
          color: colors.lightText, 
          padding: '120px 5% 100px 5%', 
          textAlign: 'center',
          backgroundImage: `linear-gradient(135deg, ${colors.blue} 0%, rgba(10, 34, 64, 0.8) 100%)`,
          position: 'relative',
          overflow: 'hidden'
      }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px', lineHeight: 1.1 }}>
              L'Éducation <span style={{ color: colors.orange }}>Connectée</span>, Simplifiée.
          </h1>
          <p style={{ fontSize: '1.4rem', maxWidth: '900px', margin: '0 auto 50px auto', opacity: 0.9, fontWeight: '300' }}>
              Scolia est la plateforme tout-en-un pour la gestion scolaire en Afrique de l'Ouest : IA, temps réel, et faible consommation de données.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <Link to="/login" style={primaryButtonStyle}>Commencer l'essai</Link>
              <a href="#features" style={secondaryButtonStyle}>Découvrir les avantages</a>
          </div>

          <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '50px', alignItems: 'center' }}>
              <Stat number="99%" label="Fiabilité (Local)" />
              <Stat number="+50" label="Écoles adoptées" />
              <Stat number="1M+" label="Utilisateurs potentiels" />
          </div>
      </header>
      
      {/* --- FEATURES SECTION (AVANTAGES) --- */}
      <section id="features" style={{ padding: '80px 5%', backgroundColor: colors.lightGray }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: colors.blue, marginBottom: '60px', fontWeight: '800' }}>
              Les Avantages Clés de Scolia
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <FeatureCard 
                  icon={<FaRobot size={36} color={colors.orange} />} 
                  title="Génération IA Intelligente" 
                  description="Créez des emplois du temps complexes et des bulletins en un clic grâce à l'intelligence artificielle Gemini."
              />
              <FeatureCard 
                  icon={<FaMobileAlt size={36} color={colors.blue} />} 
                  title="Mobile First & Bas Débit" 
                  description="Ultra-léger (PWA), s'installe sans Store. Fonctionne parfaitement même avec une faible connexion Internet (3G)."
              />
              <FeatureCard 
                  icon={<FaChartLine size={36} color="#008F39" />} 
                  title="Analyse de Performance" 
                  description="Suivez les progrès des élèves en temps réel avec des tableaux de bord précis et des rapports automatiques."
              />
          </div>
      </section>
      
      {/* --- PILOT OFFER SECTION --- */}
      <section id="pilot" style={{ padding: '80px 5%', backgroundColor: colors.blue, color: colors.lightText, textAlign: 'center', backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(247, 127, 0, 0.1) 0%, transparent 40%)' }}>
        <FaLightbulb size={40} color={colors.orange} style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px' }}>
            Devenez Établissement Pilote
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 40px auto', opacity: 0.9 }}>
            Nous sélectionnons 10 établissements pionniers à Abidjan pour une intégration et un accompagnement privilégiés.
        </p>
        <div style={{ display: 'inline-block', padding: '30px', border: `1px solid ${colors.orange}`, borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(5px)' }}>
            <h3 style={{ color: colors.orange, fontSize: '2rem', marginBottom: '15px' }}>
                -50% sur l'installation + 1 An OFFERT
            </h3>
            <a href="mailto:contact@scolia.ci?subject=Demande%20Offre%20Pilote%20Scolia" style={primaryButtonStyle}>
                Je postule maintenant !
            </a>
        </div>
      </section>


      {/* --- ROLES SECTION (POUR QUI ?) --- */}
      <section id="roles" style={{ padding: '80px 5%', backgroundColor: colors.lightText }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: colors.blue, marginBottom: '60px', fontWeight: '800' }}>
            Un outil pour chaque acteur de l'école
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            
            <div style={{ border: `1px solid ${colors.lightGray}`, padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <FaUserGraduate size={30} color={colors.blue} />
                <h3 style={{ color: colors.orange, marginTop: '15px', fontSize: '1.3rem', fontWeight: '700' }}>Élèves & Parents</h3>
                <SectionPoint points={["Accès aux notes et bulletins en temps réel", "Emploi du temps synchronisé", "Notifications d'absence instantanées", "Paiements de frais sécurisés"]} />
            </div>

            <div style={{ border: `1px solid ${colors.lightGray}`, padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <FaChalkboardTeacher size={30} color={colors.blue} />
                <h3 style={{ color: colors.orange, marginTop: '15px', fontSize: '1.3rem', fontWeight: '700' }}>Enseignants</h3>
                <SectionPoint points={["Saisie rapide des notes (Bulk Entry)", "Génération automatique de bulletins", "Faire l'appel en 30 secondes (Offline)", "Communication simplifiée avec les parents"]} />
            </div>

            <div style={{ border: `1px solid ${colors.lightGray}`, padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <FaSchool size={30} color={colors.blue} />
                <h3 style={{ color: colors.orange, marginTop: '15px', fontSize: '1.3rem', fontWeight: '700' }}>Administration</h3>
                <SectionPoint points={["Gestion complète des frais et paiements (Recouvrement)", "Importation/Exportation de données facile", "Contrôle global des classes et des utilisateurs", "Envoi de notifications Push à toute l'école"]} />
            </div>
        </div>
      </section>

      {/* --- FOOTER (AVEC LOGO WEBAPPCI) --- */}
      <footer style={{ backgroundColor: colors.blue, color: colors.lightText, padding: '40px 5%', textAlign: 'center' }}>
        <p style={{ opacity: 0.8, marginBottom: '10px' }}>&copy; {new Date().getFullYear()} Scolia. Tous droits réservés. | Abidjan, Côte d'Ivoire</p>
        <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px' 
        }}>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                Propulsé par 
            </p>
            <WebappCiLogo width={100} height={30} />
            <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>|</span>
            <a href="mailto:contact@scolia.ci" style={{ color: colors.lightText, opacity: 0.6, textDecoration: 'none', fontSize: '0.9rem' }}>Support</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
