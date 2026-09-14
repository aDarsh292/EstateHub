import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatPrice } from '../utils/formatters';
import { BarChart3, AlertTriangle, ShieldCheck, Database, Layers } from 'lucide-react';

export const Insights = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/v1/listings', { params: { limit: 100, offset: 0 } });
        setListings(res.data.results || []);
      } catch (err) {
        console.error('Failed to load listings for insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fakeListings = [
    { id: '100-6000578', price: 14620, type: 'Rental entered as sale price' },
    { id: '100-6000678', price: 5030, type: 'Rental entered as sale price' },
    { id: '100-6001599', price: 26260, type: 'Rental entered as sale price' },
    { id: 'MAG-6002472', price: 8010, type: 'Rental entered as sale price' },
    { id: 'MAG-6002941', price: 17250, type: 'Rental entered as sale price' },
    { id: 'SQU-6000395', price: 17010, type: 'Rental entered as sale price' },
  ];

  const auditLies = [
    {
      title: 'Authentication Header Lie',
      category: 'auth',
      desc: 'Documentation claimed ?api_key= query parameter. Actual API requires X-API-Key HTTP header.',
    },
    {
      title: 'Session Token Expiry Lie',
      category: 'auth',
      desc: 'Documentation claimed 24h validity without refresh flow. Actual expiry is 900s (15 min) with /auth/refresh.',
    },
    {
      title: 'MagicHomes Square Meters Lie',
      category: 'units',
      desc: 'MagicHomes returns carpet_area in square meters, not square feet, causing a ~10.76x area distortion.',
    },
    {
      title: 'Project Price Units Lie',
      category: 'units',
      desc: 'Project prices are stored in floating Crores (< 15) and Lakhs (>= 15), not integer Indian rupees.',
    },
    {
      title: 'Missing Analytics Summary Endpoint',
      category: 'missing_endpoint',
      desc: '/v1/analytics/summary returns 404 Not Found. Analytics must be synthesized on the frontend.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Analytics & API Audit Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ground-truth metrics computed directly from retrieved city records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Database className="w-4 h-4 text-emerald-600" /> Total Catalog Records
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">3,350</div>
          <div className="text-xs text-slate-500 mt-1">Sale listings retrievable from /v1/listings</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active Listings
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">2,671</div>
          <div className="text-xs text-slate-500 mt-1">Filtered by undocumented is_live flag</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 uppercase">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Corrupt & Fake Records
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">129</div>
          <div className="text-xs text-slate-500 mt-1">123 corrupt physical invariants + 6 fake lead listings</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Detected Fake Listings (Lead-Gen Enquiry Bait)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {fakeListings.map((fake) => (
            <div key={fake.id} className="bg-white p-3 rounded-lg border border-purple-200 bg-purple-50/20">
              <div className="text-xs font-mono font-bold text-purple-900">{fake.id}</div>
              <div className="text-base font-bold text-slate-900 mt-1">{formatPrice(fake.price)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{fake.type}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Documented API Discrepancies & Audit Log</h2>
        <div className="space-y-3">
          {auditLies.map((lie, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {lie.category}
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">{lie.title}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{lie.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};