import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { consumePostAuthRedirect, peekPostAuthRedirect } from '../lib/authRedirect';
import { readPendingPggiTest } from '../lib/pggiTest';
import './Login.css';

export default function Login() {
    const location = useLocation();
    const [email, setEmail] = useState(() => location.state?.prefillEmail || '');
    const hasPendingPggi = Boolean(location.state?.pendingPggi || readPendingPggiTest());
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const [error, setError] = useState(location.state?.oauthError || '');
    const [loading, setLoading] = useState(false);
    const { signIn, user } = useAuth();
    const navigate = useNavigate();
    const [showBanner, setShowBanner] = useState(true);

    const showCheckoutInfo = location.state?.from === '/checkout' || localStorage.getItem('auth_redirect') === '/checkout';

    useEffect(() => {
        if (user) {
            let redirectUrl = consumePostAuthRedirect(location.state?.from);
            try {
                const savedCart = localStorage.getItem('bb_cart');
                const cart = savedCart ? JSON.parse(savedCart) : [];
                if (redirectUrl === '/checkout' && cart.length === 0) redirectUrl = '/account';
            } catch (e) {}
            localStorage.removeItem('auth_redirect');
            navigate(redirectUrl, { replace: true });
        }
    }, [user, navigate, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            let redirectUrl = consumePostAuthRedirect(location.state?.from);
            try {
                const savedCart = localStorage.getItem('bb_cart');
                const cart = savedCart ? JSON.parse(savedCart) : [];
                if (redirectUrl === '/checkout' && cart.length === 0) redirectUrl = '/account';
            } catch (e) {}
            localStorage.removeItem('auth_redirect');
            navigate(redirectUrl, { replace: true });
        }
    };

    return (
        <main className="login-page">
            {/* Colonne Gauche - Image Lifestyle */}
            <div className="login-left">
                <div className="login-left-overlay">
                    <div className="login-reviews">
                        <div className="stars">
                            <span className="material-symbols-outlined">star</span>
                            <span className="material-symbols-outlined">star</span>
                            <span className="material-symbols-outlined">star</span>
                            <span className="material-symbols-outlined">star</span>
                            <span className="material-symbols-outlined">star</span>
                        </div>
                        <div className="review-text">
                            Excellent | +30 avis positifs sur <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">notre page Facebook</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colonne Droite - Formulaire */}
            <div className="login-right">
                <div className="login-form-container">
                    
                    <div className="login-logo">
                        <Link to={user ? '/account' : '/'} className="login-logo-text" style={{ textDecoration: 'none' }}>
                            <span className="login-logo-name">BoomBooks</span>
                            <span className="login-logo-tagline">l'antidote de l'ignorance</span>
                        </Link>
                    </div>

                    <h1 className="login-title">Ravis de vous revoir !</h1>

                    {hasPendingPggi && (
                        <div style={{ background: '#EDF4FF', border: '1px solid #C6DCFD', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#0B0F14', marginBottom: 14, fontWeight: 500 }}>
                            Connectez-vous pour enregistrer votre diagnostic PGGI dans votre compte.
                        </div>
                    )}
                    {!hasPendingPggi && location.state?.prefillEmail && (
                        <div style={{ background: '#EDF4FF', border: '1px solid #C6DCFD', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#0B0F14', marginBottom: 14, fontWeight: 500 }}>
                            Connectez-vous avec cet e-mail pour retrouver votre livre dans votre bibliothèque.
                        </div>
                    )}

                    {error && <div className="error-banner">{error}</div>}

                    <GoogleSignInButton mode="signin" returnTo={peekPostAuthRedirect(location.state?.from)} onError={setError} />

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <div className="login-input-wrap">
                                <input 
                                    type="email" 
                                    placeholder="E-mail" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="login-input" 
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <div className="login-input-wrap">
                                <input 
                                    type={showPwd ? 'text' : 'password'} 
                                    placeholder="Mot de passe" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    className="login-input" 
                                    style={{ paddingRight: '48px' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPwd(!showPwd)} 
                                    className="pwd-toggle"
                                    aria-label="Toggle password visibility"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPwd ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-login">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <Link to="/forgot-password" className="login-forgot">
                        Mot de passe oublié ?
                    </Link>

                    <div className="login-register">
                        Pas encore de compte ? <Link to="/register" state={{ from: peekPostAuthRedirect(location.state?.from), showCheckoutInfo, prefillEmail: email || location.state?.prefillEmail, pendingPggi: hasPendingPggi }}>Créer mon compte</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
