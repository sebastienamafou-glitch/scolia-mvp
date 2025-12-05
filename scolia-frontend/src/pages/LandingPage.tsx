import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaMobileAlt, FaChartLine, FaCheckCircle, FaUserGraduate, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';
import { Logo } from '../components/Logo'; // Assurez-vous que le chemin est bon

// ✅ IMPORT DU LOGO (Assurez-vous d'avoir renommé et placé votre image dans src/assets/)
import waciLogo from '../assets/webappci-logo.png'; 

const LandingPage: React.FC = () => {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: '#333', overflowX: 'hidden' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Logo width={40} height={40} showText={true} />
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#features" style={navLinkStyle}>Fonctionnalités</a>
            <a href="#roles" style={navLinkStyle}>Pour qui ?</a>
            <Link to="/login" style={{ textDecoration: 'none', color: '#0A2240', fontWeight: 'bold' }}>Connexion</Link>
            <Link to="/login" style={primaryButtonStyle}>Essai Gratuit</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
          backgroundColor: '#0A2240', 
          color: 'white', 
          padding: '80px 5% 100px 5%', 
          textAlign: 'center',
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(247, 127, 0, 0.1) 0%, transparent 20%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ backgroundColor: 'rgba(247, 127, 0, 0.2)', color: '#F77F00', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
                🚀 La Révolution Scolaire est là
            </span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' }}>
                L'Éducation Réinventée par <br/><span style={{ color: '#F77F00' }}>l'Intelligence Artificielle.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px', lineHeight: '1.6' }}>
                Scolia est la plateforme tout-en-un qui automatise la gestion administrative, sécurise les paiements via Mobile Money et détecte le décrochage scolaire avant qu'il ne soit trop tard.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" style={{ ...primaryButtonStyle, padding: '15px 30px', fontSize: '1.1rem' }}>
                    Commencer maintenant
                </Link>
                <a href="#demo" style={{ ...secondaryButtonStyle, padding: '15px 30px', fontSize: '1.1rem' }}>
                    Voir la démo
                </a>
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>
                <FaCheckCircle style={{ marginRight: '5px', color: '#F77F00' }}/> Pas de carte bancaire requise
                <span style={{ margin: '0 10px' }}>•</span>
                <FaCheckCircle style={{ marginRight: '5px', color: '#F77F00' }}/> Installation en 5 minutes
            </p>
        </div>
      </header>

      {/* --- STATS / TRUST --- */}
      <div style={{ backgroundColor: '#F4F6F8', padding: '30px 5%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
          <Stat number="150+" label="Établissements" />
          <Stat number="50k+" label="Élèves suivis" />
          <Stat number="98%" label="Taux de recouvrement" />
      </div>

      {/* --- FONCTIONNALITÉS CLÉS --- */}
      <section id="features" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2.5rem', color: '#0A2240', marginBottom: '10px' }}>Pourquoi choisir Scolia ?</h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Des outils puissants conçus spécifiquement pour le contexte éducatif africain.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <FeatureCard 
                  icon={<FaMobileAlt size={30} color="white" />}
                  color="#008F39"
                  title="Paiements Mobile Money"
                  desc="Fini la queue à l'intendance. Les parents paient via Orange/MTN/Moov. Réconciliation automatique et suivi des impayés en temps réel."
              />
              <FeatureCard 
                  icon={<FaRobot size={30} color="white" />}
                  color="#673AB7"
                  title="Emploi du temps IA"
                  desc="Générez des plannings complexes sans conflit en quelques secondes grâce à notre moteur d'intelligence artificielle Gemini."
              />
              <FeatureCard 
                  icon={<FaChartLine size={30} color="white" />}
                  color="#D32F2F"
                  title="Radar de Risque"
                  desc="Notre algorithme analyse les notes et les paiements pour identifier les élèves en danger de décrochage. Agissez avant qu'il ne soit trop tard."
              />
          </div>
      </section>

      {/* --- POUR QUI ? --- */}
      <section id="roles" style={{ backgroundColor: '#0A2240', color: 'white', padding: '80px 5%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Une solution, plusieurs perspectives</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                  <RoleCard 
                      icon={<FaSchool size={40} color="#F77F00"/>}
                      title="Pour les Directeurs"
                      points={['Vue financière globale à 360°', 'Gestion RH et administrative', 'Pilotage par la donnée']}
                  />
                  <RoleCard 
                      icon={<FaChalkboardTeacher size={40} color="#F77F00"/>}
                      title="Pour les Enseignants"
                      points={['Saisie des notes ultra-rapide', 'Appel numérique en 1 clic', 'Génération automatique des bulletins']}
                  />
                  <RoleCard 
                      icon={<FaUserGraduate size={40} color="#F77F00"/>}
                      title="Pour les Parents & Élèves"
                      points={['Suivi des notes en temps réel', 'Notifications d\'absence instantanées', 'Paiement sécurisé à distance']}
                  />
              </div>
          </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section style={{ padding: '100px 5%', textAlign: 'center', backgroundColor: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#0A2240', marginBottom: '20px' }}>Prêt à moderniser votre école ?</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Rejoignez les établissements qui ont choisi l'excellence et la simplicité.
          </p>
          <Link to="/login" style={{ ...primaryButtonStyle, padding: '18px 40px', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(247, 127, 0, 0.3)' }}>
              Créer mon espace école
          </Link>
      </section>

      {/* --- FOOTER AVEC SIGNATURE WACI --- */}
      <footer style={{ backgroundColor: '#f8f9fa', padding: '40px 5%', borderTop: '1px solid #e0e0e0', textAlign: 'center', color: '#666' }}>
          <Logo width={30} height={30} showText={true} />
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Scolia. Tous droits réservés.</p>
              
              {/* ✅ SIGNATURE DÉVELOPPEUR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>Scolia développé par</span>
                  <img 
                    src={waciLogo} 
                    alt="Logo WebAppCi" 
                    style={{ height: '24px', width: 'auto', verticalAlign: 'middle' }} 
                  />
                  <span style={{ fontWeight: '700', color: '#0A2240' }}>WebAppCi</span>
              </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Mentions Légales</a>
              <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Confidentialité</a>
              <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Contact</a>
          </div>
      </footer>

    </div>
  );
};

// --- COMPOSANTS INTERNES ET STYLES ---

const FeatureCard = ({ icon, color, title, desc }: any) => (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.3rem', color: '#0A2240', marginBottom: '15px' }}>{title}</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const RoleCard = ({ icon, title, points }: any) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{title}</h3>
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

// Styles CSS-in-JS
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
    border: '2px solid rgba(255,255,255,0.3)',
    transition: 'background 0.3s',
    display: 'inline-block'
};

const navLinkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '500',
    display: window.innerWidth < 768 ? 'none' : 'block'
};

export default LandingPage;
