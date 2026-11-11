import { useContext } from 'react';
import { FavoritesContext } from '../lib/FavoritesContext';

export function useFavorites() {
    return useContext(FavoritesContext);
}
