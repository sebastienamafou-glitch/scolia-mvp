import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaMobileAlt, FaChartLine, FaCheckCircle, FaUserGraduate, FaSchool, FaChalkboardTeacher, FaDollarSign, FaEnvelope } from 'react-icons/fa';

// ✅ CORRECTION : L'importation du logo est maintenue
import LogoWebappCi from './pages/logowebbapci.png'; 

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

const secondaryLinkButtonStyle: React.CSSProperties = {
    color: '#0A2240',
    backgroundColor: '#EFEFEF', // Fond légèrement grisé
    padding: '8px 15px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background 0.3s',
    display: 'inline-block'
}

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

const PricingCard = ({ title, price, target, features, isFeatured }: any) => (
    <div style={{ 
        padding: '30px', 
        backgroundColor: isFeatured ? '#0A2240' : 'white', 
        color: isFeatured ? 'white' : '#333',
        borderRadius: '12px', 
        boxShadow: isFeatured ? '0 10px 20px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.05)', 
        border: isFeatured ? '3px solid #F77F00' : '1px solid #eee',
        textAlign: 'center',
        transform: isFeatured ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease-in-out'
    }}>
        <h3 style={{ fontSize: '1.8rem', color: isFeatured ? '#F77F00' : '#0A2240', marginBottom: '5px' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: isFeatured ? 'rgba(255,255,255,0.7)' : '#666', marginBottom: '20px' }}>{target}</p>
        
        <div style={{ margin: '30px 0' }}>
            <span style={{ fontSize: '3rem', fontWeight: '800' }}>{price}</span>
            <span style={{ fontSize: '1rem', opacity: 0.7 }}>/mois</span>
        </div>
        
        <p style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: isFeatured ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
            Fonctionnalités Incluses :
        </p>

        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', minHeight: '150px' }}>
            {features.map((f: string, i: number) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '0.9rem', opacity: isFeatured ? 0.9 : 1 }}>
                    <FaCheckCircle color={isFeatured ? '#F77F00' : '#0A2240'} size={14} style={{ flexShrink: 0, marginTop: '3px' }}/> {f}
                </li>
            ))}
        </ul>

        <Link to="/login" style={{
            ...primaryButtonStyle,
            backgroundColor: isFeatured ? '#F77F00' : '#0A2240',
            marginTop: '20px',
            width: '100%',
            textAlign: 'center'
        }}>
            Choisir cette offre
        </Link>
    </div>
);

// ✅ NOUVEAU COMPOSANT : Utilise directement la variable importée LogoWebappCi
const LogoDisplay = ({ width = 40, height = 40, showText = false, color = '#0A2240' }: { width?: number, height?: number, showText?: boolean, color?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
            src={LogoWebappCi} // Utilise la variable importée
            alt="WebappCi Logo" 
            style={{ width: width, height: height, objectFit: 'contain' }} 
        />
        
        {showText && (
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: color }}>Scolia</span>
        )}
    </div>
);


const LandingPage: React.FC = () => {
  // Données de la grille tarifaire (extraites du PDF)
  const pricingData = [
    {
      title: "STARTER",
      price: "30.000 FCFA",
      target: "Petits Collèges (<300 élèves)",
      features: [
        "Gestion des Notes, Bulletins PDF",
        "Paiements Cash/Mobile",
        "App Parents"
      ],
      isFeatured: false
    },
    {
      title: "PRO",
      price: "60.000 FCFA",
      target: "Collèges/Lycées (300-800)",
      features: [
        "Tout Starter",
        "Radar de Risque",
        "Cartes Scolaires",
        "Support WhatsApp"
      ],
      isFeatured: true
    },
    {
      title: "ELITE",
      price: "100.000 FCFA",
      target: "Groupes Scolaires (> 800)",
      features: [
        "Tout Pro",
        "IA Emploi du Temps",
        "Multi-sites",
        "Formation continue"
      ],
      isFeatured: false
    }
  ];

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: '#333', overflowX: 'hidden' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <LogoDisplay width={40} height={40} showText={true} />
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#features" style={navLinkStyle}>Fonctionnalités</a>
            <a href="#roles" style={navLinkStyle}>Pour qui ?</a>
            <a href="#pricing" style={navLinkStyle}>Tarifs</a>
            
            <Link to="/login" style={secondaryLinkButtonStyle}>Connexion</Link> 
            
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

      {/* --- GRILLE TARIFAIRE --- */}
      <section id="pricing" style={{ padding: '80px 5%', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#0A2240', marginBottom: '20px' }}>
              Une Offre Adaptée à Chaque Établissement
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', marginBottom: '60px' }}>
              Choisissez l'abonnement mensuel sans engagement qui correspond à la taille de votre école.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <FaDollarSign color="#0A2240" size={20} style={{ marginRight: '10px' }} />
                  <span style={{ fontWeight: 'bold', color: '#0A2240' }}>Ticket d'Entrée (Frais de Mise en Service) : </span>
                  <span style={{ color: '#F77F00', fontWeight: 'bold' }}>150.000 FCFA</span> (Paiement unique à la signature).
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0 0 0' }}>
                      Inclut la création de l'instance (Cloud), le paramétrage de l'école (Logo, Classes), l'import CSV et la formation de 2h.
                  </p>
              </div>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
              {pricingData.map((data) => (
                  <PricingCard key={data.title} {...data} />
              ))}
          </div>
          
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#999', marginTop: '40px' }}>
              * Les prix d'abonnement affichés sont mensuels. Une facturation trimestrielle ou annuelle est disponible avec remise.
          </p>

      </section>


      {/* --- FOOTER AVEC COLONNES ET ADRESSE SUPPORT --- */}
      <footer style={{ 
          backgroundColor: '#0A2240', 
          color: 'white', 
          padding: '60px 5% 20px 5%', 
      }}>
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr repeat(2, 1fr)', 
            gap: '50px', 
            maxWidth: '1200px', 
            margin: '0 auto',
            textAlign: 'left',
            paddingBottom: '30px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
            {/* Colonne 1 : Branding et Copyright */}
            <div>
                <LogoDisplay width={40} height={40} showText={true} color="white" />
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '15px' }}>
                    Solution Scolaire Propulsée par l'IA.
                </p>
                <p style={{ margin: '30px 0 0 0', fontSize: '0.8rem', opacity: 0.5 }}>
                    &copy; {new Date().getFullYear()} <span style={{ color: '#F77F00', fontWeight: 'bold' }}>WebappCi</span>. Tous droits réservés.
                </p>
            </div>
            
            {/* Colonne 2 : Produit/Tarifs */}
            <div>
                <h4 style={{ color: '#F77F00', fontSize: '1.1rem', marginBottom: '15px' }}>Produit</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '10px' }}><a href="#features" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Fonctionnalités</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="#pricing" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Grille Tarifaire</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/login" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Essai Gratuit</a></li>
                </ul>
            </div>

            {/* Colonne 3 : Contact & Légal */}
            <div>
                <h4 style={{ color: '#F77F00', fontSize: '1.1rem', marginBottom: '15px' }}>Contact & Légal</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaEnvelope size={14} color="#F77F00" style={{ flexShrink: 0 }} />
                        <a href="mailto:contact@scolia.ci" style={{ color: 'white', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }}>
                            contact@scolia.ci
                        </a>
                    </li>
                    <li style={{ marginBottom: '10px' }}><Link to="/privacy" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Politique de Confidentialité</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/terms" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Conditions Générales</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/help" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Centre d'aide</Link></li>
                </ul>
            </div>
        </div>

        {/* Section finale du copyright et WebappCi */}
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5 }}>
                Développé par WebappCi pour révolutionner l'éducation en Afrique de l'Ouest.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
