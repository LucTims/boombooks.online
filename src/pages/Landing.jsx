import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
    CHARIOW_LINKS, whatsappLink,
    HERO_CONTENT, prefersReducedMotion,
    PGGI_SECTION_HEADER, PGGI_STEPS,
    LANDING_FAQS, TESTIMONIALS,
} from '../lib/landingContent';
import './Landing.css';
import PggiWordRotator from '../components/PggiWordRotator';
import './Landing.charte.css';

const STAGES = [
    { n: 1, name: 'Penser' },
    { n: 2, name: 'Gagner' },
    { n: 3, name: 'Gérer' },
    { n: 4, name: 'Investir' },
];


/* Les deux livres mis en avant dans « Nos produits » : renvoient vers les fiches produits sur boombooks.shop */
const BOOKS = [
    { id: 'liberteFinanciere', title: 'En route vers la liberté financière', image: '/images/landing/livre-liberte-financiere.webp', w: 640, h: 960, cta: 'Obtenir le livre', href: 'https://boombooks.shop/book/en-route-vers-la-liberte-financiere-boombooks' },
    { id: 'guideBrvm', title: 'Le guide complet pour investir à la Bourse', image: '/images/landing/livre-guide-brvm.webp', w: 640, h: 903, cta: 'Obtenir le guide', href: 'https://boombooks.shop/book/guide-complet-pour-investir-a-la-brvm-boombooks' },
];

/* Animation 2 (prompt-motion « highlight sweep ») : un surligneur balaie le mot quand il apparaît */
function Sweep({ children, onLight = false, repeatMs = 0 }) {
    const ref = useRef(null);
    const reduced = typeof window === 'undefined' || !('IntersectionObserver' in window) || prefersReducedMotion();
    const [on, setOn] = useState(reduced);
    useEffect(() => {
        if (reduced || !ref.current) return undefined;
        let timer = 0;
        let raf = 0;
        // Rejoue l'animation : on retire l'état (sans transition) puis on le remet deux images plus tard
        const play = () => {
            setOn(false);
            raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setOn(true)); });
        };
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            io.disconnect();
            play();
            if (repeatMs) timer = setInterval(play, repeatMs);
        }, { threshold: 0.8 });
        io.observe(ref.current);
        return () => { io.disconnect(); clearInterval(timer); cancelAnimationFrame(raf); };
    }, [reduced, repeatMs]);
    return (
        <span ref={ref} className={`bb-sweep${onLight ? ' bb-sweep--onlight' : ''}${on ? ' is-on' : ''}`}>
            <span className="bb-sweep-text">{children}</span>
            <svg className="bb-sweep-cursor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 2l16 9-7 2-3 7z" />
            </svg>
        </span>
    );
}

/* Petit dessin au trait : une trajectoire en pointillés qui s'envole vers la photo */
function StepDoodle({ flip }) {
    return (
        <svg className={`bb-doodle${flip ? ' bb-doodle--flip' : ''}`} viewBox="0 0 260 90" aria-hidden="true">
            <path d="M6 78 C 60 10, 150 0, 214 46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" strokeLinecap="round" />
            <g transform="translate(232 58) rotate(32)">
                <path d="M-20 -13 L22 0 L-20 13 L-11 0 Z" fill="currentColor" />
                <path d="M-11 0 L22 0 M-11 0 L-14 9" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            </g>
        </svg>
    );
}

/* ── Navigation épurée : uniquement la méthode PGGI et les rubriques de la page ── */
const NAV_LINKS = [
    { label: 'Méthode PGGI', href: '#methode' },
    { label: 'Nos produits', href: '#produits' },
    { label: 'Notre mission', href: '#mission' },
];


/* Lien Chariow si disponible, sinon WhatsApp pré-rempli : jamais de bouton mort. */
function productHref(id, title) {
    return CHARIOW_LINKS[id] || whatsappLink(`Bonjour BoomBooks, je suis intéressé(e) par « ${title} ».`);
}

function trackClick(name) {
    try {
        if (typeof window.gtag === 'function') window.gtag('event', 'landing_cta', { cta_name: name });
        if (typeof window.fbq === 'function') window.fbq('trackCustom', 'LandingCTA', { cta_name: name });
    } catch { /* tracking facultatif */ }
}

function WhatsAppIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.71 5.8.71 12.06c0 2 .52 3.95 1.52 5.66L.62 23.6l6.02-1.58a11.33 11.33 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const carouselRef = useRef(null);

    const scrollToIndex = (idx) => {
        const el = carouselRef.current;
        const i = Math.max(0, Math.min(PGGI_STEPS.length - 1, idx));
        if (!el || !el.children[i]) return;
        const card = el.children[i];
        el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
        setActiveStep(i);
    };

    // Glisser à la souris (au doigt, le défilement natif s'en charge)
    const drag = useRef(null);
    const justDragged = useRef(false);
    const onDragStart = (e) => {
        if (e.pointerType !== 'mouse' || !carouselRef.current) return;
        justDragged.current = false;
        drag.current = { x: e.clientX, left: carouselRef.current.scrollLeft, moved: false };
    };
    const onDragMove = (e) => {
        const d = drag.current;
        const el = carouselRef.current;
        if (!d || !el) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 5 && !d.moved) { d.moved = true; el.classList.add('is-dragging'); }
        if (d.moved) el.scrollLeft = d.left - dx;
    };
    const onDragEnd = (e) => {
        const d = drag.current;
        drag.current = null;
        const el = carouselRef.current;
        if (!d || !el || !d.moved) return;
        el.classList.remove('is-dragging');
        justDragged.current = true;
        const dx = e.clientX - d.x;
        scrollToIndex(activeStep + (dx < -60 ? 1 : dx > 60 ? -1 : 0));
    };

    const handleCarouselScroll = (e) => {
        const el = e.currentTarget;
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let dist = Infinity;
        [...el.children].forEach((c, i) => {
            const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
            if (d < dist) { dist = d; best = i; }
        });
        if (best !== activeStep) setActiveStep(best);
    };


    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    /* Tous les boutons « Faire mon test gratuit » mènent au parcours /test-pggi */
    const openQuiz = () => {
        setMenuOpen(false);
        trackClick('open_pggi_quiz');
        navigate('/test-pggi');
    };

    const testimonials = TESTIMONIALS.filter((t) => !t.placeholder);

    return (
        <div className="acq">
            {/* ═══ ENTÊTE CORPORATE BARRE UNIQUE ═══════════════ */}
            <header className={`rm-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
                <div className="acq-container rm-header-inner">
                    {/* Logo BoomBooks + Slogan */}
                    <Link to={user ? '/account' : '/'} className="rm-logo" aria-label={user ? 'BoomBooks — mon compte' : 'BoomBooks — accueil'}>
                        <div className="rm-logo-stack">
                            <span className="rm-logo-name">BoomBooks</span>
                            <span className="rm-logo-tagline">l'antidote de l'ignorance</span>
                        </div>
                    </Link>

                    {/* Navigation centrale épurée (ordinateur) */}
                    <nav className="rm-nav-center" aria-label="Navigation principale">
                        {NAV_LINKS.map((item) =>
                            item.to ? (
                                <Link key={item.label} to={item.to} className="rm-nav-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <a key={item.label} href={item.href} className="rm-nav-link">
                                    {item.label}
                                </a>
                            )
                        )}
                    </nav>

                    {/* Actions à droite : Connexion, Bouton d'action élégant */}
                    <div className="rm-top-actions">
                        <Link to={user ? '/account' : '/login'} className="rm-signin-link">
                            {user ? 'Mon compte' : 'Connexion'}
                        </Link>

                        <button
                            type="button"
                            className="rm-header-cta"
                            onClick={() => openQuiz()}
                        >
                            Faire mon test gratuit
                        </button>

                        {/* Bouton Burger / Fermer (mobile & tablette) */}
                        <button
                            type="button"
                            className={`rm-burger${menuOpen ? ' is-active' : ''}`}
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            aria-expanded={menuOpen}
                        >
                            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Menu déroulant mobile épuré */}
                <div className={`rm-mobile-drawer${menuOpen ? ' is-open' : ''}`}>
                    <div className="rm-mobile-drawer-head">
                        <Link to={user ? '/account' : '/'} className="rm-logo" onClick={() => setMenuOpen(false)} aria-label={user ? 'BoomBooks — mon compte' : 'BoomBooks — accueil'}>
                            <div className="rm-logo-stack">
                                <span className="rm-logo-name">BoomBooks</span>
                                <span className="rm-logo-tagline">l'antidote de l'ignorance</span>
                            </div>
                        </Link>
                        <div className="rm-top-actions">
                            <button
                                type="button"
                                className="rm-burger is-active"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Fermer le menu"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="rm-mobile-drawer-body">
                        <nav className="rm-mobile-list" aria-label="Menu mobile">
                            {NAV_LINKS.map((item) =>
                                item.to ? (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        className="rm-mobile-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        <span className="material-symbols-outlined rm-mobile-chevron" aria-hidden="true">
                                            chevron_right
                                        </span>
                                    </Link>
                                ) : (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="rm-mobile-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        <span className="material-symbols-outlined rm-mobile-chevron" aria-hidden="true">
                                            chevron_right
                                        </span>
                                    </a>
                                )
                            )}
                        </nav>

                        <div className="rm-mobile-footer">
                            <button type="button" className="rm-cta-red rm-cta-red--block" onClick={() => openQuiz()}>
                                {HERO_CONTENT.ctaLabel}
                            </button>
                            <Link
                                to={user ? '/account' : '/login'}
                                className="rm-mobile-signin"
                                onClick={() => setMenuOpen(false)}
                            >
                                {user ? 'Mon compte' : 'Connexion'}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* ═══ HERO — portraits détourés + titre géant (inspiration acquisition.com) ═══ */}
                <section className="bb-hero">
                    <div className="acq-container bb-hero-grid">
                        <img className="bb-hero-person bb-hero-person--left" src="/images/landing/hero-homme.webp" alt="" width="640" height="782" fetchPriority="high" />
                        <div className="bb-hero-center">
                            <h1 className="bb-hero-title" aria-label="L'Afrique s'enrichit. Apprenez à penser, gagner, gérer et investir.">
                                <span className="bb-hero-line" aria-hidden="true">L’Afrique s’enrichit.</span>
                                <span className="bb-hero-line" aria-hidden="true">
                                    Apprenez à <PggiWordRotator />
                                </span>
                            </h1>
                            <p className="bb-hero-sub">{HERO_CONTENT.subtitle}</p>
                            <button type="button" className="rm-cta-red bb-hero-cta" onClick={() => openQuiz()}>
                                {HERO_CONTENT.ctaLabel}
                            </button>
                        </div>
                        <img className="bb-hero-person bb-hero-person--right" src="/images/landing/hero-femme.webp" alt="" width="640" height="741" />
                    </div>
                </section>

                {/* ═══ CE QUI VOUS ATTEND — une phrase, des mots clés colorés ═══ */}
                <section className="bb-promise" aria-label="Ce qui vous attend">
                    <div className="acq-container bb-promise-inner">
                        <h2 className="bb-promise-title">
                            <span className="bb-stair">BoomBooks transforme</span>{' '}
                            <span className="bb-stair">ce que vous <em>lisez</em> en <strong>argent qui travaille</strong>&nbsp;:</span>{' '}
                            <span className="bb-stair"><span className="bb-muted">revenus, épargne et investissements</span> bien réels.</span>
                        </h2>
                    </div>
                </section>

                {/* ═══ LA MÉTHODE PGGI — carrousel horizontal, image et texte en alternance ═══ */}
                <section id="methode" className="bb-section bb-method">
                    <div className="acq-container">
                        <header className="bb-head">
                            <h2>C’est quoi la méthode <em><Sweep onLight repeatMs={15000}>PGGI</Sweep></em>&nbsp;?</h2>
                            <p className="bb-head-sub">{PGGI_SECTION_HEADER.subtitle}</p>
                        </header>
                    </div>
                    <div
                        className="bb-slider"
                        ref={carouselRef}
                        onScroll={handleCarouselScroll}
                        onPointerDown={onDragStart}
                        onPointerMove={onDragMove}
                        onPointerUp={onDragEnd}
                        onPointerCancel={onDragEnd}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') scrollToIndex(activeStep + 1);
                            if (e.key === 'ArrowLeft') scrollToIndex(activeStep - 1);
                        }}
                        tabIndex={0}
                        aria-label="Les 4 étapes de la méthode PGGI"
                    >
                        {PGGI_STEPS.map((s, idx) => (
                            <article
                                key={s.num}
                                className={`bb-slide${idx % 2 ? ' bb-slide--flip' : ''}${activeStep === idx ? ' is-active' : ''}`}
                                aria-label={`Étape ${idx + 1} sur 4`}
                                onClick={() => !justDragged.current && activeStep !== idx && scrollToIndex(idx)}
                            >
                                <div className="bb-slide-body">
                                    <StepDoodle flip={idx % 2 === 1} />
                                    <h3>{STAGES[idx].name}</h3>
                                    <p className="bb-slide-line">{s.line}</p>
                                    <p>{s.desc}</p>
                                </div>
                                <figure className="bb-slide-photo">
                                    <img
                                        src={s.image}
                                        alt={s.imageAlt}
                                        loading="lazy"
                                        draggable={false}
                                        onError={(e) => { e.currentTarget.src = s.image.replace('.jpg', '.svg'); }}
                                    />
                                </figure>
                            </article>
                        ))}
                    </div>
                    <div className="acq-container bb-slider-nav">
                        <button type="button" className="bb-slider-arrow" onClick={() => scrollToIndex(activeStep - 1)} disabled={activeStep === 0} aria-label="Étape précédente">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="bb-slider-dots">
                            {PGGI_STEPS.map((s, idx) => (
                                <button
                                    key={s.num}
                                    type="button"
                                    className={activeStep === idx ? 'is-active' : ''}
                                    onClick={() => scrollToIndex(idx)}
                                    aria-label={`Aller à l'étape ${idx + 1}`}
                                />
                            ))}
                        </div>
                        <button type="button" className="bb-slider-arrow" onClick={() => scrollToIndex(activeStep + 1)} disabled={activeStep === PGGI_STEPS.length - 1} aria-label="Étape suivante">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </section>

                {/* ═══ NOS PRODUITS — deux livres, sans cadre ═══ */}
                <section id="produits" className="bb-section bb-books-section">
                    <div className="acq-container">
                        <header className="bb-head">
                            <h2>Nos <em>produits</em></h2>
                            <p className="bb-head-sub">Deux livres pour passer de la lecture à l’action.</p>
                        </header>
                        <div className="bb-books">
                            {BOOKS.map((b) => (
                                <article key={b.id} className="bb-book">
                                    <h3>{b.title}</h3>
                                    <img src={b.image} alt={b.title} loading="lazy" width={b.w} height={b.h} />
                                    <a
                                        href={b.href || productHref(b.id, b.title)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rm-cta-red bb-book-cta"
                                        onClick={() => trackClick(b.id)}
                                    >
                                        {b.cta}
                                    </a>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ TÉMOIGNAGES (masqués tant qu'ils sont fictifs) ═══ */}
                {testimonials.length > 0 && (
                    <section className="bb-section">
                        <div className="acq-container">
                            <header className="bb-head">
                                <h2>Ils ont <em>franchi le pas</em></h2>
                                <div className="bb-rule" />
                            </header>
                            <div className="acq-testi-grid">
                                {testimonials.map((t, i) => (
                                    <figure key={i} className="acq-testi-card">
                                        <blockquote>« {t.quote} »</blockquote>
                                        <figcaption>{t.name} · {t.country}</figcaption>
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══ FAQ ═══ */}
                <section className="bb-section">
                    <div className="acq-container acq-faq-container">
                        <header className="bb-head">
                            <h2><em>Questions</em> fréquentes</h2>
                        </header>
                        <div className="acq-faq-list">
                            {LANDING_FAQS.map((item, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div key={item.q} className={`acq-faq-item${isOpen ? ' is-open' : ''}`}>
                                        <button
                                            type="button"
                                            className="acq-faq-question"
                                            onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{item.q}</span>
                                            <span className="material-symbols-outlined acq-faq-chevron" aria-hidden="true">
                                                expand_more
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="acq-faq-answer">
                                                <p>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══ NOTRE MISSION — titre, image + court texte, appel au test ═══ */}
                <section id="mission" className="bb-mission">
                    <div className="acq-container">
                        <header className="bb-head">
                            <h2>Notre <em>mission</em></h2>
                        </header>
                        <div className="bb-mission-grid">
                            <img src="/images/landing/mission-lecture.webp" alt="Deux jeunes lisent un livre BoomBooks sur téléphone" loading="lazy" width="1400" height="788" />
                            <div className="bb-mission-copy">
                                <p>
                                    En Afrique, le talent ne manque pas. Ce qui manque, c’est l’accès au bon savoir&nbsp;:
                                    celui qui apprend à faire travailler son argent.
                                </p>
                                <p>
                                    BoomBooks rend ce savoir simple, abordable et concret, avec des livres et des guides
                                    pensés pour l’Afrique francophone.
                                </p>
                                <p>
                                    Notre ambition&nbsp;: que chaque lecteur transforme ce qu’il lit en revenus, en épargne
                                    et en investissements bien réels.
                                </p>
                                <p className="bb-slogan">l'antidote de l'ignorance</p>
                                <p className="bb-mission-push">
                                    Votre prospérité commence par un premier pas. Faites-le aujourd’hui.
                                </p>
                                <button type="button" className="rm-cta-red bb-mission-cta" onClick={() => openQuiz()}>
                                    {HERO_CONTENT.ctaLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ═══ FOOTER PLEINE COULEUR BLEU BOOMBOOKS ══════════════════ */}
            <footer className="acq-footer">
                <div className="acq-container">
                    <div className="acq-footer-brand">
                        <Link to={user ? '/account' : '/'} className="acq-footer-logo-stack">
                            <span className="acq-footer-logo-name">BoomBooks</span>
                            <span className="acq-footer-logo-tagline">l'antidote de l'ignorance</span>
                        </Link>
                    </div>

                    <div className="acq-footer-cols">
                        <div className="acq-footer-col">
                            <h4>La méthode PGGI</h4>
                            <ul>
                                <li><a href="#methode">01 · Penser (État d'esprit)</a></li>
                                <li><a href="#methode">02 · Gagner (Compétences)</a></li>
                                <li><a href="#methode">03 · Gérer (Budget &amp; Épargne)</a></li>
                                <li><a href="#methode">04 · Investir (BRVM)</a></li>
                            </ul>
                        </div>
                        <div className="acq-footer-col">
                            <h4>Nos produits</h4>
                            <ul>
                                <li><a href="#produits">Le guide complet pour investir à la Bourse</a></li>
                                <li><a href="#produits">En route vers la liberté financière</a></li>
                            </ul>
                        </div>
                        <div className="acq-footer-col">
                            <h4>Boutique &amp; accès</h4>
                            <ul>
                                <li><Link to="/test-pggi">Faire mon test gratuit</Link></li>
                                <li><Link to={user ? '/account' : '/login'}>{user ? 'Mon compte' : 'Connexion'}</Link></li>
                                <li>
                                    <a href="https://boombooks.shop" target="_blank" rel="noopener noreferrer">
                                        Boutique boombooks.shop
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="acq-footer-col">
                            <h4>Entreprise &amp; contact</h4>
                            <ul>
                                <li><a href="#mission">Notre Mission</a></li>
                                <li><Link to="/faq">FAQ</Link></li>
                                <li><Link to="/contact">Nous contacter</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="acq-footer-legal-links">
                        <Link to="/privacy">Politique de Confidentialité</Link>
                        <Link to="/terms">Conditions Générales (CGV / CGU)</Link>
                        <Link to="/cookies">Politique des Cookies</Link>
                        <Link to="/legal">Mentions Légales</Link>
                    </div>

                    <p className="acq-footer-disclaimer">
                        Les contenus, livres, formations et accompagnements proposés par BoomBooks sont fournis à titre
                        strictement éducatif et informatif. Ils ne constituent en aucun cas un conseil financier ou en
                        investissement personnalisé. Tout investissement en Bourse (notamment à la BRVM) comporte des
                        risques de fluctuation et de perte en capital. Les performances passées ne préjugent pas des
                        performances futures. © {new Date().getFullYear()} BoomBooks. Tous droits réservés.
                    </p>
                </div>
            </footer>

            {/* Modale du Test Gratuit en 7 questions */}
        </div>
    );
}
