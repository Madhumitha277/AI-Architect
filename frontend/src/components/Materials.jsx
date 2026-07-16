import { useState } from "react";
import api from "../api";
import {
  HardHat, Loader2, AlertCircle, TrendingUp,
  Layers, Flame, Blocks, Droplets, Mountain,
  PaintBucket, Grid2x2, Package,
} from "lucide-react";

// Icon map — keyed to the exact material names returned by the backend
const MATERIAL_ICONS = {
  cement: Flame,
  steel: Layers,
  bricks: Blocks,
  sand: Mountain,
  aggregate: Droplets,
  paint: PaintBucket,
  tiles: Grid2x2,
};

// Construction-themed accent per material
const MATERIAL_COLORS = {
  cement:    { bg: "#f1f0ee", bar: "#6b7280", icon: "#374151" },
  steel:     { bg: "#edf2f7", bar: "#3b82f6", icon: "#1d4ed8" },
  bricks:    { bg: "#fef3ee", bar: "#e86a33", icon: "#c4502e" },
  sand:      { bg: "#fefce8", bar: "#ca8a04", icon: "#a16207" },
  aggregate: { bg: "#f0fdf4", bar: "#22c55e", icon: "#15803d" },
  paint:     { bg: "#fdf4ff", bar: "#a855f7", icon: "#7e22ce" },
  tiles:     { bg: "#eff6ff", bar: "#3b82f6", icon: "#1e40af" },
};

export default function Materials() {
  const [area, setArea] = useState(1200);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const estimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/material-estimate", { area });
      setResult(res.data);
    } catch {
      setError("Couldn't estimate materials. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Derived presentation values — computed from the already-fetched `result`,
  // no new API calls, no business logic changes.
  const totalCost = result?.total_material_cost || 0;
  const materialEntries = result
    ? Object.entries(result.materials)
    : [];
  const costEntries = result
    ? Object.entries(result.estimated_material_cost)
    : [];
  const maxCost = costEntries.length
    ? Math.max(...costEntries.map(([, v]) => v), 1)
    : 1;

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Industrial construction dashboard
          Background: light concrete — NOT blueprint / dark / wood / paper
      --------------------------------------------------- */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #f8f7f5 0%, #f0ece6 50%, #e8e4de 100%)",
        }}
      >
        {/* Subtle concrete noise texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-terracotta/10 blur-[100px]" />

        {/* ---- Header ---- */}
        <div className="relative flex flex-wrap items-center justify-between gap-6 px-9 py-8 max-md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-deep text-white shadow-lg shadow-terracotta/25">
              <HardHat className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Construction dashboard
              </span>
              <h2 className="font-display text-2xl font-semibold text-navy">
                Material estimator
              </h2>
            </div>
          </div>

          {/* Input strip */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="mat-area"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Plot area (sqft)
              </label>
              <input
                id="mat-area"
                type="number"
                min="100"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm text-navy shadow-sm outline-none transition focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10"
              />
            </div>
            <button
              onClick={estimate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-deep px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-terracotta/25 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <Package className="h-4 w-4" strokeWidth={2.5} />
              )}
              {loading ? "Calculating…" : "Estimate materials"}
            </button>
          </div>
        </div>

        {error && (
          <div className="relative mx-9 mb-6 flex items-start gap-2.5 rounded-xl border border-terracotta/25 bg-white px-4 py-3 text-sm font-medium text-terracotta-deep shadow-sm max-md:mx-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ---- Results ---- */}
        {result && (
          <div className="relative space-y-8 px-9 pb-10 max-md:px-6">

            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-2 rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-deep p-5 shadow-lg shadow-terracotta/20 sm:col-span-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/70">
                  Total material cost
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold text-white">
                  ₹{totalCost.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Plot area
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold text-navy">
                  {result.area} <span className="text-sm font-normal text-slate-400">sqft</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Materials tracked
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold text-navy">
                  {materialEntries.length}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Avg. cost / sqft
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold text-navy">
                  ₹{result.area ? Math.round(totalCost / result.area).toLocaleString("en-IN") : "—"}
                </div>
              </div>
            </div>

            {/* Material cards grid */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <span className="h-px w-5 bg-slate-300" />
                Material breakdown
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {materialEntries.map(([key, info]) => {
                  const Icon = MATERIAL_ICONS[key] || Package;
                  const color = MATERIAL_COLORS[key] || { bg: "#f8f8f8", bar: "#6b7280", icon: "#374151" };
                  const cost = result.estimated_material_cost[key] || 0;
                  const pct = Math.round((cost / maxCost) * 100);

                  return (
                    <div
                      key={key}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* Color accent strip */}
                      <div
                        className="h-1.5 w-full transition-all group-hover:h-2"
                        style={{ background: color.bar }}
                      />
                      <div className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-2">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: color.bg }}
                          >
                            <Icon
                              className="h-5 w-5"
                              strokeWidth={2}
                              style={{ color: color.icon }}
                            />
                          </div>
                          <span
                            className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
                            style={{ background: color.bg, color: color.icon }}
                          >
                            {info.unit}
                          </span>
                        </div>

                        <div className="font-display text-base font-semibold capitalize text-navy">
                          {key}
                        </div>

                        <div className="mt-1 font-mono text-2xl font-semibold text-navy">
                          {info.quantity.toLocaleString()}
                          <span className="ml-1 text-sm font-normal text-slate-400">
                            {info.unit}
                          </span>
                        </div>

                        {/* Cost progress bar */}
                        <div className="mt-4">
                          <div className="mb-1.5 flex justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                              Cost share
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: color.bar }}
                            />
                          </div>
                          <div className="mt-2 font-mono text-xs font-medium text-slate-500">
                            ₹{cost.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost breakdown bar chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                Cost breakdown
              </h3>
              <div className="space-y-3">
                {costEntries
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, cost]) => {
                    const color = MATERIAL_COLORS[key] || { bar: "#6b7280" };
                    const pct = Math.round((cost / maxCost) * 100);
                    return (
                      <div key={key} className="flex items-center gap-4">
                        <span className="w-20 font-mono text-xs capitalize text-slate-500">
                          {key}
                        </span>
                        <div className="flex-1">
                          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="flex h-full items-center justify-end rounded-full pr-2 transition-all duration-700"
                              style={{
                                width: `${Math.max(pct, 6)}%`,
                                background: color.bar,
                              }}
                            >
                              <span className="font-mono text-[9px] font-semibold text-white/90">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="w-28 text-right font-mono text-xs text-slate-500">
                          ₹{cost.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total
                  </span>
                  <span className="font-mono text-sm font-bold text-navy">
                    ₹{totalCost.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer note */}
            <p className="font-mono text-[11px] leading-relaxed text-slate-400">
              {result.note}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="relative px-9 pb-10 max-md:px-6">
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center">
              <HardHat className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="max-w-xs text-sm text-slate-400">
                Enter a plot area above and click "Estimate materials" to see the full construction breakdown.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
