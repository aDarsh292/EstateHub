import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { normalizeArea } from "../utils/formatters";
import {
  BarChart3,
  Building2,
  TrendingUp,
  Layers,
  MapPin,
  Sofa,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function Analytics() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListings() {
      try {
        const allListings = [];
        let offset = 0;
        const limit = 50;

        while (true) {
          const response = await api.get("/v1/listings/", {
            params: { limit, offset },
          });

          const results = response.data.results || [];
          allListings.push(...results);

          if (!response.data.has_more || results.length === 0) {
            break;
          }

          offset += results.length;
        }

        setListings(allListings);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  const analytics = useMemo(() => {
    if (!listings.length) return null;

    // Filter live listings
    const liveListings = listings.filter((l) => l.is_live === true);

    // Identify corrupt and fake enquiry-bait listings from the audit
    const corruptOrFake = listings.filter((l) => {
      const isCorrupt =
        l.price <= 0 ||
        (l.floor !== null && l.total_floors !== null && l.floor > l.total_floors) ||
        (l.carpet_area && l.super_built_up_area && l.carpet_area > l.super_built_up_area);
      const isFake = l.price > 0 && l.price < 100000;
      return isCorrupt || isFake;
    });

    // Sanitized valid prices (> 100,000 to exclude fake rent listings)
    const validPrices = liveListings.filter(
      (l) => Number.isFinite(Number(l.price)) && Number(l.price) >= 100000
    );

    // Carpet area normalized to sqft across all portals (converts magichomes sqm)
    const validAreas = liveListings
      .filter((l) => Number.isFinite(Number(l.carpet_area)) && Number(l.carpet_area) > 0)
      .map((l) => normalizeArea(l.carpet_area, l.website).sqft);

    const averagePrice =
      validPrices.length > 0
        ? validPrices.reduce((sum, l) => sum + Number(l.price), 0) / validPrices.length
        : 0;

    const averageArea =
      validAreas.length > 0
        ? validAreas.reduce((sum, area) => sum + area, 0) / validAreas.length
        : 0;

    const bhkCounts = {};
    liveListings.forEach((l) => {
      const bhk = Number(l.bedroom);
      if (Number.isFinite(bhk) && bhk > 0) {
        bhkCounts[bhk] = (bhkCounts[bhk] || 0) + 1;
      }
    });

    const propertyTypeCounts = {};
    liveListings.forEach((l) => {
      const type = l.property_type || "unknown";
      propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
    });

    const localityCounts = {};
    liveListings.forEach((l) => {
      const locality = l.locality || "unknown";
      localityCounts[locality] = (localityCounts[locality] || 0) + 1;
    });

    const furnishingCounts = {};
    liveListings.forEach((l) => {
      const furnishing = l.furnishing || "unknown";
      furnishingCounts[furnishing] = (furnishingCounts[furnishing] || 0) + 1;
    });

    // Clean 2BHK listings with area normalization
    const cleanTwoBhk = liveListings.filter((l) => {
      const isClean =
        Number(l.bedroom) === 2 &&
        Number(l.price) >= 100000 &&
        Number(l.carpet_area) > 0 &&
        !(l.floor !== null && l.total_floors !== null && l.floor > l.total_floors);
      return isClean;
    });

    const averageTwoBhkPricePerSqft =
      cleanTwoBhk.length > 0
        ? cleanTwoBhk.reduce((sum, l) => {
            const normalized = normalizeArea(l.carpet_area, l.website);
            return sum + Number(l.price) / normalized.sqft;
          }, 0) / cleanTwoBhk.length
        : 0;

    const topLocalities = Object.entries(localityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topPropertyTypes = Object.entries(propertyTypeCounts).sort(
      (a, b) => b[1] - a[1]
    );

    const topBhk = Object.entries(bhkCounts).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    );

    return {
      total: listings.length,
      live: liveListings.length,
      inactive: listings.length - liveListings.length,
      corruptOrFakeCount: corruptOrFake.length,
      averagePrice,
      averageArea,
      averageTwoBhkPricePerSqft,
      topLocalities,
      topPropertyTypes,
      topBhk,
      furnishingCounts,
    };
  }, [listings]);

  function formatPrice(value) {
    if (!value) return "₹0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Aggregating market intelligence from API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase">
            MARKET INSIGHTS
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            Property Analytics & Market Trends
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregates calculated directly from all indexed city catalog records.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Unit Normalization Active</span>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Listings</span>
          <strong className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.total.toLocaleString("en-IN")}
          </strong>
          <small className="text-[11px] text-slate-400 mt-1">Retrieved from catalog</small>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Live Listings</span>
          <strong className="text-2xl font-bold text-emerald-600 mt-2">
            {analytics.live.toLocaleString("en-IN")}
          </strong>
          <small className="text-[11px] text-slate-400 mt-1">
            {((analytics.live / analytics.total) * 100).toFixed(1)}% of total catalog
          </small>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Inactive Listings</span>
          <strong className="text-2xl font-bold text-slate-700 mt-2">
            {analytics.inactive.toLocaleString("en-IN")}
          </strong>
          <small className="text-[11px] text-amber-600 mt-1 font-medium">
            Withdrawn / Unverified
          </small>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Average Price</span>
          <strong className="text-2xl font-bold text-slate-900 mt-2">
            {formatPrice(analytics.averagePrice)}
          </strong>
          <small className="text-[11px] text-slate-400 mt-1">Active verified sales</small>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Avg Carpet Area</span>
          <strong className="text-2xl font-bold text-slate-900 mt-2">
            {Math.round(analytics.averageArea).toLocaleString("en-IN")}
          </strong>
          <small className="text-[11px] text-slate-400 mt-1">sq ft (normalized)</small>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2 BHK Rate / Sqft
          </span>
          <strong className="text-2xl font-extrabold text-emerald-700 mt-2">
            ₹{Math.round(analytics.averageTwoBhkPricePerSqft).toLocaleString("en-IN")}
          </strong>
          <small className="text-[11px] text-emerald-600 mt-1 font-medium">
            Clean physical benchmark
          </small>
        </div>
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Types */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Property Types
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live listings</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.topPropertyTypes.map(([type, count]) => {
              const percentage = (count / analytics.live) * 100;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-slate-700">{type}</span>
                    <span className="text-slate-900">
                      {count.toLocaleString("en-IN")}{" "}
                      <span className="text-slate-400 font-normal">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BHK Distribution */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              BHK Distribution
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live inventory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {analytics.topBhk.map(([bhk, count]) => (
              <div
                key={bhk}
                className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center flex flex-col justify-between"
              >
                <strong className="text-sm font-bold text-slate-800">{bhk} BHK</strong>
                <span className="text-lg font-extrabold text-emerald-600 mt-1">
                  {count.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">units</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Localities */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Top Localities
            </h2>
            <span className="text-xs text-slate-400 font-medium">By listing volume</span>
          </div>

          <div className="divide-y divide-slate-100 pt-2">
            {analytics.topLocalities.map(([locality, count], index) => (
              <div
                key={locality}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                    {index + 1}
                  </span>
                  <span className="capitalize font-semibold text-slate-800">
                    {locality}
                  </span>
                </div>
                <strong className="text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  {count.toLocaleString("en-IN")} listings
                </strong>
              </div>
            ))}
          </div>
        </section>

        {/* Furnishing */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sofa className="w-4 h-4 text-emerald-600" />
              Furnishing Breakdown
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live units</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {Object.entries(analytics.furnishingCounts).map(([type, count]) => (
              <div
                key={type}
                className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-slate-600 capitalize truncate">
                  {type.replace("-", " ")}
                </span>
                <strong className="text-xl font-bold text-slate-900 mt-2">
                  {count.toLocaleString("en-IN")}
                </strong>
                <span className="text-[10px] text-slate-400 mt-0.5">properties</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}