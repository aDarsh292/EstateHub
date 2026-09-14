import React from 'react';
import { useFavourites } from '../context/FavouritesContext';
import { ListingCard } from '../components/ListingCard';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Saved = () => {
  const { favourites, loading } = useFavourites();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          Saved Listings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {favourites.length} properties saved to your account
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : favourites.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No saved properties yet</h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any listing card to save properties for later review.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            Explore Sale Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favourites.map((item) => (
            <ListingCard key={item.listing_id || item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
};