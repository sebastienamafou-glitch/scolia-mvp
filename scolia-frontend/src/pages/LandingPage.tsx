// scolia-frontend/src/pages/LandingPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRobot, FaMobileAlt, FaChartLine, FaCheckCircle, 
  FaUserGraduate, FaSchool, FaChalkboardTeacher, FaBars, FaTimes 
} from 'react-icons/fa';
import { Logo } from '../components/Logo';
import waciLogo from '../assets/webappci-logo.png'; 

// IMPORTANT : On importe le CSS ici
import './LandingPage.css';

// --- INTERFACES ---
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  points: string[];
}

interface StatProps {
  number: string;
  label: string;
}

const LandingPage: React.FC = () => {
  // Plus besoin de "isMobile", le CSS gère l'affichage responsive
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-container">
      
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <Logo width={40} height={40} showText={true} />

        {/* Menu Desktop (géré via CSS .nav-desktop) */}
        <div className="nav-desktop">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#roles" className="nav-link">Pour qui ?</a>
            <Link to="/login" className="nav-login">Connexion</Link>
            <Link to="/login" className="btn btn-primary">Essai Gratuit</Link>
        </div>

        {/* Bouton Burger (visible uniquement sur mobile via CSS) */}
        <button 
          className="btn btn-burger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu Mobile Déroulant */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="nav-link">Fonctionnalités</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="nav-link">Pour qui ?</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="nav-login">Connexion</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">Essai Gratuit</Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero-header">
        <div className="hero-content">
            <span className="hero-badge">
                🚀 La Révolution Scolaire est là
            </span>
            <h1 className="hero-title">
                L'Éducation Réinventée par <br/><span>l'Intelligence Artificielle.</span>
            </h1>
            <p className="hero-desc">
                Scolia est la plateforme tout-en-un qui automatise la gestion administrative, sécurise les paiements via Mobile Money et détecte le décrochage scolaire avant qu'il ne soit trop tard.
            </p>
            <div className="hero-buttons">
                <Link to="/login" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                    Commencer maintenant
                </Link>
                <a href="#demo" className="btn btn-secondary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                    Voir la démo
                </a>
            </div>
            <div className="hero-trust">
                <span><FaCheckCircle style={{ marginRight: '5px', color: '#F77F00' }}/> Pas de carte bancaire requise</span>
                <span className="bullet-separator">•</span>
                <span><FaCheckCircle style={{ marginRight: '5px', color: '#F77F00' }}/> Installation en 5 minutes</span>
            </div>
        </div>
      </header>

      {/* --- STATS --- */}
      <div className="stats-section">
          <Stat number="150+" label="Établissements" />
          <Stat number="50k+" label="Élèves suivis" />
          <Stat number="98%" label="Taux de recouvrement" />
      </div>

      {/* --- FONCTIONNALITÉS --- */}
      <section id="features" className="section-padding section-container">
          <div className="section-header">
              <h2 className="section-title">Pourquoi choisir Scolia ?</h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Des outils puissants conçus spécifiquement pour le contexte éducatif africain.</p>
          </div>

          <div className="grid-3">
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
      <section id="roles" className="section-padding roles-bg">
          <div className="section-container">
              <h2 className="section-title" style={{color: 'white', textAlign: 'center'}}>Une solution, plusieurs perspectives</h2>
              <br/>
              <div className="grid-3">
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
      <section className="section-padding" style={{ textAlign: 'center', backgroundColor: 'white' }}>
          <h2 className="section-title">Prêt à moderniser votre école ?</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Rejoignez les établissements qui ont choisi l'excellence et la simplicité.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(247, 127, 0, 0.3)' }}>
              Créer mon espace école
          </Link>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer">
          <Logo width={30} height={30} showText={true} />
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Scolia. Tous droits réservés.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>Scolia développé par</span>
                  <img src={waciLogo} alt="Logo WebAppCi" style={{ height: '24px', width: 'auto', verticalAlign: 'middle' }} />
                  <span style={{ fontWeight: '700', color: '#0A2240' }}>WebAppCi</span>
              </div>
          </div>

          <div className="footer-links">
              <a href="#" className="footer-link">Mentions Légales</a>
              <a href="#" className="footer-link">Confidentialité</a>
              <a href="#" className="footer-link">Contact</a>
          </div>
      </footer>

    </div>
  );
};

// --- SOUS-COMPOSANTS ---

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, color, title, desc }) => (
    <div className="feature-card">
        <div className="feature-icon-box" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.3rem', color: '#0A2240', marginBottom: '15px' }}>{title}</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const RoleCard: React.FC<RoleCardProps> = ({ icon, title, points }) => (
    <div className="role-card">
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{title}</h3>
        <ul className="role-list">
            {points.map((p, i) => (
                <li key={i} className="role-item">
                    <FaCheckCircle color="#F77F00" size={14} /> {p}
                </li>
            ))}
        </ul>
    </div>
);

const Stat: React.FC<StatProps> = ({ number, label }) => (
    <div>
        <div className="stat-number">{number}</div>
        <div className="stat-label">{label}</div>
    </div>
);

export default LandingPage;
