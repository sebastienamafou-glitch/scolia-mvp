import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
// Import des icônes pour améliorer l'UX
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Nouvel état pour l'œil

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && userRole) {
        navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError("Identifiants incorrects. Veuillez vérifier vos accès.");
    }
  };

  // Loader pendant la redirection
  if (isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
             <div className="animate-pulse"><Logo width={80} height={80} showText={false} /></div>
             <h2 style={{ color: '#0A2240', marginTop: '20px', fontFamily: 'Poppins, sans-serif' }}>Connexion en cours...</h2>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* --- PARTIE GAUCHE : VISUEL (Caché sur mobile) --- */}
      <div style={{ 
          flex: 1, 
          backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          position: 'relative',
          display: window.innerWidth < 900 ? 'none' : 'block' // Responsive simple
      }}>
          {/* Overlay Bleu Nuit avec transparence */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 34, 64, 0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
                  L'éducation <br/> connectée.
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '500px', lineHeight: '1.6' }}>
                  Simplifiez la gestion de votre établissement et rapprochez l'école des familles avec la plateforme Scolia.
              </p>
              <div style={{ marginTop: '40px', display: 'flex', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F77F00' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', opacity: 0.5 }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', opacity: 0.5 }}></div>
              </div>
          </div>
      </div>

      {/* --- PARTIE DROITE : FORMULAIRE --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: '40px' }}>
        
        <div style={{ width: '100%', maxWidth: '420px' }}>
            
            {/* En-tête Formulaire */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'inline-block', marginBottom: '10px' }}>
                    <Logo width={60} height={60} showText={false} />
                </div>
                <h2 style={{ margin: '10px 0', color: '#0A2240', fontSize: '2rem', fontWeight: 'bold' }}>Bienvenue</h2>
                <p style={{ color: '#666' }}>Connectez-vous à votre espace Scolia</p>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #FECACA', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Champ Email */}
                <div>
                    <label style={labelStyle}>Adresse Email</label>
                    <div style={inputWrapperStyle}>
                        <FaEnvelope style={iconStyle} />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            placeholder="exemple@ecole.ci"
                            style={inputStyle} 
                        />
                    </div>
                </div>

                {/* Champ Mot de passe avec œil */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={labelStyle}>Mot de passe</label>
                        <a href="#" style={{ fontSize: '0.85rem', color: '#F77F00', textDecoration: 'none', fontWeight: '500' }}>Oublié ?</a>
                    </div>
                    <div style={inputWrapperStyle}>
                        <FaLock style={iconStyle} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                            style={inputStyle} 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0 10px' }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Bouton Connexion */}
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    style={{ 
                        marginTop: '10px',
                        width: '100%', 
                        padding: '16px', 
                        backgroundColor: '#F77F00', // Orange Scolia
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        cursor: isLoading ? 'not-allowed' : 'pointer', 
                        opacity: isLoading ? 0.7 : 1, 
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(247, 127, 0, 0.3)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    {isLoading ? 'Connexion...' : <>Se connecter <FaArrowRight /></>}
                </button>
            </form>

            <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>
                © {new Date().getFullYear()} Scolia Éducation. Tous droits réservés.<br/>
                <a href="#" style={{ color: '#666', textDecoration: 'none', marginTop: '5px', display: 'inline-block' }}>Besoin d'aide ? Support</a>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES CSS-IN-JS ---

const labelStyle: React.CSSProperties = {
    display: 'block', 
    fontWeight: '600', 
    color: '#334155', 
    marginBottom: '0' // Géré par le flex parent
};

const inputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    transition: 'border-color 0.2s',
    overflow: 'hidden'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    color: '#333',
    outline: 'none'
};

const iconStyle: React.CSSProperties = {
    color: '#94A3B8',
    marginLeft: '15px'
};

export default LoginPage;
