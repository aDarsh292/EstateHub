import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatPrice } from '../utils/formatters';
import { KeyRound, Bed, Bath, Layers, Loader2 } from 'lucide-react';

export const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await api.get('/v1/rentals', { params: { limit: 50, offset: 0 } });
        setRentals(res.data.results || []);
      } catch (err) {
        console.error('Failed to load rentals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-emerald-600" />
          Rental Properties
        </h1>
        <p className="text-xs text-slate-500 mt-1">Verified rentals with transparent deposits</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rentals.map((r) => (
            <div key={r.listing_id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                    {r.locality}
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatPrice(r.price)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800 text-sm">{r.apartment_name || r.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Deposit: {formatPrice(r.deposit)}</p>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {r.bedroom} BHK</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {r.bathroom} Bath</span>
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {r.carpet_area} sqft</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};