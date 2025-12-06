import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { FaUserGraduate, FaMoneyBillWave, FaRobot, FaChartLine, FaCheck, FaArrowRight } from 'react-icons/fa';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: '#333', backgroundColor: '#F8FAFC' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '20px 5%', backgroundColor: 'white', borderBottom: '1px solid #eee',
          position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo width={40} height={40} showText={true} />
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Liens de navigation (cachés sur mobile pour simplifier) */}
            <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '25px', marginRight: '20px', fontSize: '0.95rem', fontWeight: '500', color: '#475569' }}>
                <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>Fonctionnalités</a>
                <a href="#about" style={{ textDecoration: 'none', color: 'inherit' }}>À propos</a>
                <a href="mailto:contact@scolia.ci" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a>
            </div>

            <button 
                onClick={() => navigate('/login')}
                style={{ 
                    padding: '10px 24px', backgroundColor: '#0A2240', color: 'white', 
                    border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer',
                    transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(10, 34, 64, 0.2)'
                }}
            >
                Se connecter
            </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
          background: 'linear-gradient(135deg, #0A2240 0%, #001f3f 100%)', 
          color: 'white', padding: '80px 5%', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '40px', minHeight: '80vh'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
            <span style={{ 
                backgroundColor: 'rgba(247, 127, 0, 0.2)', color: '#F77F00', 
                padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem',
                border: '1px solid #F77F00'
            }}>
                🚀 La plateforme n°1 en Côte d'Ivoire
            </span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginTop: '20px', marginBottom: '20px' }}>
                L'école de demain,<br/> <span style={{ color: '#F77F00' }}>aujourd'hui.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6', maxWidth: '600px', marginBottom: '40px' }}>
                Simplifiez la gestion scolaire, sécurisez les paiements par Mobile Money et boostez la réussite des élèves grâce à notre intelligence artificielle.
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                    onClick={() => navigate('/login')}
                    style={{ 
                        padding: '16px 32px', backgroundColor: '#F77F00', color: 'white', 
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    Accéder à mon espace <FaArrowRight />
                </button>
                <button style={{ 
                        padding: '16px 32px', backgroundColor: 'transparent', color: 'white', 
                        border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                    }}>
                    Découvrir la démo
                </button>
            </div>
        </div>

        {/* Image d'illustration (Placeholder) */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <img 
                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop" 
                alt="Étudiants connectés" 
                style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)' }}
            />
        </div>
      </header>

      {/* --- STATS --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '40px 5%', backgroundColor: 'white', borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
          <Stat number="50+" label="Établissements" />
          <Stat number="12,000" label="Élèves gérés" />
          <Stat number="98%" label="Taux de satisfaction" />
          <Stat number="24/7" label="Support disponible" />
      </div>

      {/* --- FEATURES GRID --- */}
      <section id="features" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ color: '#0A2240', fontSize: '2.5rem', margin: 0 }}>Tout pour gérer votre école</h2>
              <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '10px' }}>Une suite d'outils puissants, centralisés en un seul endroit.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <FeatureCard 
                  icon={<FaMoneyBillWave size={30} color="#008F39" />}
                  title="Paiements Mobile Money"
                  desc="Fini la queue à l'intendance. Les parents paient via Orange, MTN ou Moov et le solde se met à jour instantanément."
              />
              <FeatureCard 
                  icon={<FaRobot size={30} color="#9C27B0" />}
                  title="Intelligence Artificielle"
                  desc="Générez des emplois du temps sans conflit en quelques secondes grâce à notre moteur IA Gemini intégré."
              />
              <FeatureCard 
                  icon={<FaChartLine size={30} color="#F77F00" />}
                  title="Radar de Risque"
                  desc="Détectez automatiquement les élèves en difficulté scolaire ou financière avant qu'il ne soit trop tard."
              />
              <FeatureCard 
                  icon={<FaUserGraduate size={30} color="#0A2240" />}
                  title="Vie Scolaire Numérique"
                  desc="Notes, Bulletins, Absences et Cartes scolaires numériques accessibles aux parents en temps réel."
              />
          </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section style={{ backgroundColor: '#0A2240', padding: '80px 20px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Prêt à moderniser votre établissement ?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
              Rejoignez les écoles innovantes de Côte d'Ivoire qui font confiance à Scolia.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
                padding: '18px 40px', backgroundColor: '#F77F00', color: 'white', 
                border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(247, 127, 0, 0.3)'
            }}
          >
              Commencer maintenant
          </button>
      </section>

      <Footer />
    </div>
  );
};

// Petits composants locaux pour la propreté
const Stat = ({ number, label }: { number: string, label: string }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0A2240' }}>{number}</div>
        <div style={{ color: '#666', fontWeight: '500' }}>{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s', border: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.3rem', color: '#0A2240', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>{desc}</p>
    </div>
);
