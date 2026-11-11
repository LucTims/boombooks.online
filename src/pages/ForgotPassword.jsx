import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import './Login.css';

export default function ForgotPassword() {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setLoading(false);
        if (err && err.status === 429) {
            setError('Trop de demandes. Patientez quelques minutes puis réessayez.');
            return;
        }
        if (err) {
            setError(err.message);
            return;
        }
        // Même message que l'adresse ait un compte ou non : on ne révèle pas qui est inscrit.
        setSent(true);
    };

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

                    <h1 className="login-title">Mot de passe oublié ?</h1>

                    {sent ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: 'rgba(22,163,74,0.1)', color: '#166534', padding: 16, borderRadius: 12, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                                Si un compte existe pour <strong>{email.trim()}</strong>, vous allez recevoir un e-mail
                                avec un lien pour choisir un nouveau mot de passe.
                                <br />Pensez à vérifier vos spams.
                            </div>
                            <Link to="/login" className="btn-login" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                Entrez l'adresse e-mail de votre compte. Nous vous envoyons un lien pour choisir un nouveau mot de passe.
                            </p>

                            {error && <div className="error-banner">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="login-field" style={{ marginBottom: 24 }}>
                                    <div className="login-input-wrap">
                                        <input
                                            type="email"
                                            placeholder="E-mail"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className="login-input"
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="btn-login">
                                    {loading ? 'Envoi…' : 'Recevoir le lien'}
                                </button>
                            </form>

                            <div className="login-register" style={{ marginTop: 24 }}>
                                <Link to="/login">Retour à la connexion</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
