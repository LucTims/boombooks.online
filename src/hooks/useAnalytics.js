import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function generateSessionId() {
    let sid = sessionStorage.getItem('bb_session_id');
    if (!sid) {
        sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('bb_session_id', sid);
    }
    return sid;
}

export function useAnalytics() {
    const location = useLocation();
    const currentViewId = useRef(null);
    const startTime = useRef(null);

    useEffect(() => {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/studio')) return;

        const sessionId = generateSessionId();
        
        // Capture utm_source si présent dans l'URL et le sauvegarder
        const params = new URLSearchParams(window.location.search);
        let trafficSource = params.get('utm_source') || sessionStorage.getItem('bb_traffic_source');
        if (!trafficSource && document.referrer) {
            try {
                const url = new URL(document.referrer);
                if (url.hostname !== window.location.hostname) {
                    trafficSource = url.hostname;
                }
            } catch { /* ignore invalid referrer */ }
        }
        if (trafficSource) {
            sessionStorage.setItem('bb_traffic_source', trafficSource);
        }

        const path = location.pathname;

        // Fonction pour envoyer la vue
        async function recordView() {
            startTime.current = Date.now();
            const viewId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            currentViewId.current = viewId;
            
            await supabase
                .from('page_views')
                .insert({
                    id: viewId,
                    path: path,
                    session_id: sessionId,
                    traffic_source: trafficSource || null,
                    duration_seconds: 0
                });
        }

        recordView();

        // Fonction de nettoyage exécutée quand on quitte la page
        return () => {
            if (currentViewId.current && startTime.current) {
                const duration = Math.round((Date.now() - startTime.current) / 1000);
                supabase
                    .rpc('update_page_view_duration', {
                        p_view_id: currentViewId.current,
                        p_session_id: sessionId,
                        p_duration: duration
                    })
                    .then(() => {});
            }
        };
    }, [location.pathname]);

    // Gérer la fermeture de l'onglet/navigateur
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && currentViewId.current && startTime.current) {
                const duration = Math.round((Date.now() - startTime.current) / 1000);
                const sessionId = generateSessionId();
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/update_page_view_duration`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                        p_view_id: currentViewId.current,
                        p_session_id: sessionId,
                        p_duration: duration
                    }),
                    keepalive: true
                });
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
}
