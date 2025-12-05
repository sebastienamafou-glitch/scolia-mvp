import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaMobileAlt, FaChartLine, FaCheckCircle, FaUserGraduate, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';
import { Logo } from '../components/Logo'; // Assure-toi que le chemin est bon

// Styles CSS-in-JS (déplacés en dehors pour la clarté)
const navLinkStyle: React.CSSProperties = { 
    color: '#0A2240', 
    textDecoration: 'none', 
    fontWeight: '500', 
    transition: 'color 0.3s' 
};

const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: '#F77F00',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background 0.3s',
    display: 'inline-block'
};

const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: '2px solid rgba(255,255,255,0.5)',
    display: 'inline-block',
};

const FeatureCard = ({ icon, title, description }: any) => (
    <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <div style={{ color: '#0A2240', marginBottom: '15px' }}>{icon}</div>
        <h3 style={{ color: '#0A2240', fontSize: '1.2rem' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{description}</p>
    </div>
);

const SectionPoint = ({ points }: any) => (
    <div style={{ marginTop: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {points.map((p: string, i: number) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', opacity: 0.9 }}>
                    <FaCheckCircle color="#F77F00" size={14} /> {p}
                </li>
            ))}
        </ul>
    </div>
);

const Stat = ({ number, label }: any) => (
    <div>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0A2240' }}>{number}</div>
        <div style={{ color: '#666', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>{label}</div>
    </div>
);


const LandingPage: React.FC = () => {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: '#333', overflowX: 'hidden' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Logo width={40} height={40} showText={true} />
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#features" style={navLinkStyle}>Fonctionnalités</a>
            <a href="#roles" style={navLinkStyle}>Pour qui ?</a>
            {/* Les liens Link to="/login" sont corrects, ils s'appuient sur le router désormais fixé dans App.tsx */}
            <Link to="/login" style={{ textDecoration: 'none', color: '#0A2240', fontWeight: 'bold' }}>Connexion</Link>
            <Link to="/login" style={primaryButtonStyle}>Essai Gratuit</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
          backgroundColor: '#0A2240',
          color: 'white', 
          padding: '100px 5%', 
          textAlign: 'center',
          backgroundImage: 'radial-gradient(circle at 100% 0, rgba(255, 255, 255, 0.1) 0%, transparent 40%)'
      }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>
              La Gestion Scolaire Réinventée par l'IA
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px auto', opacity: 0.8 }}>
              Scolia utilise Gemini AI pour automatiser les tâches administratives, générer des emplois du temps et améliorer la communication.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <Link to="/login" style={primaryButtonStyle}>Commencer l'essai</Link>
              <a href="#features" style={secondaryButtonStyle}>Découvrir les fonctionnalités</a>
          </div>

          <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '50px' }}>
              <Stat number="99%" label="Fiabilité" />
              <Stat number="+50" label="Écoles adoptées" />
              <Stat number="1M+" label="Utilisateurs potentiels" />
          </div>
      </header>
      
      {/* --- FEATURES SECTION --- */}
      <section id="features" style={{ padding: '80px 5%', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#0A2240', marginBottom: '50px' }}>
              Pourquoi choisir Scolia ?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <FeatureCard 
                  icon={<FaRobot size={36} />} 
                  title="Génération IA Intelligente" 
                  description="Créez des emplois du temps complexes et des bulletins en un clic grâce à l'intelligence artificielle."
              />
              <FeatureCard 
                  icon={<FaChartLine size={36} />} 
                  title="Analyse de Performance" 
                  description="Suivez les progrès des élèves en temps réel avec des tableaux de bord et des graphiques précis."
              />
              <FeatureCard 
                  icon={<FaMobileAlt size={36} />} 
                  title="Accès Mobile Simplifié" 
                  description="Plateforme responsive accessible par les parents, élèves et enseignants depuis n'importe quel appareil."
              />
          </div>
      </section>

      {/* --- ROLES SECTION --- */}
      <section id="roles" style={{ padding: '80px 5%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#0A2240', marginBottom: '50px' }}>
            Un outil pour chaque acteur de l'école
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginTop: '40px' }}>
            
            <div style={{ border: '1px solid #eee', padding: '30px', borderRadius: '10px' }}>
                <FaUserGraduate size={30} color="#0A2240" />
                <h3 style={{ color: '#F77F00', marginTop: '15px' }}>Élèves & Parents</h3>
                <SectionPoint points={["Accès aux notes et bulletins", "Emploi du temps en direct", "Notifications d'absence"]} />
            </div>

            <div style={{ border: '1px solid #eee', padding: '30px', borderRadius: '10px' }}>
                <FaChalkboardTeacher size={30} color="#0A2240" />
                <h3 style={{ color: '#F77F00', marginTop: '15px' }}>Enseignants</h3>
                <SectionPoint points={["Saisie rapide des notes (Bulk)", "Génération de bulletins", "Communication simplifiée"]} />
            </div>

            <div style={{ border: '1px solid #eee', padding: '30px', borderRadius: '10px' }}>
                <FaSchool size={30} color="#0A2240" />
                <h3 style={{ color: '#F77F00', marginTop: '15px' }}>Administration</h3>
                <SectionPoint points={["Gestion des frais et paiements", "Importation de données", "Contrôle global des classes"]} />
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ backgroundColor: '#0A2240', color: 'white', padding: '40px 5%', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} Scolia. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
