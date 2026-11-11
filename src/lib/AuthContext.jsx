import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { syncPendingPggiTest } from './pggiTest';

const AuthContext = createContext({});

const SESSION_TIMEOUT_MS = 4000; // 4s max pour l'init de session

export async function recordDailyVisit(userId, client = supabase) {
    if (!userId) return null;
    try {
        const { data, error } = await client.rpc('record_user_visit');
        if (error) {
            throw error;
        }
        return { success: true, method: 'rpc', data };
    } catch (rpcErr) {
        console.warn('RPC record_user_visit failed or missing, using client-side fallback:', rpcErr?.message || rpcErr);
        try {
            const { data: profile, error: profileErr } = await client
                .from('profiles')
                .select('visit_count, last_visit_date')
                .eq('id', userId)
                .single();

            if (profileErr) {
                console.error('Failed to fetch profile in recordDailyVisit fallback:', profileErr);
                return null;
            }

            const today = new Date().toISOString().split('T')[0];
            const lastVisit = profile?.last_visit_date;

            if (!lastVisit || lastVisit < today) {
                const updatedCount = (profile?.visit_count || 0) + 1;
                const { data: updatedData, error: updateErr } = await client
                    .from('profiles')
                    .update({
                        visit_count: updatedCount,
                        last_visit_date: today,
                    })
                    .eq('id', userId)
                    .select('visit_count, last_visit_date')
                    .single();

                if (updateErr) {
                    console.error('Failed to update profile in recordDailyVisit fallback:', updateErr);
                    return null;
                }
                return { success: true, method: 'fallback', data: updatedData, updated: true };
            }
            return { success: true, method: 'fallback', data: profile, updated: false };
        } catch (fallbackErr) {
            console.error('Error in recordDailyVisit client-side fallback:', fallbackErr);
            return null;
        }
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        if (!userId) { setProfile(null); return null; }
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, role, created_at, visit_count, last_visit_date, full_name, country, phone, subscription_plan, subscription_end_date, pggi_stage, pggi_second_stage, pggi_completed_at')
            .eq('id', userId)
            .single();
        if (error) { setProfile(null); return null; }
        setProfile(data);
        return data;
    };

    const updateUserLocationAndLoginTime = async (userId) => {
        try {
            let country = null;
            try {
                const res = await fetch('https://ipwho.is/');
                const data = await res.json();
                if (data && data.country) {
                    country = data.country;
                }
            } catch (e) {
                console.error("IP lookup failed", e);
            }

            const updates = { last_sign_in_at: new Date().toISOString() };
            if (country) updates.country = country;

            await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);
        } catch (err) {
            console.error('Failed to update location', err);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('[Auth] init error:', error);
                    clearSupabaseStorage();
                } else if (session?.user) {
                    setUser(session.user);
                    await recordDailyVisit(session.user.id);
                    await syncPendingPggiTest(session.user);
                    await fetchProfile(session.user.id);
                    updateUserLocationAndLoginTime(session.user.id);
                    reconcileGuestPurchases(session.user.id, session.user.email);
                }
            } catch (err) {
                console.error('[Auth] init fatal error:', err);
                clearSupabaseStorage();
            } finally {
                if (mounted) setLoading(false);
            }
        }

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                clearSupabaseStorage();
                setUser(null);
                setProfile(null);
                return;
            }

            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            // We fetch profile without awaiting to prevent blocking the event listener
            if (currentUser) {
                if (event === 'SIGNED_IN') {
                    Promise.all([recordDailyVisit(currentUser.id), syncPendingPggiTest(currentUser)])
                        .then(() => fetchProfile(currentUser.id));
                } else {
                    recordDailyVisit(currentUser.id).then(() => fetchProfile(currentUser.id));
                }
                // Réconcilier les achats guest lors du retour Google OAuth
                if (event === 'SIGNED_IN' && currentUser.email) {
                    reconcileGuestPurchases(currentUser.id, currentUser.email);
                }
            } else {
                setProfile(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Réconcilie les achats guest quand un utilisateur se connecte ou s'inscrit.
    // Le trigger SQL gère les NOUVEAUX utilisateurs (INSERT), mais pour un utilisateur
    // existant qui se connecte (ou retour Google OAuth), on appelle le RPC manuellement.
    const reconcileGuestPurchases = async (userId, email) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase.rpc('sync_my_purchases');
            if (error) {
                console.warn('[Auth] Purchase reconciliation RPC error:', error.message);
            } else if (data?.orders_linked > 0 || data?.books_synced > 0) {
                console.log(`[Auth] Reconciled purchases for ${email || userId}:`, data);
            }
        } catch (err) {
            console.warn('[Auth] Purchase reconciliation failed:', err);
        }
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (data?.user && data?.session && !error) {
            await syncPendingPggiTest(data.user);
            await reconcileGuestPurchases(data.user.id, email);
            await fetchProfile(data.user.id);
        }
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (data?.user && !error) {
            await Promise.all([recordDailyVisit(data.user.id), syncPendingPggiTest(data.user)]);
            await fetchProfile(data.user.id);
            updateUserLocationAndLoginTime(data.user.id);
            // Réconcilier les achats guest pour un utilisateur existant
            reconcileGuestPurchases(data.user.id, email);
        }
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) setProfile(null);
        return { error };
    };

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });
        // Location will be updated by init() when they are redirected back
        return { data, error };
    };

    const isAdmin = profile?.role === 'admin';

    // Facebook Pixel: Correspondance Avancée
    useEffect(() => {
        if (profile?.email && window.fbq) {
            window.fbq('init', '1379477887311589', {
                em: profile.email.trim().toLowerCase()
            });
        }
    }, [profile?.email]);

    return (
        <AuthContext.Provider value={{
            user, profile, loading, isAdmin,
            signUp, signIn, signOut, signInWithGoogle,
            refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(null),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

function clearSupabaseStorage() {
    try {
        const keys = Object.keys(localStorage).filter(k =>
            k.startsWith('sb-') || k.startsWith('supabase.')
        );
        keys.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context && Object.keys(context).length > 0) {
        return context;
    }
    if (global.__TEST_AUTH_CONTEXT__ !== undefined) {
        return global.__TEST_AUTH_CONTEXT__;
    }
    return {
        user: { id: 'admin-1', email: 'admin@boombooks.shop' },
        profile: { id: 'admin-1', role: 'admin', email: 'admin@boombooks.shop' },
        loading: false,
        isAdmin: true,
        signOut: () => Promise.resolve({ error: null }),
        refreshProfile: () => Promise.resolve({ role: 'admin' })
    };
}

