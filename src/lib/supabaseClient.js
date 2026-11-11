import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

function readJwtLifetimeSeconds(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { iat, exp } = JSON.parse(atob(payload));
    return iat && exp ? exp - iat : null;
  } catch {
    return null;
  }
}

// auth-js compare `expires_at` (heure du serveur) à Date.now() (horloge de l'appareil).
// Sur un téléphone dont l'horloge est fausse (heure manuelle, mauvais fuseau), chaque
// jeton paraît expiré (boucle de refresh → 429 → déconnexion) ou valide trop longtemps
// (requêtes rejetées en 401). On réécrit donc expires_at dans le référentiel de
// l'appareil au moment où un nouveau jeton est reçu.
const clockSkewSafeStorage = {
  getItem: (key) => localStorage.getItem(key),
  removeItem: (key) => localStorage.removeItem(key),
  setItem: (key, value) => {
    try {
      const session = JSON.parse(value);
      const lifetime = session?.access_token && readJwtLifetimeSeconds(session.access_token);
      if (lifetime) {
        const previous = JSON.parse(localStorage.getItem(key) || 'null');
        // Un même jeton peut être ré-enregistré plus tard (ex. mise à jour du user) :
        // on garde alors l'échéance calculée à sa réception.
        session.expires_at = previous?.access_token === session.access_token && previous.expires_at
          ? previous.expires_at
          : Math.floor(Date.now() / 1000) + lifetime;
        value = JSON.stringify(session);
      }
    } catch { /* valeur non-session (code-verifier PKCE, etc.) : stockée telle quelle */ }
    localStorage.setItem(key, value);
  },
};

// Client principal (auth + données protégées)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: clockSkewSafeStorage,
    // Verrou limité à l'onglet : avec le verrou par défaut (partagé entre onglets via
    // navigator.locks), un onglet mis en veille par le mobile pouvait le garder et bloquer
    // toutes les requêtes des autres onglets (ex. lien « mot de passe oublié »).
    lock: processLock,
  },
});

