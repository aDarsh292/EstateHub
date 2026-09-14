import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const PRICE_PRESETS = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under ₹50 L', min: 0, max: 5000000 },
  { label: '₹50 L – ₹1 Cr', min: 5000000, max: 10000000 },
  { label: '₹1 Cr – ₹2 Cr', min: 10000000, max: 20000000 },
  { label: '₹2 Cr – ₹4 Cr', min: 20000000, max: 40000000 },
  { label: 'Above ₹4 Cr', min: 40000000, max: '' },
];

export const Filters = ({ filters, onChange, localities }) => {
  const handlePresetChange = (e) => {
    const selected = PRICE_PRESETS[e.target.value];
    if (selected) {
      onChange({
        ...filters,
        minPrice: selected.min,
        maxPrice: selected.max,
      });
    }
  };

  const handleReset = () => {
    onChange({
      locality: '',
      bhk: '',
      furnishing: '',
      minPrice: '',
      maxPrice: '',
      excludeInactive: true,
      excludeCorrupt: true,
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Catalog</span>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        {/* Locality */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Locality</label>
          <select
            value={filters.locality}
            onChange={(e) => onChange({ ...filters, locality: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 capitalize"
          >
            <option value="">All Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc} className="capitalize">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* BHK */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Bedrooms</label>
          <select
            value={filters.bhk}
            onChange={(e) => onChange({ ...filters, bhk: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        {/* Budget Preset */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Budget Bracket</label>
          <select
            onChange={handlePresetChange}
            defaultValue=""
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>Select Bracket</option>
            {PRICE_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Custom Input */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Min Price (₹)</label>
          <input
            type="number"
            min="0"
            step="100000"
            placeholder="e.g. 5000000"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>

        {/* Max Price Custom Input */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Max Price (₹)</label>
          <input
            type="number"
            min="0"
            step="100000"
            placeholder="e.g. 20000000"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Furnishing</label>
          <select
            value={filters.furnishing}
            onChange={(e) => onChange({ ...filters, furnishing: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Any</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="fully-furnished">Fully-Furnished</option>
          </select>
        </div>
      </div>

      {/* Quality Toggles */}
      <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={filters.excludeInactive}
            onChange={(e) => onChange({ ...filters, excludeInactive: e.target.checked })}
            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span>Exclude Inactive (<code className="text-[11px] text-slate-500">is_live: false</code>)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={filters.excludeCorrupt}
            onChange={(e) => onChange({ ...filters, excludeCorrupt: e.target.checked })}
            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span>Filter Corrupt Data & Fake Leads</span>
        </label>
      </div>
    </div>
  );
};