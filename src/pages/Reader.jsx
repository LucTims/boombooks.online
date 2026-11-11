import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import './Reader.css';

const THEMES = [
    { id: 'dark', label: 'Sombre', bg: '#1a1a2e', swatch: '#1a1a2e' },
    { id: 'sepia', label: 'Sépia', bg: '#f4ecd8', swatch: '#f4ecd8' },
    { id: 'light', label: 'Clair', bg: '#e8e8e8', swatch: '#e8e8e8' },
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export default function Reader() {
    const { bookId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [pdfUrl, setPdfUrl] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(100);
    const [theme, setTheme] = useState('dark');
    const [showThemePanel, setShowThemePanel] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const containerRef = useRef(null);
    const themePanelRef = useRef(null);

    // Close theme panel on outside click
    useEffect(() => {
        function handleClick(e) {
            if (themePanelRef.current && !themePanelRef.current.contains(e.target)) {
                setShowThemePanel(false);
            }
        }
        if (showThemePanel) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showThemePanel]);

    // Load PDF — uses supabase.functions.invoke, with direct fallback
    const fetchPdf = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Ensure we have a valid session before calling
            const { data: sessionData } = await supabase.auth.getSession();
            let session = sessionData?.session;
            if (!session) {
                const { data: refreshData } = await supabase.auth.refreshSession();
                session = refreshData?.session;
                if (!session) {
                    navigate('/login', { state: { from: `/read/${bookId}` } });
                    return;
                }
            }

            let downloadUrl = null;
            let title = 'Livre';

            // Try Edge Function first
            try {
                const { data, error: fnErr } = await supabase.functions.invoke('get-download-url', {
                    body: { book_id: bookId, for_reading: true },
                });

                if (fnErr) {
                    let msg = fnErr.message || 'Erreur inconnue';
                    if (fnErr.context) {
                        try {
                            const body = await fnErr.context.json();
                            if (body?.error) msg = body.error;
                        } catch (_) {}
                    }
                    throw new Error(msg);
                }

                if (data?.error) throw new Error(data.error);
                if (data?.download_url) {
                    downloadUrl = data.download_url;
                    title = data.title || 'Livre';
                }
            } catch (edgeFnErr) {
                console.warn('[Reader] Edge Function failed, trying direct fallback:', edgeFnErr.message);
                
                // Fallback: fetch book info directly and create signed URL
                const { data: book } = await supabase
                    .from('books')
                    .select('title, file_url, file_path')
                    .eq('id', bookId)
                    .single();

                if (!book) throw new Error('Livre introuvable.');

                title = book.title || 'Livre';
                let bucketName = 'books';
                let storagePath = book.file_path || book.file_url;

                if (book.file_url && book.file_url.includes('/storage/v1/object/public/')) {
                    const parts = book.file_url.split('/storage/v1/object/public/')[1].split('/');
                    bucketName = parts[0];
                    if (!book.file_path) {
                        storagePath = parts.slice(1).join('/');
                    }
                }

                if (!storagePath) {
                    throw new Error('Le fichier PDF de ce livre n\'est pas encore disponible.');
                }

                // Try to create a signed URL using the user's session
                const { data: signed, error: signErr } = await supabase.storage
                    .from(bucketName)
                    .createSignedUrl(storagePath, 7200);

                if (signErr || !signed?.signedUrl) {
                    console.error('[Reader] Signed URL fallback error:', signErr);
                    throw new Error('Impossible de générer le lien de lecture. Réessayez.');
                }

                downloadUrl = signed.signedUrl;
            }

            if (!downloadUrl) throw new Error('Aucune URL de fichier reçue.');

            setPdfUrl(downloadUrl);
            setBookTitle(title);
        } catch (err) {
            console.error('[Reader] Error:', err);
            setError(err.message || 'Impossible de charger le livre.');
        } finally {
            setLoading(false);
        }
    }, [bookId, navigate]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login', { state: { from: `/read/${bookId}` } }); return; }
        fetchPdf();
    }, [user, authLoading, navigate, fetchPdf]);

    // Auto-renew URL every 90 minutes (URL is valid 2h)
    useEffect(() => {
        if (!pdfUrl) return;
        const id = setInterval(fetchPdf, 90 * 60 * 1000);
        return () => clearInterval(id);
    }, [pdfUrl, fetchPdf]);

    // Zoom
    const handleZoomIn = useCallback(() => {
        setZoom(prev => {
            const next = ZOOM_LEVELS.find(z => z > prev);
            return next || prev;
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => {
            const reversed = [...ZOOM_LEVELS].reverse();
            const next = reversed.find(z => z < prev);
            return next || prev;
        });
    }, []);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        function onFullscreenChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen?.();
                } else {
                    navigate(-1);
                }
            }
            if ((e.key === '+' || e.key === '=') && !e.ctrlKey) handleZoomIn();
            if (e.key === '-' && !e.ctrlKey) handleZoomOut();
            if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [navigate, handleZoomIn, handleZoomOut, toggleFullscreen]);

    // Build the PDF viewer URL
    const viewerUrl = pdfUrl
        ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
        : null;

    const themeClass = theme === 'sepia' ? 'sepia-mode' : theme === 'light' ? 'light-mode' : '';

    return (
        <div
            ref={containerRef}
            className={`reader-page ${isFullscreen ? 'fullscreen' : ''}`}
        >
            {/* ── Top Bar ─────────────────────────────── */}
            <div className="reader-topbar">
                <div className="reader-topbar-left">
                    <button
                        className="reader-back-btn"
                        onClick={() => navigate('/account?tab=library')}
                        title="Retour à ma bibliothèque"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="reader-book-info">
                        <div className="reader-book-title">{bookTitle || 'Chargement...'}</div>
                        <div className="reader-book-page-info">Lecture en cours</div>
                    </div>
                </div>

                <div className="reader-topbar-actions">
                    {/* Theme toggle */}
                    <div style={{ position: 'relative' }} ref={themePanelRef}>
                        <button
                            className={`reader-action-btn ${showThemePanel ? 'active' : ''}`}
                            onClick={() => setShowThemePanel(p => !p)}
                            title="Thème de lecture"
                        >
                            <span className="material-symbols-outlined">palette</span>
                        </button>

                        {showThemePanel && (
                            <div className="reader-theme-panel">
                                <div className="reader-theme-label">Thème de lecture</div>
                                <div className="reader-theme-options">
                                    {THEMES.map(t => (
                                        <button
                                            key={t.id}
                                            className={`reader-theme-option ${theme === t.id ? 'selected' : ''}`}
                                            onClick={() => setTheme(t.id)}
                                        >
                                            <div
                                                className="reader-theme-swatch"
                                                style={{ background: t.swatch }}
                                            />
                                            <span className="reader-theme-name">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fullscreen */}
                    <button
                        className={`reader-action-btn ${isFullscreen ? 'active' : ''}`}
                        onClick={toggleFullscreen}
                        title="Plein écran (F)"
                    >
                        <span className="material-symbols-outlined">
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Content ─────────────────────────────── */}
            {loading ? (
                <div className="reader-loading">
                    <div className="reader-loading-spinner" />
                    <div className="reader-loading-text">Préparation de votre lecture...</div>
                    <div className="reader-loading-subtitle">Chargement sécurisé du PDF</div>
                </div>
            ) : error ? (
                <div className="reader-error">
                    <div className="reader-error-icon">
                        <span className="material-symbols-outlined">error</span>
                    </div>
                    <div className="reader-error-title">Impossible de charger le livre</div>
                    <div className="reader-error-message">{error}</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="reader-error-btn" onClick={fetchPdf}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                            Réessayer
                        </button>
                        <button
                            className="reader-error-btn"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                            onClick={() => navigate('/account?tab=library')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                            Retour à ma bibliothèque
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`reader-viewport ${themeClass}`}>
                    <div
                        className="reader-pdf-container"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    >
                        <iframe
                            src={viewerUrl}
                            title={bookTitle}
                            style={{ pointerEvents: 'auto' }}
                            allow="fullscreen"
                        />
                    </div>
                </div>
            )}

            {/* ── Bottom Bar ─────────────────────────── */}
            {!loading && !error && (
                <div className="reader-bottombar">
                    <div className="reader-zoom-group">
                        <button
                            className="reader-zoom-btn"
                            onClick={handleZoomOut}
                            disabled={zoom <= ZOOM_LEVELS[0]}
                            title="Zoom arrière (-)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>remove</span>
                        </button>
                        <span className="reader-zoom-label">{zoom}%</span>
                        <button
                            className="reader-zoom-btn"
                            onClick={handleZoomIn}
                            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                            title="Zoom avant (+)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
