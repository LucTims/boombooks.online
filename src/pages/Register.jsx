import { useState, useEffect } from 'react';
import { consumePostAuthRedirect, peekPostAuthRedirect } from '../lib/authRedirect';
import { readPendingPggiTest } from '../lib/pggiTest';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import './Login.css';

const DISPOSABLE_DOMAINS = [
    'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'fakeinbox.com', 'trashmail.com', '10minutemail.com',
    'temp-mail.org', 'guerrillamail.info'
];

const TYPO_CORRECTIONS = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yhaoo.com': 'yahoo.com',
    'hotmal.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmails.com': 'hotmail.com',
    'outloo.com': 'outlook.com',
    'outlok.com': 'outlook.com'
};

export default function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signUp, user } = useAuth();
    const hasPendingPggi = Boolean(location.state?.pendingPggi || readPendingPggiTest());
    const [email, setEmail] = useState(() => location.state?.prefillEmail || '');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const [emailWarning, setEmailWarning] = useState('');
    const [emailSuggestionConfirmed, setEmailSuggestionConfirmed] = useState(false);

    const validateEmail = (rawEmail) => {
        const trimmed = rawEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(trimmed)) {
            return { valid: false, error: 'Veuillez entrer une adresse e-mail valide.' };
        }
        const domain = trimmed.split('@')[1].toLowerCase();
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            return { valid: false, error: 'Les adresses e-mail jetables ne sont pas autorisées. Veuillez utiliser une adresse permanente.' };
        }
        if (TYPO_CORRECTIONS[domain]) {
            const suggested = trimmed.split('@')[0] + '@' + TYPO_CORRECTIONS[domain];
            return { valid: true, suggestion: `Vouliez-vous dire ${suggested} ?` };
        }
        return { valid: true };
    };
    
    useEffect(() => {
        if (user) {
            navigate(consumePostAuthRedirect(location.state?.from), { replace: true });
        }
    }, [user, navigate, location.state]);



    const showCheckoutInfo = location.state?.showCheckoutInfo || localStorage.getItem('auth_redirect') === '/checkout';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validation = validateEmail(email);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }
        if (validation.suggestion && !emailSuggestionConfirmed) {
            setEmailWarning(validation.suggestion);
            return;
        }

        if (password !== confirm) { 
            setError('Les mots de passe ne correspondent pas.'); 
            return; 
        }
        if (password.length < 6) { 
            setError('Le mot de passe doit faire au moins 6 caractères.'); 
            return; 
        }
        
        setLoading(true);
        const { data, error } = await signUp(email.trim(), password);
        
        if (error) { 
            setError(error.message); 
            setLoading(false); 
        } else if (data?.session) {
            let redirectUrl = consumePostAuthRedirect(location.state?.from);
            try {
                const savedCart = localStorage.getItem('bb_cart');
                const cart = savedCart ? JSON.parse(savedCart) : [];
                if (redirectUrl === '/checkout' && cart.length === 0) redirectUrl = '/account';
            } catch (e) {}
            localStorage.removeItem('auth_redirect');
            navigate(redirectUrl);
        } else { 
            setLoading(false); 
            setSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'); 
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
                        <Link to={user ? '/account' : '/'} className="header-logo-text" style={{ textDecoration: 'none', alignItems: 'center' }}>
                            <span className="header-logo-name" style={{ fontSize: 28, color: 'var(--color-primary)' }}>BoomBooks</span>
                            <span className="header-logo-tagline" style={{ fontSize: 13, color: 'var(--color-danger)' }}>l'antidote de l'ignorance</span>
                        </Link>
                    </div>

                    <h1 className="login-title">Créez votre compte</h1>

                    {hasPendingPggi && (
                        <div style={{ background: '#EDF4FF', border: '1px solid #C6DCFD', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#0B0F14', marginBottom: 14, fontWeight: 500 }}>
                            Créez votre compte gratuit pour enregistrer votre diagnostic PGGI dans votre espace membre.
                        </div>
                    )}
                    {!hasPendingPggi && location.state?.prefillEmail && (
                        <div style={{ background: '#EDF4FF', border: '1px solid #C6DCFD', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#0B0F14', marginBottom: 14, fontWeight: 500 }}>
                            Créez votre compte avec cet e-mail pour retrouver votre livre dans votre bibliothèque.
                        </div>
                    )}

                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>
                                {success}
                            </div>
                            <Link to="/login" state={{ from: peekPostAuthRedirect(location.state?.from), prefillEmail: email || location.state?.prefillEmail, pendingPggi: hasPendingPggi }} className="btn-login" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Aller à la connexion
                            </Link>
                        </div>
                    ) : (
                        <>

                            {error && <div className="error-banner">{error}</div>}

                            <GoogleSignInButton mode="signup" returnTo={peekPostAuthRedirect(location.state?.from)} onError={setError} />

                            <form onSubmit={handleSubmit}>
                                <div className="login-field">
                                    <div className="login-input-wrap">
                                        <input 
                                            type="email" 
                                            placeholder="E-mail" 
                                            value={email} 
                                            onChange={e => { setEmail(e.target.value); setEmailWarning(''); setEmailSuggestionConfirmed(false); }} 
                                            required 
                                            className="login-input" 
                                        />
                                    </div>
                                </div>

                                {emailWarning && (
                                    <div style={{
                                        background: 'rgba(245,158,11,0.1)',
                                        border: '1px solid rgba(245,158,11,0.3)',
                                        borderRadius: '8px',
                                        padding: '10px 14px',
                                        fontSize: '13px',
                                        color: '#92400e',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '-4px'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>warning</span>
                                        <span>{emailWarning}</span>
                                        <button
                                            type="button"
                                            onClick={() => { setEmailSuggestionConfirmed(true); setEmailWarning(''); }}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'none',
                                                border: '1px solid rgba(245,158,11,0.4)',
                                                borderRadius: '6px',
                                                padding: '4px 10px',
                                                fontSize: '12px',
                                                color: '#92400e',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 500
                                            }}
                                        >
                                            Continuer quand même
                                        </button>
                                    </div>
                                )}

                                <div className="login-field">
                                    <div className="login-input-wrap">
                                        <input 
                                            type={showPwd ? 'text' : 'password'} 
                                            placeholder="Mot de passe (min 6 caractères)" 
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

                                <div className="login-field" style={{ marginBottom: '30px' }}>
                                    <div className="login-input-wrap">
                                        <input 
                                            type={showConfirm ? 'text' : 'password'} 
                                            placeholder="Confirmer le mot de passe" 
                                            value={confirm} 
                                            onChange={e => setConfirm(e.target.value)} 
                                            required 
                                            className="login-input" 
                                            style={{ paddingRight: '48px' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowConfirm(!showConfirm)} 
                                            className="pwd-toggle"
                                            aria-label="Toggle password visibility"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showConfirm ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="btn-login">
                                    {loading ? 'Création...' : 'Créer mon compte'}
                                </button>
                            </form>

                            <div className="login-register" style={{ marginTop: '30px' }}>
                                J&apos;ai déjà un compte <Link to="/login" state={{ from: peekPostAuthRedirect(location.state?.from), showCheckoutInfo, prefillEmail: email || location.state?.prefillEmail, pendingPggi: hasPendingPggi }}>Me connecter</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
