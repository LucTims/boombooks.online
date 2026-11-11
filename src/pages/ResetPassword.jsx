import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import './Login.css';

// L'e-mail « mot de passe oublié » pointe ici avec ?token_hash=…&type=recovery.
// verifyOtp ouvre la session sans dépendre du navigateur qui a fait la demande
// (contrairement au flux PKCE ?code=…, qui échoue si l'e-mail est ouvert ailleurs).
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const tokenHash = searchParams.get('token_hash');

    const [verifying, setVerifying] = useState(!!tokenHash);
    const [linkError, setLinkError] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const verifiedRef = useRef(false);

    // Une redirection post-connexion restée en mémoire (connexion Google abandonnée,
    // ancien passage au checkout…) ne doit pas s'appliquer après le changement de mot de passe.
    useEffect(() => {
        try { localStorage.removeItem('auth_redirect'); } catch { /* stockage indisponible */ }
    }, []);

    useEffect(() => {
        if (!tokenHash || verifiedRef.current) return;
        verifiedRef.current = true;
        supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error: err }) => {
            window.history.replaceState(null, '', '/reset-password');
            if (err) setLinkError('Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.');
            setVerifying(false);
        });
    }, [tokenHash]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
        if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
        setSaving(true);
        const { error: err } = await supabase.auth.updateUser({ password });
        setSaving(false);
        if (err) {
            setError(err.code === 'same_password'
                ? 'Choisissez un mot de passe différent de l\'ancien.'
                : err.message);
            return;
        }
        setDone(true);
        setTimeout(() => navigate('/account?tab=library', { replace: true }), 1500);
    };

    let body;
    if (verifying || (authLoading && !linkError)) {
        body = <p style={{ textAlign: 'center', color: '#6b7280' }}>Vérification du lien…</p>;
    } else if (done) {
        body = (
            <div style={{ background: 'rgba(22,163,74,0.1)', color: '#166534', padding: 16, borderRadius: 12, fontSize: 14, textAlign: 'center' }}>
                Mot de passe modifié ! Redirection vers votre bibliothèque…
            </div>
        );
    } else if (linkError || !user) {
        body = (
            <div style={{ textAlign: 'center' }}>
                <div className="error-banner">{linkError || 'Lien invalide. Demandez un nouveau lien de réinitialisation.'}</div>
                <Link to="/forgot-password" className="btn-login" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Recevoir un nouveau lien
                </Link>
            </div>
        );
    } else {
        body = (
            <>
                <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
                    Compte : <strong style={{ color: '#0B0F14' }}>{user.email}</strong>
                </p>
                {error && <div className="error-banner">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <div className="login-input-wrap">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Nouveau mot de passe (6+ caractères)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="login-input"
                                style={{ paddingRight: '48px' }}
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="pwd-toggle" aria-label="Afficher le mot de passe">
                                <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>
                    <div className="login-field" style={{ marginBottom: 24 }}>
                        <div className="login-input-wrap">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Confirmer le mot de passe"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="login-input"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-login">
                        {saving ? 'Enregistrement…' : 'Enregistrer mon nouveau mot de passe'}
                    </button>
                </form>
            </>
        );
    }

    return (
        <main className="login-page">
            <div className="login-left">
                <div className="login-left-overlay" />
            </div>
            <div className="login-right">
                <div className="login-form-container">
                    <div className="login-logo">
                        <Link to={user ? '/account' : '/'} className="login-logo-text" style={{ textDecoration: 'none' }}>
                            <span className="login-logo-name">BoomBooks</span>
                            <span className="login-logo-tagline">l'antidote de l'ignorance</span>
                        </Link>
                    </div>
                    <h1 className="login-title">Nouveau mot de passe</h1>
                    {body}
                </div>
            </div>
        </main>
    );
}
