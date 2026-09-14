import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatPrice, normalizeArea } from '../utils/formatters';
import { ListingCard } from '../components/ListingCard';
import { ArrowLeft, Bed, Bath, Layers, Phone, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';

export const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        let item = null;
        try {
          const res = await api.get(`/v1/listings/${id}`);
          item = res.data;
        } catch {
          const fallback = await api.get(`/v1/listing/${id}`);
          item = fallback.data;
        }
        setListing(item);

        try {
          const simRes = await api.get(`/v1/listings/${id}/similar`);
          setSimilar(simRes.data.results || simRes.data || []);
        } catch {
          setSimilar([]);
        }
      } catch (err) {
        console.error('Failed to load listing details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading property record...</div>;
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Property Not Found</h2>
        <Link to="/" className="mt-4 inline-block text-emerald-600 underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  const area = normalizeArea(listing.carpet_area, listing.website);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-slate-800 text-white">
                {listing.website}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {listing.listing_id}</span>
              {listing.is_verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {listing.apartment_name || listing.title}
            </h1>
            <p className="text-slate-500 capitalize text-sm">{listing.locality}</p>
          </div>

          <div className="md:text-right">
            <div className="text-3xl font-extrabold text-emerald-700">{formatPrice(listing.price)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Rate: ₹{Math.round(listing.price / area.sqft).toLocaleString('en-IN')}/sqft
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Bedrooms</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-1">
              <Bed className="w-4 h-4 text-emerald-600" /> {listing.bedroom} BHK
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Bathrooms</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-1">
              <Bath className="w-4 h-4 text-emerald-600" /> {listing.bathroom}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Carpet Area</span>
            <span className="font-semibold text-slate-800 block mt-1">
              {area.sqft} sqft {area.isSqm && `(${area.rawSqm} sqm)`}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Floor</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-1">
              <Layers className="w-4 h-4 text-emerald-600" /> {listing.floor} of {listing.total_floors}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {listing.description || 'No description provided by seller.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Seller: {listing.posted_by_name} ({listing.posted_by_contact})</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Posted: {new Date(listing.posted_at).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Similar Properties Nearby</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {similar.slice(0, 4).map((item) => (
              <ListingCard key={item.listing_id} listing={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};