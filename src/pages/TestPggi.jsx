import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
    QUESTIONS, STAGE_ORDER, STAGE_LABELS, shuffledQuestions, computeResult,
    PRIORITY_COUNTRIES, OTHER_COUNTRIES, findCountry, detectCountryCode,
    getRecommendation, getStageWhatsAppLink, saveLead,
    savePendingPggiTest, saveAuthenticatedPggiTest, clearPendingPggiTest,
} from '../lib/pggiTest';
import './TestPggi.css';

const TOTAL = QUESTIONS.length;
const STAGE_NAMES = { penser: 'Penser', gagner: 'Gagner', gerer: 'Gérer', investir: 'Investir' };

function track(event, params = {}) {
    try { if (typeof window.gtag === 'function') window.gtag('event', event, params); } catch { /* facultatif */ }
}

/* ── Logo BoomBooks ── */
function Logo({ to = '/' }) {
    return (
        <Link to={to} className="tp-logo" aria-label={to === '/account' ? 'BoomBooks — mon compte' : 'BoomBooks — accueil'}>
            <span className="tp-logo-name">BoomBooks</span>
            <span className="tp-logo-tagline">l'antidote de l'ignorance</span>
        </Link>
    );
}

/* ── Barre d'étapes du parcours : intro, questions, coordonnées, résultat ── */
function Steps({ current }) {
    return (
        <div className="tp-steps" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <span key={i} className={i <= current ? 'is-on' : ''} />)}
        </div>
    );
}

function WhatsAppIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.71 5.8.71 12.06c0 2 .52 3.95 1.52 5.66L.62 23.6l6.02-1.58a11.33 11.33 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
        </svg>
    );
}

/* ── Illustration : l'escalier PGGI ── */
function StairsArt({ active = null }) {
    const steps = [
        { x: 34, h: 46, l: 'P' },
        { x: 100, h: 78, l: 'G' },
        { x: 166, h: 110, l: 'G' },
        { x: 232, h: 142, l: 'I' },
    ];
    const fills = ['#E7F0FE', '#CFE1FD', '#9CC3FB', '#1877F2'];
    return (
        <svg className="tp-art" viewBox="0 0 320 230" aria-hidden="true">
            <ellipse cx="160" cy="206" rx="150" ry="10" fill="#E9EEF3" />
            {/* cartes flottantes */}
            <g transform="translate(18 26)">
                <rect width="118" height="50" rx="10" fill="#fff" stroke="#DCE3EA" />
                <circle cx="20" cy="18" r="6" fill="#E41E3F" />
                <rect x="34" y="13" width="58" height="5" rx="2.5" fill="#C9D2DC" />
                <rect x="34" y="23" width="40" height="5" rx="2.5" fill="#E2E8EE" />
                <circle cx="88" cy="38" r="2" fill="#C9D2DC" /><circle cx="96" cy="38" r="2" fill="#C9D2DC" /><circle cx="104" cy="38" r="2" fill="#C9D2DC" />
            </g>
            <g transform="translate(150 6)">
                <rect width="96" height="42" rx="10" fill="#fff" stroke="#DCE3EA" />
                <circle cx="18" cy="16" r="6" fill="#1877F2" />
                <rect x="30" y="11" width="48" height="5" rx="2.5" fill="#C9D2DC" />
                <rect x="30" y="21" width="32" height="5" rx="2.5" fill="#E2E8EE" />
            </g>
            {/* marches */}
            {steps.map((s, i) => {
                const on = active == null ? i === 3 : STAGE_ORDER[i] === active;
                return (
                    <g key={i}>
                        <rect x={s.x} y={200 - s.h} width="56" height={s.h} rx="10"
                            fill={active == null ? fills[i] : on ? '#1877F2' : '#E7F0FE'} />
                        <text x={s.x + 28} y={200 - s.h + 28} textAnchor="middle" className="tp-art-letter"
                            fill={on ? '#fff' : '#1877F2'}>{s.l}</text>
                    </g>
                );
            })}
            {/* drapeau d'arrivée */}
            <line x1="282" y1="58" x2="282" y2="18" stroke="#0B0F14" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M283 19 L306 27 L283 36 Z" fill="#E41E3F" />
        </svg>
    );
}

/* ── Pied de page discret ── */
function MiniFooter({ homeTo = '/' }) {
    return (
        <footer className="tp-foot">
            <nav>
                <Link to={homeTo}>Accueil</Link><span>·</span>
                <a href="https://boombooks.shop" target="_blank" rel="noopener noreferrer">Boutique</a><span>·</span>
                <Link to="/faq">FAQ</Link>
            </nav>
            <small>© {new Date().getFullYear()} BoomBooks · l'antidote de l'ignorance</small>
        </footer>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function TestPggi() {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const accountFirstName = (
        user?.user_metadata?.first_name
        || profile?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || ''
    ).trim();
    const accountCountryCode = detectCountryCode(user?.user_metadata?.country || profile?.country);
    const accountPhone = (user?.user_metadata?.phone || profile?.phone || '').trim();

    const [screen, setScreen] = useState('intro'); // intro | quiz | form | result
    const [questions, setQuestions] = useState(shuffledQuestions);
    const [answers, setAnswers] = useState([]); // [{ stage, label }]
    const [typing, setTyping] = useState(false);
    const [form, setForm] = useState({ firstName: '', countryCode: 'CI', phone: '', email: '', consent: false });
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [savedToAccount, setSavedToAccount] = useState(false); // false | 'saving' | 'saved' | 'error'
    const [result, setResult] = useState(null);
    const [shownStage, setShownStage] = useState(null);
    const threadRef = useRef(null);
    const timers = useRef([]);
    const savePromiseRef = useRef(null);
    const lastPayloadRef = useRef(null);

    useEffect(() => {
        document.title = 'Test PGGI gratuit · BoomBooks';
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, [screen]);

    // Le fil de questions descend tout seul vers le dernier message
    useEffect(() => {
        const el = threadRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [answers, typing]);

    const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

    const persistAuthenticatedResult = (payload) => {
        if (!user || !payload) return Promise.resolve({ success: false });
        lastPayloadRef.current = payload;
        savePendingPggiTest(payload);
        setSavedToAccount('saving');
        const task = saveAuthenticatedPggiTest(user, payload)
            .then(async (res) => {
                if (res?.success) {
                    clearPendingPggiTest();
                    await refreshProfile?.();
                    setSavedToAccount('saved');
                } else {
                    setSavedToAccount('error');
                }
                return res;
            })
            .catch(() => {
                setSavedToAccount('error');
                return { success: false };
            });
        savePromiseRef.current = task;
        return task;
    };

    const handleGoAccount = async (e) => {
        if (savePromiseRef.current) {
            e.preventDefault();
            await savePromiseRef.current;
            navigate('/account');
        }
    };

    const start = () => {
        setQuestions(shuffledQuestions());
        setAnswers([]);
        setTyping(false);
        setSavedToAccount(false);
        savePromiseRef.current = null;
        lastPayloadRef.current = null;
        setScreen('quiz');
        track('quiz_started', { source: 'test_pggi' });
    };

    const pick = (opt) => {
        if (typing) return;
        const next = [...answers, { stage: opt.stage, label: opt.label }];
        setAnswers(next);
        setTyping(true);
        if (next.length >= TOTAL) {
            const r = computeResult(next.map((a) => a.stage));
            const formatted = next.map((a, i) => ({ q: QUESTIONS[i].id, stage: a.stage }));
            setResult(r);
            setShownStage(r.stage);
            track('quiz_completed', { stage: r.stage });

            if (user) {
                persistAuthenticatedResult({
                    stage: r.stage,
                    secondStage: r.secondStage,
                    scores: r.scores,
                    answers: formatted,
                    firstName: accountFirstName,
                    countryCode: accountCountryCode,
                    countryName: findCountry(accountCountryCode)?.name || profile?.country || user?.user_metadata?.country || '',
                    whatsapp: accountPhone,
                });
                later(() => { setTyping(false); setScreen('result'); }, 700);
            } else {
                savePendingPggiTest({
                    stage: r.stage,
                    secondStage: r.secondStage,
                    scores: r.scores,
                    answers: formatted,
                });
                later(() => { setTyping(false); setScreen('form'); }, 700);
            }
        } else {
            later(() => setTyping(false), 450);
        }
    };

    const back = () => {
        if (typing) return;
        if (answers.length === 0) { setScreen('intro'); return; }
        setAnswers(answers.slice(0, -1));
    };

    const country = findCountry(form.countryCode);
    const setField = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

    const goConnectToSave = (routePath) => {
        try { localStorage.setItem('auth_redirect', '/account'); } catch { /* ignore */ }
        navigate(routePath, {
            state: {
                from: '/account',
                pendingPggi: true,
                prefillEmail: form.email.trim(),
            },
        });
    };

    const submit = async (e) => {
        e.preventDefault();
        const digits = form.phone.replace(/\D/g, '');
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Indiquez votre prénom.';
        if (digits.length < 6 || digits.length > 14) errs.phone = 'Indiquez un numéro WhatsApp valide.';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Cet e-mail ne semble pas valide.';
        if (!form.consent) errs.consent = 'Cochez la case pour recevoir votre résultat.';
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setSending(true);
        const fullWhatsapp = `${country?.dial || ''}${digits}`;
        const formatted = answers.map((a, i) => ({ q: QUESTIONS[i].id, stage: a.stage }));

        savePendingPggiTest({
            firstName: form.firstName.trim(),
            countryCode: form.countryCode,
            countryName: country?.name || '',
            whatsapp: fullWhatsapp,
            email: form.email.trim(),
            consent: form.consent,
            stage: result.stage,
            secondStage: result.secondStage,
            scores: result.scores,
            answers: formatted,
        });

        await saveLead({
            firstName: form.firstName.trim(),
            countryCode: form.countryCode,
            whatsapp: fullWhatsapp,
            email: form.email.trim(),
            consent: form.consent,
            stage: result.stage,
            secondStage: result.secondStage,
            scores: result.scores,
            answers: formatted,
        });
        setSending(false);
        track('quiz_lead', { stage: result.stage, country: form.countryCode });
        setScreen('result');
    };

    /* ── 1. Introduction ── */
    if (screen === 'intro') {
        return (
            <div className="tp">
                <div className="tp-col">
                    <header className="tp-top">
                        <Logo to={user ? '/account' : '/'} />
                        <Link to={user ? '/account' : '/'} className="tp-top-link">Quitter</Link>
                    </header>
                    <Steps current={0} />
                    <main className="tp-main tp-center">
                        <StairsArt />
                        <h1 className="tp-title">Découvrez votre étape vers la liberté financière</h1>
                        <p className="tp-text">
                            <strong>Penser, Gagner, Gérer ou Investir</strong>&nbsp;: chacun en est à une étape différente.
                            Répondez à 7 questions et découvrez par où commencer, avec le livre ou la formation
                            qui correspond à <strong>votre</strong> situation.
                        </p>
                        <ul className="tp-meta">
                            <li><span className="material-symbols-outlined" aria-hidden="true">schedule</span>2 minutes</li>
                            <li><span className="material-symbols-outlined" aria-hidden="true">help</span>7 questions</li>
                            <li><span className="material-symbols-outlined" aria-hidden="true">redeem</span>Gratuit</li>
                        </ul>
                    </main>
                    <div className="tp-actions">
                        <Link to={user ? '/account' : '/'} className="tp-ghost">Retour</Link>
                        <button type="button" className="tp-btn" onClick={start}>Commencer le test</button>
                    </div>
                    <MiniFooter homeTo={user ? '/account' : '/'} />
                </div>
            </div>
        );
    }

    /* ── 2. Les 7 questions, une à la fois, dans un fil ── */
    if (screen === 'quiz') {
        const idx = answers.length;
        const current = idx < TOTAL ? questions[idx] : null;
        return (
            <div className="tp tp--chat">
                <div className="tp-col tp-col--chat">
                    <header className="tp-chat-head">
                        <button type="button" className="tp-icon-btn" onClick={back} aria-label="Question précédente">
                            <span className="material-symbols-outlined">arrow_back_ios_new</span>
                        </button>
                        <span className="tp-avatar" aria-hidden="true">BB</span>
                        <div className="tp-chat-title">
                            <strong>Test PGGI</strong>
                            <span>Question {Math.min(idx + 1, TOTAL)} sur {TOTAL}</span>
                        </div>
                        <Link to={user ? '/account' : '/'} className="tp-top-link">Quitter</Link>
                    </header>
                    <div className="tp-progress" aria-hidden="true">
                        <span style={{ width: `${(idx / TOTAL) * 100}%` }} />
                    </div>

                    <div className="tp-thread" ref={threadRef} aria-live="polite">
                        <p className="tp-bubble tp-bubble--in">
                            Bonjour 👋 Répondez simplement, il n’y a pas de bonne ou de mauvaise réponse.
                        </p>
                        {answers.map((a, i) => (
                            <div key={i} className="tp-pair">
                                <p className="tp-bubble tp-bubble--in">
                                    <span className="tp-qnum">Question {i + 1}</span>
                                    {questions[i].q}
                                </p>
                                <p className="tp-bubble tp-bubble--out">{a.label}</p>
                            </div>
                        ))}
                        {typing ? (
                            <p className="tp-bubble tp-bubble--in tp-typing" aria-label="…">
                                <span /><span /><span />
                            </p>
                        ) : current && (
                            <p className="tp-bubble tp-bubble--in tp-bubble--new" key={idx}>
                                <span className="tp-qnum">Question {idx + 1}</span>
                                {current.q}
                            </p>
                        )}
                    </div>

                    <div className="tp-answers">
                        {!typing && current && current.options.map((opt) => (
                            <button key={opt.label} type="button" className="tp-option" onClick={() => pick(opt)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── 3. Le formulaire ── */
    if (screen === 'form') {
        return (
            <div className="tp">
                <div className="tp-col">
                    <header className="tp-top">
                        <Logo to={user ? '/account' : '/'} />
                        <Link to={user ? '/account' : '/'} className="tp-top-link">Quitter</Link>
                    </header>
                    <Steps current={2} />
                    <form className="tp-main tp-form" onSubmit={submit} noValidate>
                        <div className="tp-center">
                            <span className="tp-emoji" aria-hidden="true">🎯</span>
                            <h1 className="tp-title">Votre résultat est prêt</h1>
                            <p className="tp-text">Où voulez-vous le recevoir&nbsp;?</p>
                        </div>

                        <label className="tp-field">
                            <span>Prénom</span>
                            <input type="text" autoComplete="given-name" value={form.firstName}
                                onChange={(e) => setField('firstName', e.target.value)} placeholder="Ex. Aïcha" />
                            {errors.firstName && <em>{errors.firstName}</em>}
                        </label>

                        <label className="tp-field">
                            <span>Pays</span>
                            <select value={form.countryCode} onChange={(e) => setField('countryCode', e.target.value)}>
                                <optgroup label="Afrique francophone">
                                    {PRIORITY_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </optgroup>
                                <optgroup label="Autres pays">
                                    {OTHER_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </optgroup>
                            </select>
                        </label>

                        <label className="tp-field">
                            <span>Numéro WhatsApp</span>
                            <div className="tp-phone">
                                <b>{country?.dial}</b>
                                <input type="tel" inputMode="tel" autoComplete="tel-national" value={form.phone}
                                    onChange={(e) => setField('phone', e.target.value)} placeholder="07 00 00 00 00" />
                            </div>
                            {errors.phone && <em>{errors.phone}</em>}
                        </label>

                        <label className="tp-field">
                            <span>E-mail <i>(facultatif)</i></span>
                            <input type="email" autoComplete="email" value={form.email}
                                onChange={(e) => setField('email', e.target.value)} placeholder="vous@exemple.com" />
                            {errors.email && <em>{errors.email}</em>}
                        </label>

                        <label className="tp-check">
                            <input type="checkbox" checked={form.consent} onChange={(e) => setField('consent', e.target.checked)} />
                            <span>J’accepte de recevoir mon résultat et des messages de BoomBooks sur WhatsApp.</span>
                        </label>
                        {errors.consent && <em className="tp-error">{errors.consent}</em>}

                        <div className="tp-actions tp-actions--form">
                            <button type="button" className="tp-ghost" onClick={() => { setAnswers(answers.slice(0, -1)); setScreen('quiz'); }}>
                                Retour
                            </button>
                            <button type="submit" className="tp-btn" disabled={sending}>
                                {sending ? 'Un instant…' : 'Voir mon résultat'}
                            </button>
                        </div>
                        <button type="button" className="tp-form-signin" onClick={() => goConnectToSave('/login')}>
                            Déjà un compte ? Me connecter pour enregistrer mon résultat →
                        </button>
                    </form>
                    <MiniFooter homeTo={user ? '/account' : '/'} />
                </div>
            </div>
        );
    }

    /* ── 4. Le résultat ── */
    const stage = shownStage || result?.stage || 'penser';
    const isMain = stage === result?.stage;
    const other = isMain ? result?.secondStage : result?.stage;
    const effectiveCountryCode = user ? accountCountryCode : form.countryCode;
    const rec = getRecommendation(stage, effectiveCountryCode);
    const name = (form.firstName || accountFirstName).trim() || 'Membre';

    return (
        <div className="tp">
            <div className="tp-col">
                <header className="tp-top">
                    <Logo to={user ? '/account' : '/'} />
                    <Link to={user ? '/account' : '/'} className="tp-top-link" onClick={user ? handleGoAccount : undefined}>
                        {user ? 'Mon compte' : 'Accueil'}
                    </Link>
                </header>
                <Steps current={3} />
                <main className="tp-main">
                    <div className="tp-center">
                        <StairsArt active={stage} />
                        <span className="tp-pill">{isMain ? 'Votre étape' : 'Étape suivante possible'} · {STAGE_LABELS[stage]}</span>
                        <h1 className="tp-title">
                            {isMain ? <>{name}, votre étape&nbsp;: <span className="tp-blue">{STAGE_LABELS[stage]}</span>.</>
                                : <>L’étape <span className="tp-blue">{STAGE_LABELS[stage]}</span></>}
                        </h1>
                        <p className="tp-text">{rec.message}</p>
                    </div>

                    <article className="tp-product">
                        {rec.product.image ? (
                            <img src={rec.product.image} alt={rec.product.title} width="640" height="903" />
                        ) : (
                            <span className="tp-product-icon material-symbols-outlined" aria-hidden="true">{rec.product.icon}</span>
                        )}
                        <div className="tp-product-body">
                            <small>Recommandé pour vous</small>
                            <h2>{rec.product.title}</h2>
                            <p>{rec.product.note}</p>
                            <strong>{rec.product.price}</strong>
                            {rec.product.cta.to ? (
                                <Link to={rec.product.cta.to} className="tp-btn tp-btn--red" onClick={() => track('quiz_product_click', { stage })}>
                                    {rec.product.cta.label}
                                </Link>
                            ) : (
                                <a href={rec.product.cta.href} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn--red"
                                    onClick={() => track('quiz_product_click', { stage })}>
                                    {rec.product.cta.label}
                                </a>
                            )}
                        </div>
                    </article>

                    {/* Incitation compte : connecter si visiteur, ou retour direct vers Mon compte */}
                    {user ? (
                        <div className="tp-save-card tp-save-card--done">
                            <div className="tp-save-copy">
                                <strong>
                                    {savedToAccount === 'saving'
                                        ? 'Enregistrement sur votre compte…'
                                        : savedToAccount === 'error'
                                            ? 'Enregistrement en attente sur votre compte'
                                            : 'Votre étape PGGI est enregistrée sur votre compte'}
                                </strong>
                                <span>
                                    {savedToAccount === 'error'
                                        ? 'Une erreur réseau a interrompu la sauvegarde. Vous pouvez réessayer ou ouvrir votre compte pour synchroniser.'
                                        : 'Retrouvez votre diagnostic et vos lectures recommandées directement dans votre espace membre.'}
                                </span>
                            </div>
                            <div className="tp-save-actions">
                                {savedToAccount === 'error' && (
                                    <button
                                        type="button"
                                        className="tp-save-btn tp-save-btn--ghost"
                                        onClick={() => persistAuthenticatedResult(lastPayloadRef.current)}
                                    >
                                        Réessayer
                                    </button>
                                )}
                                <Link to="/account" className="tp-save-btn" onClick={handleGoAccount}>
                                    Aller dans Mon compte
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="tp-save-card">
                            <div className="tp-save-copy">
                                <strong>Enregistrez votre étape dans votre compte</strong>
                                <span>Connectez-vous ou créez un compte gratuit pour sauvegarder votre diagnostic PGGI et suivre votre progression.</span>
                            </div>
                            <div className="tp-save-actions">
                                <button type="button" className="tp-save-btn" onClick={() => goConnectToSave('/register')}>
                                    Créer mon compte et enregistrer
                                </button>
                                <button type="button" className="tp-save-btn tp-save-btn--ghost" onClick={() => goConnectToSave('/login')}>
                                    Me connecter
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bouton d'incitation WhatsApp avec message prérempli de l'étape */}
                    <div className="tp-wa-card">
                        <div className="tp-wa-copy">
                            <strong>Discutons de votre étape {STAGE_NAMES[stage]}</strong>
                            <span>Votre diagnostic est déjà prérempli : écrivez-nous directement pour recevoir votre prochain pas personnalisé.</span>
                        </div>
                        <a
                            href={getStageWhatsAppLink(stage, name, effectiveCountryCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tp-wa-btn"
                            onClick={() => track('quiz_whatsapp_click', { stage })}
                        >
                            <WhatsAppIcon size={19} />
                            <span>Écrire sur WhatsApp maintenant</span>
                        </a>
                    </div>

                    {rec.extra && (rec.extra.to ? (
                        <Link to={rec.extra.to} className="tp-extra">{rec.extra.label}<span className="material-symbols-outlined" aria-hidden="true">chevron_right</span></Link>
                    ) : (
                        <a href={rec.extra.href} target="_blank" rel="noopener noreferrer" className="tp-extra">
                            {rec.extra.label}<span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                        </a>
                    ))}

                    {other && (
                        <button type="button" className="tp-next" onClick={() => { setShownStage(other); window.scrollTo(0, 0); }}>
                            <span>
                                {isMain ? 'Vous pourriez aussi avoir besoin de l’étape' : 'Revenir à votre étape'}{' '}
                                <b>{STAGE_NAMES[other]}</b>
                            </span>
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                        </button>
                    )}

                    <button type="button" className="tp-restart" onClick={start}>Refaire le test</button>
                </main>
                <MiniFooter homeTo={user ? '/account' : '/'} />
            </div>
        </div>
    );
}
