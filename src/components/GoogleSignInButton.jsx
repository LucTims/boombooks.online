import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Libellés du bouton officiel Google (paramètre `text` de renderButton).
const GIS_TEXT = { signin: 'signin_with', signup: 'signup_with', continue: 'continue_with' };
const FALLBACK_LABEL = {
    signin: 'Se connecter avec Google',
    signup: "S'inscrire avec Google",
    continue: 'Continuer avec Google',
};

let gisScriptPromise;
function loadGoogleIdentityServices() {
    if (window.google?.accounts?.id) return Promise.resolve();
    gisScriptPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => { gisScriptPromise = undefined; reject(new Error('Impossible de charger Google.')); };
        document.head.appendChild(script);
    });
    return gisScriptPromise;
}

// Supabase vérifie que sha256(nonce brut) === nonce du jeton Google.
async function createNonce() {
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const hashed = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    return { raw, hashed };
}

function rememberReturnTo(returnTo) {
    if (!returnTo) return;
    try { localStorage.setItem('auth_redirect', returnTo); } catch { /* stockage indisponible */ }
}

function Divider() {
    return <div className="login-divider"><span>ou</span></div>;
}

// Bouton officiel « Sign in with Google » : la connexion se fait depuis boombooks.shop
// (Google affiche ce domaine au lieu de xxx.supabase.co), puis le jeton est transmis à Supabase.
function GoogleIdentityButton({ returnTo, mode, onError }) {
    const containerRef = useRef(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                await loadGoogleIdentityServices();
                const nonce = await createNonce();
                if (cancelled || !containerRef.current) return;
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    nonce: nonce.hashed,
                    ux_mode: 'popup',
                    callback: async ({ credential }) => {
                        rememberReturnTo(returnTo);
                        const { error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: credential,
                            nonce: nonce.raw,
                        });
                        if (error) onError?.(`La connexion Google a échoué : ${error.message}`);
                    },
                });
                window.google.accounts.id.renderButton(containerRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    text: GIS_TEXT[mode],
                    logo_alignment: 'center',
                    locale: 'fr',
                    width: Math.min(containerRef.current.offsetWidth || 400, 400),
                });
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();
        return () => { cancelled = true; };
    }, [returnTo, mode, onError]);

    if (failed) return <RedirectButton returnTo={returnTo} mode={mode} onError={onError} />;

    return (
        <>
            <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44, marginBottom: 4 }} />
            <Divider />
        </>
    );
}

// Repli : aller-retour classique via Supabase (si l'ID client n'est pas configuré
// ou si le script Google ne se charge pas).
function RedirectButton({ returnTo, mode, onError }) {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        rememberReturnTo(returnTo);
        const { error } = await signInWithGoogle();
        if (error) {
            setLoading(false);
            onError?.(error.message);
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick} disabled={loading} className="btn-sso">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Redirection vers Google…' : FALLBACK_LABEL[mode]}
            </button>
            <Divider />
        </>
    );
}

// returnTo : page où revenir une fois connecté (relu par AuthRedirectHandler via auth_redirect).
export default function GoogleSignInButton({ returnTo, mode = 'continue', onError }) {
    return GOOGLE_CLIENT_ID
        ? <GoogleIdentityButton returnTo={returnTo} mode={mode} onError={onError} />
        : <RedirectButton returnTo={returnTo} mode={mode} onError={onError} />;
}
