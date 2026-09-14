import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bed, Bath, Layers, AlertTriangle } from 'lucide-react';
import { formatPrice, normalizeArea } from '../utils/formatters';
import { useFavourites } from '../context/FavouritesContext';

export const ListingCard = ({ listing }) => {
  const { favouriteIds, toggleFavourite } = useFavourites();
  const id = listing.listing_id || listing.id;
  const isSaved = favouriteIds.has(id);
  const area = normalizeArea(listing.carpet_area, listing.website);

  const isCorrupt =
    listing.price <= 0 ||
    (listing.floor !== null &&
      listing.total_floors !== null &&
      listing.floor > listing.total_floors) ||
    (listing.carpet_area &&
      listing.super_built_up_area &&
      listing.carpet_area > listing.super_built_up_area);

  const isFake = listing.price > 0 && listing.price < 100000;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="relative h-44 bg-slate-100 p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-800 text-white tracking-wider">
                {listing.website || 'Direct'}
              </span>
              {listing.is_live === false && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Withdrawn / Inactive
                </span>
              )}
              {isCorrupt && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Corrupt Data
                </span>
              )}
              {isFake && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                  Enquiry Bait
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavourite(listing);
              }}
              className="p-2 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition text-slate-700 hover:text-rose-500"
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>

          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatPrice(listing.price)}
            </div>
            <div className="text-xs text-slate-500">
              {area.isSqm ? (
                <span>
                  {area.sqft} sqft{' '}
                  <span className="text-[10px] text-emerald-600">
                    (converted from {area.rawSqm} sqm)
                  </span>
                </span>
              ) : (
                `${area.sqft} sqft`
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-800 truncate">
            {listing.apartment_name || listing.title || 'Property Unit'}
          </h3>
          <p className="text-xs text-slate-500 capitalize mt-0.5">
            {listing.locality || 'Unknown locality'}
          </p>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              {listing.bedroom || 0} BHK
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              {listing.bathroom || 0} Bath
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Floor {listing.floor ?? '-'}/{listing.total_floors ?? '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link
          to={`/listings/${id}`}
          className="block text-center w-full py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
};