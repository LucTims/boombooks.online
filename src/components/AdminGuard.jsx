import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const ADMIN_EMAIL = 'www.martau@gmail.com';

export default function AdminGuard({ children }) {
    const { user, profile, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/login', { replace: true, state: { from: '/admin' } });
            return;
        }

        const email = (user.email || '').toLowerCase().trim();
        const isAuthorizedEmail = email === ADMIN_EMAIL;
        const isRoleAdmin = profile?.role === 'admin';

        if (isAuthorizedEmail || isRoleAdmin) {
            setAuthorized(true);
            return;
        }

        // Vérification renforcée en rafraîchissant le profil
        let cancelled = false;
        refreshProfile().then((fresh) => {
            if (cancelled) return;
            const freshEmail = (user.email || '').toLowerCase().trim();
            if (freshEmail === ADMIN_EMAIL || fresh?.role === 'admin') {
                setAuthorized(true);
            } else {
                navigate('/account', { replace: true });
            }
        }).catch(() => {
            if (!cancelled) navigate('/account', { replace: true });
        });

        return () => { cancelled = true; };
    }, [user, profile, loading, refreshProfile, navigate]);

    if (loading || !authorized) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                gap: 16
            }}>
                <div style={{
                    width: 42,
                    height: 42,
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#0284c7',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                    Vérification des accès administrateur...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return children;
}
