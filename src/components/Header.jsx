import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Header.css';

export default function Header() {
    const { user, loading: authLoading } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const homeHref = user ? '/account' : '/';
    const navItems = [
        { label: 'Accueil', to: homeHref, end: true },
        { label: 'Test PGGI', to: '/test-pggi' },
        { label: 'FAQ', to: '/faq' },
        { label: 'Contact', to: '/contact' },
    ];

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const go = (url) => {
        navigate(url);
        setDrawerOpen(false);
    };

    const userInitial = user ? (user.email || 'U').charAt(0).toUpperCase() : '';

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <button
                        type="button"
                        className={`header-hamburger${drawerOpen ? ' is-active' : ''}`}
                        onClick={() => setDrawerOpen((o) => !o)}
                        aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={drawerOpen}
                    >
                        <span className="material-symbols-outlined">{drawerOpen ? 'close' : 'menu'}</span>
                    </button>

                    <Link to={homeHref} className="header-logo">
                        <div className="header-logo-text">
                            <span className="header-logo-name">BoomBooks</span>
                            <span className="header-logo-tagline">l&apos;antidote de l&apos;ignorance</span>
                        </div>
                    </Link>

                    <nav className="header-nav" aria-label="Navigation principale">
                        {navItems.map(({ label, to, end }) => (
                            <NavLink
                                key={label}
                                to={to}
                                end={end}
                                className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions" style={{ marginLeft: 'auto' }}>
                        {!authLoading && (
                            user ? (
                                <Link to="/account" className="header-avatar-btn" title="Mon compte">
                                    {userInitial}
                                </Link>
                            ) : (
                                <Link to="/login" className="header-login-btn">Connexion</Link>
                            )
                        )}
                    </div>
                </div>
            </header>

            <div className={`bb-mobile-drawer${drawerOpen ? ' is-open' : ''}`}>
                <div className="bb-mobile-drawer-head">
                    <Link to={homeHref} className="header-logo" onClick={() => setDrawerOpen(false)}>
                        <div className="header-logo-text">
                            <span className="header-logo-name">BoomBooks</span>
                            <span className="header-logo-tagline">l&apos;antidote de l&apos;ignorance</span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        className="header-hamburger is-active"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Fermer le menu"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="bb-mobile-drawer-body">
                    <nav className="bb-mobile-list" aria-label="Navigation mobile">
                        {navItems.map(({ label, to }) => (
                            <Link
                                key={label}
                                to={to}
                                className="bb-mobile-item"
                                onClick={() => setDrawerOpen(false)}
                            >
                                <span>{label}</span>
                                <span className="material-symbols-outlined bb-mobile-chevron" aria-hidden="true">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="bb-mobile-footer">
                        <button
                            type="button"
                            className="bb-mobile-cta"
                            onClick={() => go('/test-pggi')}
                        >
                            Faire mon test gratuit
                        </button>
                        <Link
                            to={user ? '/account' : '/login'}
                            className="bb-mobile-signin"
                            onClick={() => setDrawerOpen(false)}
                        >
                            {user ? 'Mon compte' : 'Connexion'}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
