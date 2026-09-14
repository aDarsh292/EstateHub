import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext(null);

export const FavouritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);

  const storageKey = user?.email ? `ivy_saved_${user.email}` : 'ivy_saved_guest';

  const fetchFavourites = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/v1/saved');
      const items = res.data.results || [];
      setFavourites(items);
      setFavouriteIds(new Set(items.map((item) => item.listing_id || item.id)));
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('API /v1/saved failed, reading from localStorage fallback:', err);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavourites(parsed);
        setFavouriteIds(new Set(parsed.map((item) => item.listing_id || item.id)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchFavourites();
    } else {
      setFavourites([]);
      setFavouriteIds(new Set());
    }
  }, [isAuthenticated, user?.email]);

  const toggleFavourite = async (listing) => {
    const id = listing.listing_id || listing.id;
    const isSaved = favouriteIds.has(id);

    let updatedList = [];
    if (isSaved) {
      updatedList = favourites.filter((item) => (item.listing_id || item.id) !== id);
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setFavourites(updatedList);
    } else {
      updatedList = [...favourites, listing];
      setFavouriteIds((prev) => new Set(prev).add(id));
      setFavourites(updatedList);
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedList));

    try {
      if (isSaved) {
        await api.delete(`/v1/saved/${id}`);
      } else {
        await api.post('/v1/saved', { id, listing_id: id });
      }
    } catch (err) {
      console.warn('Failed to sync toggle with /v1/saved server:', err.response?.data || err.message);
    }
  };

  return (
    <FavouritesContext.Provider
      value={{ favourites, favouriteIds, toggleFavourite, fetchFavourites, loading }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);