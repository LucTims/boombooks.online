import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { CurrencyProvider } from './lib/CurrencyContext';
import { FavoritesProvider } from './lib/FavoritesContext';
import { consumePostAuthRedirect } from './lib/authRedirect';
import Header from './components/Header';
import Footer from './components/Footer';

import './components/Header.css';
import './components/Footer.css';
import './components/BookCard.css';

import Landing from './pages/Landing';
import TestPggi from './pages/TestPggi';
import AccountV2 from './pages/AccountV2';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Reader from './pages/Reader';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Terms from './pages/Terms';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import { useAnalytics } from './hooks/useAnalytics';

function AuthRedirectHandler() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user && location.pathname !== '/reset-password') {
            const hasPending = (() => {
                try {
                    return Boolean(localStorage.getItem('auth_redirect'));
                } catch {
                    return false;
                }
            })();
            if (hasPending) {
                const redirectUrl = consumePostAuthRedirect('/account');
                if (location.pathname !== redirectUrl) {
                    navigate(redirectUrl, { replace: true });
                }
            }
        }
    }, [user, navigate, location.pathname]);

    return null;
}

function OAuthErrorHandler() {
    const navigate = useNavigate();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const description = params.get('error_description') || hash.get('error_description');
        if (!description) return;
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/login', {
            replace: true,
            state: { oauthError: `La connexion Google a échoué : ${description.replace(/\+/g, ' ')}` },
        });
    }, [navigate]);
    return null;
}

function AnalyticsTracker() {
    useAnalytics();
    return null;
}

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

const PAGE_META = {
    '/': {
        title: 'BoomBooks - Penser. Gagner. Gérer. Investir. | Méthode PGGI',
        desc: 'Découvrez la Méthode PGGI avec le test gratuit et retrouvez votre résultat et vos livres dans votre compte BoomBooks.',
    },
    '/test-pggi': {
        title: 'Test PGGI gratuit · BoomBooks',
        desc: 'Répondez à 7 questions pour découvrir votre étape actuelle dans la Méthode PGGI (Penser, Gagner, Gérer, Investir).',
    },
    '/account': {
        title: 'Mon compte · BoomBooks',
        desc: 'Consultez votre résultat PGGI, reprenez votre lecture en cours et accédez à votre bibliothèque BoomBooks.',
    },
    '/login': { title: 'Se connecter · BoomBooks', desc: 'Connectez-vous à votre compte BoomBooks.' },
    '/register': { title: 'Créer un compte · BoomBooks', desc: 'Créez votre compte BoomBooks gratuitement.' },
    '/faq': { title: 'FAQ - Questions fréquentes · BoomBooks', desc: 'Questions fréquentes BoomBooks.' },
    '/contact': { title: 'Nous contacter · BoomBooks', desc: 'Contactez l’équipe BoomBooks.' },
};

function PageSEO() {
    const { pathname } = useLocation();
    useEffect(() => {
        const meta = PAGE_META[pathname] || PAGE_META['/'];
        const fullUrl = `https://boombooks.online${pathname === '/' ? '' : pathname}`;
        document.title = meta.title;

        let el = document.querySelector('meta[name="description"]');
        if (!el) {
            el = document.createElement('meta');
            el.name = 'description';
            document.head.appendChild(el);
        }
        el.content = meta.desc;

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = fullUrl;
    }, [pathname]);
    return null;
}

function SimpleLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <CurrencyProvider>
            <AuthProvider>
                <FavoritesProvider>
                    <BrowserRouter>
                        <AuthRedirectHandler />
                        <OAuthErrorHandler />
                        <AnalyticsTracker />
                        <ScrollToTop />
                        <PageSEO />
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/test-pggi" element={<TestPggi />} />
                            <Route path="/test-pggi/:stage" element={<TestPggi />} />
                            <Route path="/account" element={<AccountV2 />} />
                            <Route path="/read/:bookId" element={<Reader />} />

                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />

                            <Route element={<SimpleLayout />}>
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/cookies" element={<Cookies />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/legal" element={<Legal />} />
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </FavoritesProvider>
            </AuthProvider>
        </CurrencyProvider>
    );
}
