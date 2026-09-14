import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatProjectPrice } from '../utils/formatters';
import { Building2, Layers, Loader2 } from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/v1/projects', { params: { limit: 50, offset: 0 } });
        setProjects(res.data.results || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          Builder Projects
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real estate developments and new societies</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.project_id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                    {p.project_status}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{p.apartment_name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{p.developer_name} • {p.locality}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                    {p.total_listings} Listings
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block">Price Range</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatProjectPrice(p.price_min)} - {formatProjectPrice(p.price_max)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Area Range</span>
                  <span className="font-medium text-slate-700">
                    {p.min_area_sqft} - {p.max_area_sqft} sqft
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>{p.total_units} Units</span>
                <span>{p.total_towers} Towers</span>
                <span>RERA: {p.rera_number || 'Applied'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};