import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getBookGradient } from '../components/BookCard';
import { supabase } from '../lib/supabaseClient';
import { SHOP_ORIGIN, STAGE_LABELS, detectCountryCode, getRecommendation, syncPendingPggiTest } from '../lib/pggiTest';
import { HERO_CONTENT, whatsappLink } from '../lib/landingContent';
import PggiWordRotator from '../components/PggiWordRotator';
import './MyBooks.css';
import './AccountV2.css';

const LAST_READ_KEY = 'bb_last_read_book';
const STAGE_NAMES = { penser: 'Penser', gagner: 'Gagner', gerer: 'Gérer', investir: 'Investir' };

const DEMO_OWNED_BOOKS = [
    {
        id: '45cd802f-7152-4061-9229-17c395c50c38',
        slug: 'en-route-vers-la-liberte-financiere-boombooks',
        title: 'En route vers la liberté financière',
        author: 'BoomBooks',
        cover_url: '/images/landing/livre-liberte-financiere.webp',
        price: 655,
        is_free: false,
        categories: { name: 'Finance & Budget' },
        owned: true,
    },
    {
        id: '721cf953-97d2-40d6-8398-d44d6ffc6280',
        slug: 'reflechissez-et-devenez-riche-napoleon-hill-3',
        title: 'Réfléchissez et devenez riche',
        author: 'Napoléon Hill',
        cover_url: '/images/landing/livre-reflechissez-devenez-riche.jpg',
        price: 0,
        is_free: true,
        categories: { name: 'État d’esprit' },
        owned: true,
    },
    {
        id: 'c8f54257-df0f-4f59-b6d4-4db3c7e5d210',
        slug: 'guide-complet-pour-investir-a-la-brvm-boombooks',
        title: 'Guide Complet pour investir à la BRVM',
        author: 'BoomBooks',
        cover_url: '/images/landing/livre-guide-brvm.webp',
        price: 655,
        is_free: false,
        categories: { name: 'Investissement' },
        owned: true,
    },
];

const getShopBookUrl = (book) => `${SHOP_ORIGIN}/book/${book?.slug || book?.id}`;

function saveLastReadBook(book) {
    if (!book?.id) return;
    try {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify({ id: book.id, openedAt: Date.now() }));
    } catch { /* facultatif */ }
}

function readStoredId() {
    try {
        return JSON.parse(localStorage.getItem(LAST_READ_KEY) || '{}').id || null;
    } catch {
        return null;
    }
}

const ACC_ICON_PATHS = {
    chevron_left: <polyline points="15 18 9 12 15 6" />,
    chevron_right: <polyline points="9 18 15 12 9 6" />,
    menu: (
        <>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
        </>
    ),
    close: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16" y2="16" />
        </>
    ),
    expand_more: <polyline points="6 9 12 15 18 9" />,
    menu_book: (
        <>
            <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
            <path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
        </>
    ),
    auto_stories: (
        <>
            <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
            <path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
            <line x1="5.5" y1="8.5" x2="9" y2="8.5" />
            <line x1="15" y1="8.5" x2="18.5" y2="8.5" />
        </>
    ),
    download: (
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </>
    ),
    favorite: (
        <path d="M12 20.5s-7.5-4.7-9.5-9.2C1 7.8 3.2 4.5 6.8 4.5c2 0 3.7 1.1 5.2 2.9 1.5-1.8 3.2-2.9 5.2-2.9 3.6 0 5.8 3.3 4.3 6.8-2 4.5-9.5 9.2-9.5 9.2z" />
    ),
    shopping_bag: (
        <>
            <path d="M6 7h12l1 13H5z" />
            <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </>
    ),
    workspace_premium: (
        <>
            <circle cx="12" cy="9" r="5" />
            <polyline points="9 13.5 8 21 12 19 16 21 15 13.5" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .68.4 1.3 1.02 1.58.15.07.32.11.49.11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </>
    ),
    admin_panel_settings: (
        <>
            <path d="M12 3l7 3v5c0 4.8-3 8.8-7 10-4-1.2-7-5.2-7-10V6z" />
            <circle cx="12" cy="11" r="2" />
        </>
    ),
    login: (
        <>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </>
    ),
    home: (
        <>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
        </>
    ),
    person: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
        </>
    ),
    storefront: (
        <>
            <path d="M3 9l1.5-5h15L21 9" />
            <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            <path d="M5 12v8h14v-8" />
        </>
    ),
    offline_bolt: <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />,
    photo_camera: (
        <>
            <path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
            <circle cx="12" cy="13" r="3.5" />
        </>
    ),
    rocket_launch: (
        <>
            <path d="M14 4c3 0 6 3 6 6-3 3.5-6.5 6-10 6l-4-4c0-3.5 2.5-7 8-8z" />
            <circle cx="14.5" cy="9.5" r="1.5" />
            <path d="M6 14l-2 6 6-2" />
        </>
    ),
    savings: (
        <>
            <path d="M19 10c0-3.3-3.1-5.5-7-5.5S5 6.7 5 10c0 2.1 1.2 3.8 3 4.8V18h2.5v-1.2c.5.1 1 .2 1.5.2s1-.1 1.5-.2V18H16v-3.2c1.8-1 3-2.7 3-4.8z" />
            <path d="M19 10h2v2.5h-2" />
            <circle cx="15" cy="9" r="0.8" fill="currentColor" />
        </>
    ),
    candlestick_chart: (
        <>
            <line x1="7" y1="4" x2="7" y2="20" />
            <rect x="5" y="8" width="4" height="7" rx="1" />
            <line x1="17" y1="4" x2="17" y2="20" />
            <rect x="15" y="6" width="4" height="8" rx="1" />
        </>
    ),
    grid_view: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
    ),
    view_list: (
        <>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1" fill="currentColor" />
            <circle cx="4" cy="12" r="1" fill="currentColor" />
            <circle cx="4" cy="18" r="1" fill="currentColor" />
        </>
    ),
};

/** Inline SVG UI icon so rendering stays crisp even when Google Material font CDN is blocked. */
function AccIcon({ name, size = 18, filled = false, style }) {
    return (
        <svg
            className="acc2-icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={style}
        >
            {ACC_ICON_PATHS[name] || ACC_ICON_PATHS.menu_book}
        </svg>
    );
}

const VALID_TABS = new Set(['home', 'library', 'settings']);
function normalizeAccountTab(raw) {
    if (raw === 'profile') return 'settings';
    return VALID_TABS.has(raw) ? raw : 'home';
}

function formatMemberName(raw) {
    const clean = String(raw || '').trim();
    if (!clean) return '';
    return clean
        .toLowerCase()
        .replace(/(^|[\s\-'])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
}

/**
 * Owned book card inside the horizontal "Mes livres" shelf: sharp cover, title/author, Lire & Download buttons (no price).
 */
function OwnedShelfCard({ book, subPlan, isDemo, onOpenRead }) {
    const canOffline = Boolean(book.owned || !book.is_subscription || subPlan === 'batisseur' || subPlan === 'discipline');
    const readUrl = `/read/${book.id}`;
    const gradient = getBookGradient(book.id);

    const coverContent = book.cover_url ? (
        <img src={book.cover_url} alt={book.title} loading="lazy" />
    ) : (
        <div className="bk-cover-fallback" aria-hidden="true">
            <span className="bk-cover-fallback-title">{book.title}</span>
        </div>
    );

    return (
        <article className="bk-card acc2-owned-card">
            {isDemo ? (
                <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" onClick={() => onOpenRead(book)} className="bk-card-cover" style={{ background: book.cover_url ? undefined : gradient }} aria-label={book.title}>
                    {coverContent}
                </a>
            ) : (
                <Link to={readUrl} onClick={() => onOpenRead(book)} className="bk-card-cover" style={{ background: book.cover_url ? undefined : gradient }} aria-label={book.title}>
                    {coverContent}
                </Link>
            )}
            <div className="bk-card-body">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" onClick={() => onOpenRead(book)} className="bk-card-title line-clamp-2">{book.title}</a>
                ) : (
                    <Link to={readUrl} onClick={() => onOpenRead(book)} className="bk-card-title line-clamp-2">{book.title}</Link>
                )}
                <p className="bk-card-author line-clamp-1">{book.author || 'BoomBooks'}</p>
            </div>
            <div className="acc2-owned-actions">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="acc2-owned-read" onClick={() => onOpenRead(book)}>
                        Lire
                    </a>
                ) : (
                    <Link to={readUrl} className="acc2-owned-read" onClick={() => onOpenRead(book)}>
                        Lire
                    </Link>
                )}
                {canOffline && (
                    <a
                        href={`https://breadapp.shop/read/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="acc2-owned-dl"
                        title="Télécharger / Lire hors ligne"
                        aria-label={`Télécharger ${book.title}`}
                    >
                        <AccIcon name="download" size={16} />
                    </a>
                )}
            </div>
        </article>
    );
}

/** Grille « Ma Bibliothèque » fidèle au rendu original (bords carrés, badge catégorie, Lire + Hors ligne). */
function LibraryGridCard({ book, subPlan, isDemo, onOpenRead }) {
    const gradient = getBookGradient(book.id);
    const catName = book.categories?.name;
    const canDownload = Boolean(book.owned || !book.is_subscription || subPlan === 'batisseur' || subPlan === 'discipline');
    const readUrl = `/read/${book.id}`;

    const coverContent = (
        <>
            {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} loading="lazy" />
            ) : (
                <div className="bk-cover-fallback" aria-hidden="true">
                    <span className="bk-cover-fallback-title">{book.title}</span>
                </div>
            )}
            {catName && <span className="lb-cat-badge">{catName}</span>}
            {book.is_subscription && (
                <span style={{ position: 'absolute', top: 8, right: 8, background: '#10B981', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 0, fontWeight: 'bold' }}>
                    INCLUS
                </span>
            )}
        </>
    );

    return (
        <div className="lb-card">
            {isDemo ? (
                <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-cover" style={{ background: book.cover_url ? undefined : gradient }}>
                    {coverContent}
                </a>
            ) : (
                <Link to={readUrl} onClick={() => onOpenRead(book)} className="lb-cover" style={{ background: book.cover_url ? undefined : gradient }}>
                    {coverContent}
                </Link>
            )}
            <div className="lb-info">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-title line-clamp-2">{book.title}</a>
                ) : (
                    <Link to={readUrl} onClick={() => onOpenRead(book)} className="lb-title line-clamp-2">{book.title}</Link>
                )}
                <p className="lb-author line-clamp-1">{book.author || 'Auteur inconnu'}</p>
            </div>
            <div className="lb-actions">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-btn lb-btn-read" onClick={() => onOpenRead(book)}>
                        <AccIcon name="auto_stories" size={14} />
                        Lire
                    </a>
                ) : (
                    <Link to={readUrl} className="lb-btn lb-btn-read" onClick={() => onOpenRead(book)}>
                        <AccIcon name="auto_stories" size={14} />
                        Lire
                    </Link>
                )}
                {canDownload && (
                    <a
                        href={`https://breadapp.shop/read/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lb-btn lb-btn-offline"
                        title="Lire hors ligne sur BoomRead"
                        aria-label={`Télécharger ${book.title}`}
                    >
                        <AccIcon name="download" size={15} />
                    </a>
                )}
            </div>
        </div>
    );
}

/** Vue liste « Ma Bibliothèque » fidèle au rendu original. */
function LibraryListItem({ book, subPlan, isDemo, onOpenRead }) {
    const gradient = getBookGradient(book.id);
    const catName = book.categories?.name;
    const canDownload = Boolean(book.owned || !book.is_subscription || subPlan === 'batisseur' || subPlan === 'discipline');
    const readUrl = `/read/${book.id}`;

    return (
        <div className="lb-list-item">
            {isDemo ? (
                <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-list-cover" style={{ background: book.cover_url ? undefined : gradient }}>
                    {book.cover_url && <img src={book.cover_url} alt={book.title} loading="lazy" />}
                </a>
            ) : (
                <Link to={readUrl} onClick={() => onOpenRead(book)} className="lb-list-cover" style={{ background: book.cover_url ? undefined : gradient }}>
                    {book.cover_url && <img src={book.cover_url} alt={book.title} loading="lazy" />}
                </Link>
            )}
            <div className="lb-list-info">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-list-title line-clamp-1">
                        {book.title}
                    </a>
                ) : (
                    <Link to={readUrl} onClick={() => onOpenRead(book)} className="lb-list-title line-clamp-1">
                        {book.title}
                        {book.is_subscription && (
                            <span style={{ marginLeft: 8, background: '#10B981', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 0, fontWeight: 'bold' }}>
                                INCLUS
                            </span>
                        )}
                    </Link>
                )}
                <p className="lb-list-author line-clamp-1">{book.author || 'Auteur inconnu'}</p>
                {catName && <span className="lb-list-cat">{catName}</span>}
            </div>
            <div className="lb-list-actions">
                {isDemo ? (
                    <a href={getShopBookUrl(book)} target="_blank" rel="noopener noreferrer" className="lb-btn lb-btn-read" onClick={() => onOpenRead(book)}>
                        <AccIcon name="auto_stories" size={14} />
                        Lire
                    </a>
                ) : (
                    <Link to={readUrl} className="lb-btn lb-btn-read" onClick={() => onOpenRead(book)}>
                        <AccIcon name="auto_stories" size={14} />
                        Lire
                    </Link>
                )}
                {canDownload && (
                    <a
                        href={`https://breadapp.shop/read/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lb-btn lb-btn-offline"
                        title="Lire hors ligne sur BoomRead"
                        aria-label={`Télécharger ${book.title}`}
                    >
                        <AccIcon name="download" size={15} />
                    </a>
                )}
            </div>
        </div>
    );
}

/**
 * Librairie-style horizontal scrolling shelf row (single row + chevron controls + CTA button).
 */
function AccountBookShelf({ title, count, action, books, loading, emptyState, renderCard }) {
    const trackRef = useRef(null);
    const scrollByStep = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
    };

    return (
        <section className="acc2-shelf-band">
            <div className="acc2-fb-inner acc2-shelf-inner">
                <div className="acc2-shelf-head">
                    <div className="acc2-shelf-title-wrap">
                        <h2 className="acc2-shelf-title">{title}</h2>
                        {typeof count === 'number' && <span className="acc2-shelf-sub">({count})</span>}
                    </div>
                    {action}
                </div>

                {loading ? (
                    <div className="acc2-shelf-track hide-scrollbar">
                        {[0, 1, 2, 3, 4].map((k) => (
                            <div key={k} className="skeleton acc2-shelf-skeleton" />
                        ))}
                    </div>
                ) : books.length === 0 ? (
                    emptyState || null
                ) : (
                    <div className="acc2-shelf-row">
                        <button
                            type="button"
                            className="acc2-shelf-arrow left"
                            onClick={() => scrollByStep(-1)}
                            aria-label="Livres précédents"
                        >
                            <AccIcon name="chevron_left" size={20} />
                        </button>
                        <div className="acc2-shelf-track hide-scrollbar" ref={trackRef}>
                            {books.map((book) => (renderCard ? renderCard(book) : null))}
                        </div>
                        <button
                            type="button"
                            className="acc2-shelf-arrow right"
                            onClick={() => scrollByStep(1)}
                            aria-label="Livres suivants"
                        >
                            <AccIcon name="chevron_right" size={20} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function AccountV2({ previewMode = false }) {
    const { user, profile: authProfile, loading: authLoading, signOut, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const urlTab = searchParams.get('tab');
    const isDevPreview = import.meta.env.DEV && searchParams.get('preview') === '1';
    const canPreview = previewMode || isDevPreview;
    const tab = normalizeAccountTab(urlTab); // 'home' | 'library' | 'settings'

    const [demoPreset, setDemoPreset] = useState(() => searchParams.get('demo') || 'batisseur'); // 'no_test' | 'batisseur' | 'discipline'
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const menuRef = useRef(null);
    const refreshProfileRef = useRef(refreshProfile);
    useEffect(() => { refreshProfileRef.current = refreshProfile; }, [refreshProfile]);

    const [loadingData, setLoadingData] = useState(true);
    const [fullProfile, setFullProfile] = useState(null);
    const [ownedBooks, setOwnedBooks] = useState([]);
    const [subBooks, setSubBooks] = useState([]);

    const [libFilter, setLibFilter] = useState('all');
    const [libCat, setLibCat] = useState('all');
    const [libSearch, setLibSearch] = useState('');
    const [libView, setLibView] = useState('grid');
    const [libLimit, setLibLimit] = useState(40);
    const [notice, setNotice] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [coverUrl, setCoverUrl] = useState(null);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSavingPwd, setIsSavingPwd] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    useEffect(() => {
        document.title = 'Mon compte · BoomBooks';
    }, []);

    useEffect(() => {
        if (urlTab === 'profile') {
            setSearchParams(isDevPreview ? { tab: 'settings', preview: '1' } : { tab: 'settings' }, { replace: true });
        }
    }, [urlTab, isDevPreview, setSearchParams]);

    useEffect(() => {
        if (!canPreview && !authLoading && !user) {
            navigate('/login', { state: { from: `${location.pathname}${location.search}` }, replace: true });
        }
    }, [canPreview, authLoading, user, navigate, location.pathname, location.search]);

    useEffect(() => {
        const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;

        async function loadAll() {
            setLoadingData(true);
            try {
                if (!user) {
                    if (!cancelled) {
                        setFirstName('Awa');
                        setLastName('Diallo');
                        setCountry('Côte d’Ivoire');
                        setLoadingData(false);
                    }
                    return;
                }

                const meta = user.user_metadata || {};
                if (!cancelled) {
                    setFirstName(meta.first_name || '');
                    setLastName(meta.last_name || '');
                    setPhone(meta.phone || '');
                    setCountry(meta.country || '');
                    setAvatarUrl(meta.avatar_url || null);
                    setCoverUrl(meta.cover_url || null);
                }

                const [, pggiSyncRes] = await Promise.allSettled([
                    supabase.rpc('sync_my_purchases'),
                    syncPendingPggiTest(user),
                ]);
                if (pggiSyncRes.status === 'fulfilled' && pggiSyncRes.value?.stage) {
                    refreshProfileRef.current?.();
                }

                const [profRes, accessRes, ordersRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, full_name, country, phone, created_at, subscription_plan, subscription_end_date, current_streak, total_pages_read, visit_count, pggi_stage, pggi_second_stage, pggi_completed_at')
                        .eq('id', user.id)
                        .single(),
                    supabase
                        .from('user_book_access')
                        .select('book_id, granted_at, books:book_id(id, slug, title, author, cover_url, price, original_price, is_free, google_rating, google_rating_count, categories(name))')
                        .eq('user_id', user.id)
                        .order('granted_at', { ascending: false }),
                    supabase
                        .from('orders')
                        .select('id, order_reference, total_amount, status, created_at, order_items(id, price_at_purchase, book_id, books(id, slug, title, author, cover_url, price, original_price, is_free, google_rating, google_rating_count, categories(name)))')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false }),
                ]);

                const prof = profRes.data || null;
                if (!cancelled) {
                    setFullProfile(prof);
                    if (!meta.first_name && prof?.full_name) {
                        const parts = prof.full_name.trim().split(/\s+/);
                        setFirstName(parts[0] || '');
                        if (!meta.last_name && parts.length > 1) setLastName(parts.slice(1).join(' '));
                    }
                    if (!meta.phone && prof?.phone) setPhone(prof.phone);
                    if (!meta.country && prof?.country) setCountry(prof.country);
                }

                // Tous les livres achetés ou gratuits sont conservés sans exception
                const owned = [];
                const seen = new Set();
                (accessRes.data || []).forEach((r) => {
                    if (r.books && !seen.has(r.books.id)) {
                        seen.add(r.books.id);
                        owned.push({ ...r.books, owned: true });
                    }
                });
                (ordersRes.data || [])
                    .filter((o) => o.status === 'paid')
                    .forEach((o) => {
                        o.order_items?.forEach((oi) => {
                            if (oi.books && !seen.has(oi.books.id)) {
                                seen.add(oi.books.id);
                                owned.push({ ...oi.books, owned: true });
                            }
                        });
                    });

                const hasSub = Boolean(prof?.subscription_plan && new Date(prof.subscription_end_date) > new Date());
                let catalog = [];
                if (hasSub) {
                    const PAGE_SIZE = 1000;
                    let from = 0;
                    while (true) {
                        const { data } = await supabase
                            .from('books')
                            .select('id, slug, title, author, cover_url, price, original_price, is_free, google_rating, google_rating_count, categories(name)')
                            .range(from, from + PAGE_SIZE - 1);
                        if (!data?.length) break;
                        catalog = catalog.concat(data);
                        if (data.length < PAGE_SIZE) break;
                        from += PAGE_SIZE;
                    }
                }

                if (!cancelled) {
                    setOwnedBooks(owned);
                    setSubBooks(catalog.map((b) => ({ ...b, is_subscription: true, owned: seen.has(b.id) })));
                }
            } catch (err) {
                console.error('[AccountV2] chargement :', err);
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        }

        loadAll();
        return () => { cancelled = true; };
    }, [user, authLoading]);

    const isDemo = !user && canPreview;
    const effectivePlan = useMemo(() => {
        if (isDemo) return demoPreset === 'no_test' ? null : demoPreset;
        if (fullProfile?.subscription_plan && new Date(fullProfile.subscription_end_date) > new Date()) {
            return fullProfile.subscription_plan;
        }
        return null;
    }, [isDemo, demoPreset, fullProfile]);

    const diagnosedStage = useMemo(() => {
        if (isDemo) {
            if (demoPreset === 'no_test') return null;
            return demoPreset === 'discipline' ? 'investir' : 'gerer';
        }
        return fullProfile?.pggi_stage || authProfile?.pggi_stage || user?.user_metadata?.pggi_stage || null;
    }, [isDemo, demoPreset, fullProfile?.pggi_stage, authProfile?.pggi_stage, user?.user_metadata?.pggi_stage]);

    const effectiveOwnedBooks = isDemo ? DEMO_OWNED_BOOKS : ownedBooks;

    const combinedLibrary = useMemo(() => {
        const map = new Map();
        effectiveOwnedBooks.forEach((b) => map.set(b.id, { ...b, owned: true }));
        if (effectivePlan) {
            subBooks.forEach((b) => {
                if (map.has(b.id)) map.set(b.id, { ...map.get(b.id), is_subscription: true });
                else map.set(b.id, { ...b, is_subscription: true, owned: false });
            });
        }
        return Array.from(map.values());
    }, [effectiveOwnedBooks, effectivePlan, subBooks]);

    const categories = useMemo(() => {
        const set = new Set();
        combinedLibrary.forEach((b) => { if (b.categories?.name) set.add(b.categories.name); });
        return ['all', ...Array.from(set)];
    }, [combinedLibrary]);

    const filteredLibrary = useMemo(() => {
        return combinedLibrary.filter((b) => {
            if (libFilter === 'owned' && !b.owned) return false;
            if (libFilter === 'sub' && !b.is_subscription) return false;
            if (libCat !== 'all' && b.categories?.name !== libCat) return false;
            if (libSearch.trim()) {
                const q = libSearch.toLowerCase();
                if (!b.title?.toLowerCase().includes(q) && !b.author?.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [combinedLibrary, libFilter, libCat, libSearch]);

    const resumeBook = useMemo(() => {
        const lastId = readStoredId();
        if (lastId) {
            const found = combinedLibrary.find((b) => b.id === lastId);
            if (found) return found;
        }
        return effectiveOwnedBooks[0] || combinedLibrary[0] || null;
    }, [combinedLibrary, effectiveOwnedBooks]);

    const pggiCountryCode = detectCountryCode(fullProfile?.country || country);
    const diagnosedRec = useMemo(
        () => (diagnosedStage ? getRecommendation(diagnosedStage, pggiCountryCode) : null),
        [diagnosedStage, pggiCountryCode]
    );
    const diagnosedTargetSlug = diagnosedRec?.product?.slug || null;
    const diagnosedOwnedBook = diagnosedTargetSlug
        ? combinedLibrary.find((b) => b.slug === diagnosedTargetSlug)
        : null;
    const homeOwnedShelfBooks = effectiveOwnedBooks.length > 0
        ? effectiveOwnedBooks
        : (effectivePlan ? combinedLibrary.slice(0, 12) : []);

    const rawDisplayFirst = firstName.trim()
        || fullProfile?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || (isDemo ? 'Awa' : 'Lecteur');
    const rawDisplayFull = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : fullProfile?.full_name || user?.email?.split('@')[0] || 'Awa Diallo';
    const displayFirst = formatMemberName(rawDisplayFirst);
    const displayFull = formatMemberName(rawDisplayFull);
    const initials = displayFull.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'BB';

    const totalOwned = effectiveOwnedBooks.length;
    const readerRank = totalOwned >= 10 ? 'Lecteur Expert' : totalOwned >= 5 ? 'Lecteur Passionné' : 'Lecteur Débutant';
    const memberSince = isDemo ? '2026-06-15' : user?.created_at || authProfile?.created_at;
    const memberSinceLabel = memberSince
        ? new Date(memberSince).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : '2026';

    const showToast = (msg) => {
        setNotice(msg);
        setTimeout(() => setNotice(''), 3200);
    };

    const handleOpenRead = (book) => {
        saveLastReadBook(book);
        if (isDemo) showToast(`Aperçu : « ${book.title} »`);
    };

    const goTab = (next) => {
        const clean = normalizeAccountTab(next);
        const nextParams = {};
        if (clean !== 'home') nextParams.tab = clean;
        if (isDevPreview) nextParams.preview = '1';
        setSearchParams(nextParams, { replace: true });
        setMenuOpen(false);
        setDrawerOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSignOut = async () => {
        setMenuOpen(false);
        if (isDemo) {
            navigate('/login', { state: { from: '/account' } });
            return;
        }
        await signOut();
        navigate('/');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (isDemo) { showToast('Connectez-vous pour enregistrer vos modifications.'); return; }
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { first_name: firstName, last_name: lastName, phone, country },
            });
            if (error) throw error;
            const fullName = `${firstName} ${lastName}`.trim() || null;
            await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone.trim() || null,
                    country: country.trim() || null,
                })
                .eq('id', user.id);
            setFullProfile((prev) => (prev ? { ...prev, full_name: fullName, phone: phone.trim() || null, country: country.trim() || null } : prev));
            await refreshProfile();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            showToast(err.message || 'Erreur lors de l’enregistrement.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (isDemo) { showToast('Connectez-vous pour modifier votre mot de passe.'); return; }
        setIsSavingPwd(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setPassword('');
            showToast('Mot de passe mis à jour !');
        } catch (err) {
            showToast(err.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsSavingPwd(false);
        }
    };

    const handleAvatarUpload = async (e, kind = 'avatar') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isDemo) { showToast('Connectez-vous pour modifier votre photo.'); return; }
        const setBusy = kind === 'cover' ? setUploadingCover : setUploadingAvatar;
        setBusy(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${kind === 'cover' ? 'cover-' : ''}${user.id}-${Date.now()}.${ext}`;
            const { error: upErr } = await supabase.storage.from('avatars').upload(path, file);
            if (upErr) throw upErr;
            const { data } = supabase.storage.from('avatars').getPublicUrl(path);
            const url = data.publicUrl;
            const { error: metaErr } = await supabase.auth.updateUser({ data: kind === 'cover' ? { cover_url: url } : { avatar_url: url } });
            if (metaErr) throw metaErr;
            if (kind === 'cover') setCoverUrl(url);
            else setAvatarUrl(url);
            showToast('Image mise à jour !');
        } catch (err) {
            showToast(err.message || 'Erreur lors de l’envoi.');
        } finally {
            setBusy(false);
        }
    };

    if (authLoading || (!canPreview && !user)) {
        return (
            <div className="acc2" style={{ justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <div className="spinner" />
            </div>
        );
    }

    const navItems = [
        { id: 'home', label: 'Accueil', icon: 'home' },
        { id: 'library', label: 'Mes livres', icon: 'auto_stories', count: combinedLibrary.length },
        { id: 'settings', label: 'Paramètres', icon: 'settings' },
    ];

    return (
        <div className="acc2">
            {notice && (
                <div
                    role="status"
                    style={{
                        position: 'fixed', bottom: 20, right: 20, zIndex: 120,
                        background: '#0B0F14', color: '#fff', padding: '11px 18px',
                        borderRadius: 999, boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                        fontSize: 13.5, fontWeight: 700,
                    }}
                >
                    {notice}
                </div>
            )}

            {/* ── Barre supérieure épurée (menu hamburger à gauche, recherche à droite) ── */}
            <header className="acc2-header">
                <div className="acc2-header-inner">
                    <div className="acc2-header-left">
                        <button type="button" className="acc2-burger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
                            <AccIcon name="menu" size={23} />
                        </button>
                        {tab !== 'home' && (
                            <button type="button" className="acc2-quiet-link" onClick={() => goTab('home')}>
                                ← Accueil
                            </button>
                        )}
                    </div>

                    <div className="acc2-header-right" />
                </div>
            </header>

            {/* Drawer navigation */}
            <div className={`acc2-drawer-backdrop${drawerOpen ? ' is-open' : ''}`} onClick={() => setDrawerOpen(false)} />
            <aside className={`acc2-drawer${drawerOpen ? ' is-open' : ''}`} aria-label="Menu compte">
                <div className="acc2-drawer-head">
                    <Link
                        to={user ? '/account' : '/'}
                        className="acc2-logo-name"
                        style={{ textDecoration: 'none' }}
                        onClick={() => {
                            setDrawerOpen(false);
                            if (user) goTab('home');
                        }}
                    >
                        BoomBooks
                    </Link>
                    <button type="button" className="acc2-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fermer">
                        <AccIcon name="close" size={20} />
                    </button>
                </div>
                {isDemo && (
                    <div className="acc2-dd-preview">
                        <small>Tester un profil</small>
                        <div className="acc2-dd-chips">
                            {[
                                { id: 'no_test', label: 'Sans test' },
                                { id: 'batisseur', label: 'Bâtisseur' },
                                { id: 'discipline', label: 'Discipliné' },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`acc2-dd-chip${demoPreset === p.id ? ' is-active' : ''}`}
                                    onClick={() => setDemoPreset(p.id)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <nav className="acc2-drawer-nav">
                    {navItems.map((it) => (
                        <button
                            key={it.id}
                            type="button"
                            className={`acc2-drawer-btn${tab === it.id ? ' is-active' : ''}`}
                            onClick={() => goTab(it.id)}
                        >
                            <AccIcon name={it.icon} size={19} />
                            {it.label}
                            {it.count > 0 && <span className="acc2-nav-count" style={{ marginLeft: 'auto' }}>{it.count}</span>}
                        </button>
                    ))}
                    <div className="acc2-dd-sep" />
                    <Link to="/test-pggi" className="acc2-drawer-btn" onClick={() => setDrawerOpen(false)}>
                        <AccIcon name="rocket_launch" size={19} />
                        Test PGGI
                    </Link>
                    <button
                        type="button"
                        className="acc2-drawer-btn"
                        style={{ color: '#E41E3F', marginTop: 'auto' }}
                        onClick={handleSignOut}
                    >
                        <AccIcon name={isDemo ? 'login' : 'logout'} size={19} />
                        {isDemo ? 'Me connecter' : 'Se déconnecter'}
                    </button>
                </nav>
            </aside>

            {/* ── Entête profil pleine largeur sur Accueil (exacte à la capture) ── */}
            {tab === 'home' && (
                <section className="acc2-fb-hero">
                    <div className="acc2-fb-inner">
                        <div
                            className="acc2-fb-cover"
                            style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
                        >
                            <label
                                className="acc2-fb-cam acc2-fb-cam--cover"
                                title="Modifier la photo de couverture"
                                aria-label="Modifier la photo de couverture"
                                style={{ opacity: uploadingCover ? 0.6 : 1 }}
                            >
                                <AccIcon name="photo_camera" size={18} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleAvatarUpload(e, 'cover')}
                                    disabled={uploadingCover}
                                />
                            </label>
                        </div>

                        <div className="acc2-fb-identity">
                            <div className="acc2-fb-avatar-wrap">
                                <input
                                    id="acc2-avatar-input"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleAvatarUpload(e, 'avatar')}
                                    disabled={uploadingAvatar}
                                />
                                <label
                                    htmlFor="acc2-avatar-input"
                                    className="acc2-fb-avatar"
                                    title="Modifier la photo de profil"
                                    style={{ opacity: uploadingAvatar ? 0.65 : 1 }}
                                >
                                    {avatarUrl ? <img src={avatarUrl} alt={displayFull} /> : initials}
                                </label>
                                <label
                                    htmlFor="acc2-avatar-input"
                                    className="acc2-fb-cam acc2-fb-cam--avatar"
                                    title="Changer la photo"
                                    aria-label="Changer la photo"
                                >
                                    <AccIcon name="photo_camera" size={15} />
                                </label>
                            </div>

                            <div className="acc2-fb-text">
                                <div className="acc2-fb-name-row">
                                    <h1 className="acc2-welcome-title">{displayFull}</h1>
                                    <div className="acc2-user-wrap" ref={menuRef}>
                                        <button
                                            type="button"
                                            className="acc2-name-chevron"
                                            onClick={() => setMenuOpen((o) => !o)}
                                            aria-expanded={menuOpen}
                                            aria-label="Menu du compte"
                                        >
                                            <AccIcon name="expand_more" size={19} />
                                        </button>

                                        {menuOpen && (
                                            <div className="acc2-dropdown" role="menu">
                                                <div className="acc2-dd-head">
                                                    <strong>{displayFull}</strong>
                                                    <span>{user?.email || 'Aperçu visiteur'}</span>
                                                </div>

                                                {isDemo && (
                                                    <div className="acc2-dd-preview">
                                                        <small>Tester un profil</small>
                                                        <div className="acc2-dd-chips">
                                                            {[
                                                                { id: 'no_test', label: 'Sans test' },
                                                                { id: 'batisseur', label: 'Bâtisseur' },
                                                                { id: 'discipline', label: 'Discipliné' },
                                                            ].map((p) => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    className={`acc2-dd-chip${demoPreset === p.id ? ' is-active' : ''}`}
                                                                    onClick={() => setDemoPreset(p.id)}
                                                                >
                                                                    {p.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <button type="button" className="acc2-dd-item" onClick={() => goTab('library')}>
                                                    <span className="acc2-dd-left">
                                                        <AccIcon name="auto_stories" size={18} />
                                                        Mes livres ({combinedLibrary.length})
                                                    </span>
                                                </button>
                                                <Link to="/test-pggi" className="acc2-dd-item" onClick={() => setMenuOpen(false)}>
                                                    <span className="acc2-dd-left">
                                                        <AccIcon name="rocket_launch" size={18} />
                                                        Test PGGI
                                                    </span>
                                                </Link>
                                                <button type="button" className="acc2-dd-item" onClick={() => goTab('settings')}>
                                                    <span className="acc2-dd-left">
                                                        <AccIcon name="settings" size={18} />
                                                        Paramètres
                                                    </span>
                                                </button>
                                                <div className="acc2-dd-sep" />
                                                <button type="button" className="acc2-dd-item acc2-dd-item--danger" onClick={handleSignOut}>
                                                    <span className="acc2-dd-left">
                                                        <AccIcon name={isDemo ? 'login' : 'logout'} size={18} />
                                                        {isDemo ? 'Me connecter' : 'Se déconnecter'}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="acc2-fb-meta">
                                    <strong>{user?.email || 'visiteur@boombooks.shop'}</strong>
                                    {` · ${totalOwned} livre${totalOwned !== 1 ? 's' : ''} acquis`}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Lecture en cours (sans cadre, fond blanc + léger trait de séparation) ── */}
            {tab === 'home' && (
                <section className="acc2-reading-band">
                    <div className="acc2-fb-inner acc2-reading-band-inner">
                        <div className="acc2-card-top">
                            <span className="acc2-label">Lecture en cours</span>
                            <button type="button" className="acc2-quiet-link" onClick={() => goTab('library')}>
                                Mes livres →
                            </button>
                        </div>

                        {resumeBook ? (
                            <>
                                <div className="acc2-reading-body">
                                    <Link
                                        to={`/read/${resumeBook.id}`}
                                        onClick={() => handleOpenRead(resumeBook)}
                                        className="acc2-mini-cover"
                                    >
                                        {resumeBook.cover_url ? (
                                            <img src={resumeBook.cover_url} alt={resumeBook.title} />
                                        ) : (
                                            <AccIcon name="menu_book" size={30} style={{ color: '#1877F2' }} />
                                        )}
                                    </Link>
                                    <div className="acc2-reading-info">
                                        <h2>
                                            <Link
                                                to={`/read/${resumeBook.id}`}
                                                onClick={() => handleOpenRead(resumeBook)}
                                                className="acc2-reading-title-link"
                                            >
                                                {resumeBook.title}
                                            </Link>
                                        </h2>
                                        <p className="acc2-reading-author">{resumeBook.author || 'BoomBooks'}</p>
                                        <div className="acc2-bar">
                                            <div style={{ width: fullProfile?.total_pages_read ? `${Math.min(100, Math.max(20, fullProfile.total_pages_read % 100))}%` : '25%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="acc2-reading-actions acc2-reading-actions--split">
                                    <Link
                                        to={`/read/${resumeBook.id}`}
                                        className="acc2-reading-action acc2-reading-action--primary"
                                        onClick={() => handleOpenRead(resumeBook)}
                                    >
                                        Reprendre la lecture
                                    </Link>
                                    {(resumeBook.owned || !resumeBook.is_subscription || effectivePlan === 'batisseur' || effectivePlan === 'discipline') && (
                                        <a
                                            href={`https://breadapp.shop/read/${resumeBook.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="acc2-reading-action acc2-reading-action--offline"
                                        >
                                            <AccIcon name="download" size={15} />
                                            Lire hors ligne
                                        </a>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="acc2-reading-info">
                                    <h2>Votre bibliothèque est prête</h2>
                                    <p className="acc2-reading-author">Commencez avec « Réfléchissez et devenez riche » offert gratuitement sur la boutique.</p>
                                </div>
                                <div className="acc2-reading-actions">
                                    <a
                                        href={`${SHOP_ORIGIN}/book/reflechissez-et-devenez-riche-napoleon-hill-3`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="acc2-btn acc2-btn--red"
                                    >
                                        Obtenir le livre gratuit
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* ── Parcours PGGI (sans cadre, fond #F5F7F8 de la page d'accueil sans portraits) ── */}
            {tab === 'home' && (
                <section className="acc2-pggi-band" aria-label="Méthode PGGI">
                    {!diagnosedStage ? (
                        <div className="acc2-fb-inner acc2-pggi-hero">
                            <h2 className="acc2-pggi-hero-title" aria-label="L'Afrique s'enrichit. Apprenez à penser, gagner, gérer et investir.">
                                <span className="acc2-pggi-hero-line" aria-hidden="true">L’Afrique s’enrichit.</span>
                                <span className="acc2-pggi-hero-line" aria-hidden="true">
                                    Apprenez à <PggiWordRotator />
                                </span>
                            </h2>
                            <p className="acc2-pggi-hero-sub">{HERO_CONTENT.subtitle}</p>
                            <Link to="/test-pggi" className="acc2-cta-red">
                                {HERO_CONTENT.ctaLabel}
                            </Link>
                        </div>
                    ) : diagnosedRec && (
                        <div className="acc2-fb-inner acc2-pggi-diagnosed">
                            <div className="acc2-card-top">
                                <span className="acc2-label">Votre étape PGGI · {STAGE_LABELS[diagnosedStage] || diagnosedStage.toUpperCase()}</span>
                                <Link to="/test-pggi" className="acc2-quiet-link">Refaire le test</Link>
                            </div>

                            <div className="acc2-pggi-diag-head">
                                <h2 className="acc2-pggi-diag-title">
                                    Vous êtes à l’étape {STAGE_NAMES[diagnosedStage] || diagnosedStage}
                                </h2>
                                <p className="acc2-pggi-diag-msg">{diagnosedRec.message}</p>
                            </div>

                            <div className="acc2-pggi-todo">
                                <div className="acc2-pggi-todo-book">
                                    <div className="acc2-pggi-thumb">
                                        {diagnosedRec.product.image ? (
                                            <img src={diagnosedRec.product.image} alt={diagnosedRec.product.title} />
                                        ) : (
                                            <AccIcon name={diagnosedRec.product.icon || 'auto_stories'} size={26} />
                                        )}
                                    </div>
                                    <div className="acc2-pggi-todo-text">
                                        <span className="acc2-pggi-todo-kicker">Ce que vous devez faire</span>
                                        <strong>{diagnosedRec.product.title}</strong>
                                        <span>{diagnosedRec.product.note}</span>
                                    </div>
                                </div>

                                <div className="acc2-pggi-todo-actions">
                                    {diagnosedOwnedBook ? (
                                        <Link
                                            to={`/read/${diagnosedOwnedBook.id}`}
                                            className="acc2-btn acc2-btn--blue"
                                            onClick={() => handleOpenRead(diagnosedOwnedBook)}
                                        >
                                            Lire maintenant
                                        </Link>
                                    ) : (
                                        <a
                                            href={diagnosedRec.product.cta.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="acc2-btn acc2-btn--red"
                                        >
                                            {diagnosedRec.product.cta.label}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ── Mes livres (1 ligne défilante) ── */}
            {tab === 'home' && (
                <AccountBookShelf
                    title="Mes livres"
                    count={homeOwnedShelfBooks.length}
                    action={(
                        <button type="button" className="acc2-shelf-cta" onClick={() => goTab('library')}>
                            Ma bibliothèque →
                        </button>
                    )}
                    books={homeOwnedShelfBooks}
                    loading={Boolean(loadingData && user)}
                    renderCard={(book) => (
                        <OwnedShelfCard
                            key={book.id}
                            book={book}
                            subPlan={effectivePlan}
                            isDemo={isDemo}
                            onOpenRead={handleOpenRead}
                        />
                    )}
                    emptyState={(
                        <div className="acc2-empty">
                            <AccIcon name="menu_book" size={40} style={{ color: '#1877F2' }} />
                            <h3>Aucun livre acquis pour le moment</h3>
                            <p>Obtenez « Réfléchissez et devenez riche » ou découvrez nos livres sur la boutique boombooks.shop.</p>
                            <a href={SHOP_ORIGIN} target="_blank" rel="noopener noreferrer" className="acc2-btn acc2-btn--blue">
                                Aller sur la boutique
                            </a>
                        </div>
                    )}
                />
            )}

            {/* ════════ CONTENU PRINCIPAL ════════ */}
            <main className="acc2-main">
                <div className="acc2-wrap">
                    {/* ══ ONGLET MES LIVRES (Présentation exacte Ma Bibliothèque) ══ */}
                    {tab === 'library' && (
                        <section className="acc2-library">
                            <div className="mybooks-header-bar">
                                <div className="mybooks-header-left-side">
                                    <h1 className="mybooks-header-title-bar">Ma Bibliothèque</h1>
                                    <div className="mybooks-header-stats-bar">
                                        <span>
                                            {combinedLibrary.length} livre{combinedLibrary.length !== 1 ? 's' : ''} dans votre collection
                                        </span>
                                        <span className="mybooks-header-stats-dot">•</span>
                                        <span>
                                            {Math.max(0, categories.length - 1)} catégorie{categories.length - 1 !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                {effectivePlan && (
                                    <div className="acc2-library-plan-pills">
                                        {[
                                            { id: 'all', label: 'Tous' },
                                            { id: 'owned', label: `Mes achats (${effectiveOwnedBooks.length})` },
                                            { id: 'sub', label: 'Inclus abonnement' },
                                        ].map((f) => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                className={`mybooks-cat-pill${libFilter === f.id ? ' active' : ''}`}
                                                onClick={() => setLibFilter(f.id)}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {effectivePlan !== 'lecteur' && (
                                <div className="mybooks-offline-banner-wrap">
                                    <a
                                        href="https://breadapp.shop"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mybooks-header-bread-btn"
                                    >
                                        <AccIcon name="offline_bolt" size={16} />
                                        Lire hors ligne avec BoomRead
                                    </a>
                                </div>
                            )}

                            <div className="mybooks-toolbar">
                                <div className="mybooks-search-wrap">
                                    <AccIcon name="search" size={18} style={{ color: '#5B6472', flexShrink: 0 }} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un livre ou un auteur..."
                                        value={libSearch}
                                        onChange={(e) => setLibSearch(e.target.value)}
                                        className="mybooks-search-input"
                                    />
                                    {libSearch && (
                                        <button
                                            type="button"
                                            className="mybooks-search-clear"
                                            onClick={() => setLibSearch('')}
                                            aria-label="Effacer la recherche"
                                        >
                                            <AccIcon name="close" size={13} style={{ color: '#fff' }} />
                                        </button>
                                    )}
                                </div>
                                <div className="mybooks-toolbar-right">
                                    <div className="mybooks-view-toggle">
                                        {[
                                            { v: 'grid', icon: 'grid_view', label: 'Grille' },
                                            { v: 'list', icon: 'view_list', label: 'Liste' },
                                        ].map((t) => (
                                            <button
                                                key={t.v}
                                                type="button"
                                                onClick={() => setLibView(t.v)}
                                                className={`mybooks-view-btn${libView === t.v ? ' active' : ''}`}
                                                title={t.label}
                                                aria-label={t.label}
                                            >
                                                <AccIcon name={t.icon} size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {categories.length > 2 && (
                                <div className="mybooks-categories hide-scrollbar">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`mybooks-cat-pill${libCat === cat ? ' active' : ''}`}
                                            onClick={() => setLibCat(cat)}
                                        >
                                            {cat === 'all' ? 'Tous' : cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredLibrary.length === 0 ? (
                                <div className="mybooks-empty">
                                    <div className="mybooks-empty-icon">
                                        <AccIcon name="menu_book" size={48} style={{ color: '#5B6472' }} />
                                    </div>
                                    <h3>{libSearch || libCat !== 'all' || libFilter !== 'all' ? 'Aucun livre trouvé' : 'Votre bibliothèque est vide'}</h3>
                                    <p>
                                        {libSearch || libCat !== 'all' || libFilter !== 'all'
                                            ? 'Essayez un autre filtre ou terme de recherche'
                                            : 'Explorez notre catalogue et commencez votre collection'}
                                    </p>
                                    {(libSearch || libCat !== 'all' || libFilter !== 'all') ? (
                                        <button
                                            type="button"
                                            className="acc2-btn acc2-btn--blue"
                                            style={{ marginTop: 12 }}
                                            onClick={() => { setLibSearch(''); setLibCat('all'); setLibFilter('all'); }}
                                        >
                                            Tout afficher
                                        </button>
                                    ) : (
                                        <a href={SHOP_ORIGIN} target="_blank" rel="noopener noreferrer" className="acc2-btn acc2-btn--blue" style={{ marginTop: 12 }}>
                                            Voir les livres sur boombooks.shop
                                        </a>
                                    )}
                                </div>
                            ) : libView === 'grid' ? (
                                <>
                                    <div className="mybooks-grid">
                                        {filteredLibrary.slice(0, libLimit).map((book) => (
                                            <LibraryGridCard
                                                key={book.id}
                                                book={book}
                                                subPlan={effectivePlan}
                                                isDemo={isDemo}
                                                onOpenRead={handleOpenRead}
                                            />
                                        ))}
                                    </div>
                                    {filteredLibrary.length > libLimit && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
                                            <button type="button" className="acc2-btn acc2-btn--soft" onClick={() => setLibLimit((n) => n + 40)}>
                                                Afficher plus ({filteredLibrary.length - libLimit})
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="mybooks-list">
                                        {filteredLibrary.slice(0, libLimit).map((book) => (
                                            <LibraryListItem
                                                key={book.id}
                                                book={book}
                                                subPlan={effectivePlan}
                                                isDemo={isDemo}
                                                onOpenRead={handleOpenRead}
                                            />
                                        ))}
                                    </div>
                                    {filteredLibrary.length > libLimit && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
                                            <button type="button" className="acc2-btn acc2-btn--soft" onClick={() => setLibLimit((n) => n + 40)}>
                                                Afficher plus ({filteredLibrary.length - libLimit})
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    )}

                    {/* ══ ONGLET PARAMÈTRES (Sans grand carré, sections épurées & champs de saisie) ══ */}
                    {tab === 'settings' && (
                        <section>
                            <div className="acc2-shelf-head">
                                <h1 className="acc2-welcome-title">Paramètres</h1>
                            </div>
                            <div className="acc2-settings-wrap">
                                <form className="acc2-settings-section" onSubmit={handleSaveProfile}>
                                    <h3>Informations personnelles</h3>
                                    <p className="acc2-panel-sub">
                                        {readerRank} · Membre depuis {memberSinceLabel} · Sert aussi à préremplir vos paiements et adapter BRVM / BVMAC.
                                    </p>

                                    <div className="acc2-form-grid">
                                        <div className="acc2-field">
                                            <label htmlFor="acc2-fname">Prénom</label>
                                            <input id="acc2-fname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Awa" />
                                        </div>
                                        <div className="acc2-field">
                                            <label htmlFor="acc2-lname">Nom</label>
                                            <input id="acc2-lname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Diallo" />
                                        </div>
                                        <div className="acc2-field">
                                            <label htmlFor="acc2-phone">Numéro WhatsApp / Téléphone</label>
                                            <input id="acc2-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00 00" />
                                        </div>
                                        <div className="acc2-field">
                                            <label htmlFor="acc2-country">Pays de résidence</label>
                                            <input id="acc2-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Côte d’Ivoire" />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                        {saveSuccess ? <span style={{ color: '#059669', fontSize: 13.5, fontWeight: 700 }}>Enregistré !</span> : <span />}
                                        <button type="submit" className="acc2-btn acc2-btn--blue" disabled={isSaving}>
                                            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>

                                <form className="acc2-settings-section" onSubmit={handleChangePassword}>
                                    <h3>Sécurité &amp; mot de passe</h3>
                                    <p className="acc2-panel-sub">{user?.email || 'visiteur@boombooks.shop'}</p>
                                    <div className="acc2-field" style={{ marginBottom: 14 }}>
                                        <label htmlFor="acc2-pwd">Nouveau mot de passe</label>
                                        <input
                                            id="acc2-pwd"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="acc2-btn acc2-btn--red" disabled={isSavingPwd || password.length < 6}>
                                        {isSavingPwd ? 'Mise à jour…' : 'Modifier'}
                                    </button>
                                </form>

                                <div className="acc2-settings-section">
                                    <h3>Outils, aide &amp; session</h3>
                                    <p className="acc2-panel-sub">{totalOwned} livre(s) acquis</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {effectivePlan !== 'lecteur' && (
                                            <a href="https://breadapp.shop" target="_blank" rel="noopener noreferrer" className="acc2-btn acc2-btn--soft">
                                                BoomRead hors ligne
                                            </a>
                                        )}
                                        <a
                                            href={whatsappLink(`Bonjour BoomBooks, besoin d'aide sur mon compte (${displayFirst}).`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="acc2-btn acc2-btn--soft"
                                        >
                                            Support WhatsApp
                                        </a>
                                        <button type="button" className="acc2-btn acc2-btn--soft" onClick={handleSignOut}>
                                            {isDemo ? 'Se connecter' : 'Se déconnecter'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* ── Footer clair et sobre (sans numéro WhatsApp) ── */}
            <footer className="acc2-footer">
                <div className="acc2-wrap acc2-footer-inner">
                    <div>
                        <Link to={user ? '/account' : '/'} style={{ textDecoration: 'none' }}>
                            <strong style={{ color: '#1877F2' }}>BoomBooks</strong>
                        </Link>
                        <span style={{ marginLeft: 8, fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', color: '#E41E3F', fontSize: 12 }}>
                            l&apos;antidote de l&apos;ignorance
                        </span>
                    </div>
                    <div className="acc2-footer-links">
                        <Link to={user ? '/account' : '/'} onClick={user ? () => goTab('home') : undefined}>Accueil</Link>
                        <Link to="/test-pggi">Test PGGI</Link>
                        <a href={SHOP_ORIGIN} target="_blank" rel="noopener noreferrer">Boutique</a>
                        <Link to="/faq">FAQ</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
