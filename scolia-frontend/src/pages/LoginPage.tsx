import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
// Import des icônes pour améliorer l'UX
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast'; // <--- NOUVEL IMPORT DE TOAST

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null); // Pour l'effet de focus

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && userRole) {
        navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 1. Démarrer le toast de chargement
    const loadingToastId = toast.loading("Tentative de connexion...");

    try {
      await login(email, password);
      
      // En cas de succès, le useEffect gère la redirection, mais on confirme via toast
      toast.success("Connexion réussie ! Redirection en cours...", { id: loadingToastId });

    } catch (err) {
      // 2. Arrêter le chargement et afficher un toast d'erreur
      toast.error("Identifiants incorrects. Veuillez vérifier vos accès.", { id: loadingToastId });
      
      // 3. Maintenir la bannière d'erreur dans le formulaire pour une haute visibilité
      setError("Identifiants incorrects. Veuillez vérifier vos accès.");
    }
  };

  if (isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
             <div className="animate-pulse"><Logo width={80} height={80} showText={false} /></div>
             <h2 style={{ color: '#0A2240', marginTop: '20px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Connexion en cours...</h2>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* --- PARTIE GAUCHE : VISUEL (Caché sur mobile) --- */}
      <div style={{ 
          flex: 1.2, // Légèrement plus large pour l'impact visuel
          backgroundColor: '#0A2240', // Fallback couleur bleu scolia si l'image ne charge pas
          backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          position: 'relative',
          display: window.innerWidth < 900 ? 'none' : 'block' 
      }}>
          {/* Overlay avec dégradé subtil pour plus de profondeur */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(10, 34, 64, 0.9) 0%, rgba(10, 34, 64, 0.75) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', color: 'white' }}>
              <div style={{ marginBottom: 'auto' }}>
                  <Logo width={40} height={40} showText={true} textColor="white" />
              </div>
              
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '25px', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                  L'éducation <br/> <span style={{ color: '#F77F00' }}>réinventée.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.85, maxWidth: '550px', lineHeight: '1.6', fontWeight: 300 }}>
                  Accédez à votre tableau de bord unifié pour gérer la vie scolaire, suivre les résultats et simplifier la communication.
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '15px', alignItems: 'center', opacity: 0.7, fontSize: '0.9rem' }}>
                   <span>Fiable</span> • <span>Sécurisé</span> • <span>Intuitif</span>
              </div>
          </div>
      </div>

      {/* --- PARTIE DROITE : FORMULAIRE --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '40px' }}>
        
        <div style={{ width: '100%', maxWidth: '440px' }}>
            
            {/* En-tête Formulaire */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#0F172A', fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.03em' }}>Espace Scolia</h2>
                <p style={{ color: '#64748B', fontSize: '1.05rem' }}>Veuillez entrer vos coordonnées pour continuer.</p>
            </div>

            {/* Message d'erreur stylisé */}
            {error && (
                <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '16px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', borderLeft: '4px solid #EF4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>!</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Champ Email */}
                <div>
                    <label style={labelStyle}>Adresse Email professionnelle</label>
                    <div style={{
                        ...inputWrapperStyle,
                        borderColor: focusedInput === 'email' ? '#0A2240' : '#E2E8F0',
                        boxShadow: focusedInput === 'email' ? '0 0 0 4px rgba(10, 34, 64, 0.05)' : 'none'
                    }}>
                        <FaEnvelope style={{ ...iconStyle, color: focusedInput === 'email' ? '#0A2240' : '#94A3B8' }} />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            required 
                            placeholder="nom@ecole.ci"
                            style={inputStyle} 
                        />
                    </div>
                </div>

                {/* Champ Mot de passe */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <label style={labelStyle}>Mot de passe</label>
                        <a href="mailto:contact@scolia.ci?subject=Mot%20de%20passe%20oublié" style={{ fontSize: '0.85rem', color: '#F77F00', textDecoration: 'none', fontWeight: '600' }}>Mot de passe oublié ?</a>
                    </div>
                    <div style={{
                        ...inputWrapperStyle,
                        borderColor: focusedInput === 'password' ? '#0A2240' : '#E2E8F0',
                        boxShadow: focusedInput === 'password' ? '0 0 0 4px rgba(10, 34, 64, 0.05)' : 'none'
                    }}>
                        <FaLock style={{ ...iconStyle, color: focusedInput === 'password' ? '#0A2240' : '#94A3B8' }} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)} 
                            required 
                            placeholder="Votre mot de passe"
                            style={inputStyle} 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 15px', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#334155'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Bouton Connexion */}
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    style={buttonStyle(isLoading)}
                    onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {isLoading ? 'Connexion en cours...' : <>Se connecter <FaArrowRight /></>}
                </button>
            </form>

            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #F1F5F9', textAlign: 'center', fontSize: '0.9rem', color: '#94A3B8' }}>
                Vous n'avez pas de compte ? <a href="mailto:contact@scolia.ci" style={{ color: '#0A2240', textDecoration: 'none', fontWeight: '600' }}>Contactez l'administration</a>
                <br/><br/>
                Besoin d'aide technique ? <a href="mailto:contact@scolia.ci" style={{ color: '#64748B', textDecoration: 'underline' }}>support@scolia.ci</a>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES CSS-IN-JS AMÉLIORÉS ---

const labelStyle: React.CSSProperties = {
    display: 'block', 
    fontWeight: '600', 
    color: '#334155', 
    fontSize: '0.9rem',
    letterSpacing: '0.01em'
};

const inputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #E2E8F0', // Bordure un peu plus épaisse
    borderRadius: '12px', // Coins plus arrondis
    backgroundColor: '#FFFFFF',
    transition: 'all 0.2s ease-in-out',
    height: '56px' // Hauteur fixe pour une meilleure ergonomie tactile
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    padding: '0 16px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    color: '#1E293B',
    outline: 'none',
    fontWeight: '500'
};

const iconStyle: React.CSSProperties = {
    marginLeft: '20px',
    fontSize: '1.1rem',
    transition: 'color 0.2s'
};

const buttonStyle = (isLoading: boolean): React.CSSProperties => ({
    marginTop: '10px',
    width: '100%', 
    height: '56px',
    backgroundColor: '#F77F00', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: '700', 
    fontSize: '1.05rem', 
    cursor: isLoading ? 'not-allowed' : 'pointer', 
    opacity: isLoading ? 0.7 : 1, 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 15px -3px rgba(247, 127, 0, 0.3), 0 4px 6px -2px rgba(247, 127, 0, 0.15)',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: '12px'
});

export default LoginPage;
