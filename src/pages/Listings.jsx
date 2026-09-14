import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { ListingCard } from '../components/ListingCard';
import { Filters } from '../components/Filters';
import { Loader2 } from 'lucide-react';

export const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState({
    locality: '',
    bhk: '',
    furnishing: '',
    minPrice: '',
    maxPrice: '',
    excludeInactive: true,
    excludeCorrupt: true,
  });

  const fetchListings = async (currentOffset = 0, append = false) => {
    setLoading(true);
    try {
      const res = await api.get('/v1/listings', {
        params: { limit: 50, offset: currentOffset },
      });
      const data = res.data;
      const results = data.results || [];
      setTotal(data.total || 0);
      setHasMore(data.has_more ?? results.length === 50);

      setListings((prev) => (append ? [...prev, ...results] : results));
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(0, false);
  }, []);

  const localities = useMemo(() => {
    return [...new Set(listings.map((l) => l.locality).filter(Boolean))].sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // 1. Inactive status filter
      if (filters.excludeInactive && l.is_live === false) return false;

      // 2. Data quality invariants
      if (filters.excludeCorrupt) {
        if (l.price <= 0 || (l.price > 0 && l.price < 100000)) return false;
        if (l.floor !== null && l.total_floors !== null && l.floor > l.total_floors) return false;
        if (l.carpet_area && l.super_built_up_area && l.carpet_area > l.super_built_up_area) return false;
      }

      // 3. Locality
      if (filters.locality && l.locality?.toLowerCase() !== filters.locality.toLowerCase()) return false;

      // 4. BHK
      if (filters.bhk) {
        if (filters.bhk === '4') {
          if (Number(l.bedroom) < 4) return false;
        } else if (String(l.bedroom) !== String(filters.bhk)) {
          return false;
        }
      }

      // 5. Furnishing
      if (filters.furnishing && l.furnishing !== filters.furnishing) return false;

      // 6. Price Range (Min / Max)
      const price = Number(l.price);
      if (filters.minPrice !== '' && !isNaN(Number(filters.minPrice))) {
        if (price < Number(filters.minPrice)) return false;
      }
      if (filters.maxPrice !== '' && !isNaN(Number(filters.maxPrice))) {
        if (price > Number(filters.maxPrice)) return false;
      }

      return true;
    });
  }, [listings, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sale Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredListings.length} matching properties (Total indexed: {total})
          </p>
        </div>
      </div>

      <Filters filters={filters} onChange={setFilters} localities={localities} />

      {loading && listings.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-base">No properties match your criteria</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your budget range, bedroom filters, or check if the target listings are currently inactive.
          </p>
          <button
            onClick={() =>
              setFilters({
                locality: '',
                bhk: '',
                furnishing: '',
                minPrice: '',
                maxPrice: '',
                excludeInactive: true,
                excludeCorrupt: true,
              })
            }
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.listing_id || listing.id} listing={listing} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  const nextOffset = offset + 50;
                  setOffset(nextOffset);
                  fetchListings(nextOffset, true);
                }}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Loading More...' : 'Load Next 50 Listings'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};