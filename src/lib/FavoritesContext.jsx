import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'boombooks_favorites';

export const FavoritesContext = createContext({
    favorites: [],
    toggleFavorite: async () => {},
    isFavorite: () => false,
    loading: true
});

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);
            try {
                if (user) {
                    // Sync local to DB on login
                    const localFavs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                    if (localFavs.length > 0) {
                        const payload = localFavs.map(bookId => ({ user_id: user.id, book_id: bookId }));
                        await supabase.from('favorites').upsert(payload, { onConflict: 'user_id,book_id', ignoreDuplicates: true });
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                    
                    // Fetch from DB
                    const { data, error } = await supabase.from('favorites').select('book_id');
                    if (error) throw error;
                    setFavorites(data.map(f => f.book_id));
                } else {
                    // Load from local storage
                    const localFavs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                    setFavorites(localFavs);
                }
            } catch (err) {
                console.error("Error loading favorites:", err);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [user]);

    const toggleFavorite = async (bookId) => {
        if (user) {
            // Check if already in favorites
            const isFav = favorites.includes(bookId);
            const newFavorites = isFav ? favorites.filter(id => id !== bookId) : [...favorites, bookId];
            
            // Optimistic update
            setFavorites(newFavorites);
            
            try {
                if (isFav) {
                    await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', bookId);
                } else {
                    await supabase.from('favorites').insert({ user_id: user.id, book_id: bookId });
                }
            } catch (err) {
                console.error("Error toggling favorite:", err);
                // Revert if error
                setFavorites(favorites);
            }
        } else {
            // Local storage strategy
            const localFavs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            const isFav = localFavs.includes(bookId);
            const newFavorites = isFav ? localFavs.filter(id => id !== bookId) : [...localFavs, bookId];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        }
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            toggleFavorite,
            isFavorite: (bookId) => favorites.includes(bookId),
            loading
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}
