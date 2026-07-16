import { useState } from "react";
import api from "../api";
import { RadialGauge } from "./charts/MiniCharts";
import {
  IndianRupee, Loader2, AlertCircle, TrendingDown,
  TrendingUp, Home, BedDouble, Bath, CheckCircle2,
  Lightbulb, BarChart3,
} from "lucide-react";

// Tier display config — purely cosmetic mapping over the tier keys
// returned by the backend ("basic" | "standard" | "premium")
const TIER_CONFIG = {
  basic:    { label: "Basic",    color: "text-slate-600",  bg: "bg-slate-50",   bar: "#94a3b8", ring: "#94a3b8" },
  standard: { label: "Standard", color: "text-blue-600",   bg: "bg-blue-50",    bar: "#3b82f6", ring: "#3b82f6" },
  premium:  { label: "Premium",  color: "text-violet-600", bg: "bg-violet-50",  bar: "#8b5cf6", ring: "#8b5cf6" },
};

// Determine status colour based on what fraction of budget is consumed
// by the standard tier estimate (if requested plan feasibility is present).
function budgetStatus(result, budget) {
  if (!result?.requested_plan_feasibility) return "neutral";
  const fits = result.requested_plan_feasibility?.standard?.fits_budget;
  if (fits) return "green";
  const basicFits = result.requested_plan_feasibility?.basic?.fits_budget;
  return basicFits ? "amber" : "red";
}

export default function Budget() {
  const [form, setForm] = useState({ budget: 1500000, area: "", bedrooms: "", bathrooms: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const optimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        budget: form.budget,
        area: form.area ? Number(form.area) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      };
      const res = await api.post("/budget-optimizer", payload);
      setResult(res.data);
    } catch {
      setError("Couldn't run the budget optimizer. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Derived presentation values — computed from already-fetched `result`
  const status = result ? budgetStatus(result, form.budget) : "neutral";
  const standardCostForArea = form.area
    ? Number(form.area) * 2800
    : null;
  const utilizationPct = result && standardCostForArea
    ? Math.min((standardCostForArea / form.budget) * 100, 100)
    : null;
  const gaugeColor =
    status === "green" ? "#22c55e" :
    status === "amber" ? "#f59e0b" :
    status === "red"   ? "#ef4444" : "#3b82f6";

  const tierEntries = result
    ? Object.entries(result.tier_breakdown)
    : [];
  const maxArea = tierEntries.length
    ? Math.max(...tierEntries.map(([, v]) => v.max_affordable_area), 1)
    : 1;

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Finance dashboard — deep green-tinted dark header,
          NOT blueprint / concrete / wood / paper / gradient-mesh
      --------------------------------------------------- */}
      <div className="relative overflow-hidden">

        {/* Header strip — dark finance green */}
        <div
          className="relative overflow-hidden px-9 py-10 max-md:px-6"
          style={{
            background: "linear-gradient(135deg, #0a1f14 0%, #0f2d1a 50%, #0a2320 100%)",
          }}
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-[80px]" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-teal/10 blur-[70px]" />

          <div className="relative flex flex-wrap items-start justify-between gap-8">
            {/* Left: title + budget input */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                  <BarChart3 className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-400/70">
                    Finance dashboard
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-white">
                    Budget optimizer
                  </h2>
                </div>
              </div>

              {/* Budget KPI — main big number */}
              <div className="mt-6">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Your budget</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-[28px] font-bold text-white leading-none">
                    ₹{Number(form.budget).toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  id="budget"
                  type="range"
                  min="500000"
                  max="20000000"
                  step="100000"
                  value={form.budget}
                  onChange={(e) => update("budget", Number(e.target.value))}
                  className="mt-3 w-64 cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between w-64 mt-0.5">
                  <span className="font-mono text-[10px] text-slate-500">₹5L</span>
                  <span className="font-mono text-[10px] text-slate-500">₹2Cr</span>
                </div>
                {/* Hidden number input kept for exact entry */}
                <input
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={(e) => update("budget", Number(e.target.value))}
                  className="mt-2 w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-emerald-400/50"
                />
              </div>
            </div>

            {/* Right: optional params */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Optional constraints</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <Home className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                  <input
                    id="b-area"
                    type="number"
                    placeholder="Area (sqft)"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    className="w-full bg-transparent font-mono text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <BedDouble className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                  <input
                    id="b-bed"
                    type="number"
                    placeholder="Bedrooms"
                    value={form.bedrooms}
                    onChange={(e) => update("bedrooms", e.target.value)}
                    className="w-full bg-transparent font-mono text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <Bath className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                  <input
                    id="b-bath"
                    type="number"
                    placeholder="Bathrooms"
                    value={form.bathrooms}
                    onChange={(e) => update("bathrooms", e.target.value)}
                    className="w-full bg-transparent font-mono text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={optimize}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  : <TrendingUp className="h-4 w-4" strokeWidth={2.5} />}
                {loading ? "Optimizing…" : "Optimize budget"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-9 mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 max-md:mx-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ---------------------------------------------------
            Results — light background, finance card grid
        --------------------------------------------------- */}
        {result && (
          <div className="space-y-8 bg-gradient-to-b from-slate-50 to-white px-9 py-9 max-md:px-6">

            {/* Budget utilization gauge + KPI strip */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">

              {/* Radial gauge */}
              {utilizationPct !== null && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <RadialGauge
                    value={utilizationPct}
                    max={100}
                    color={gaugeColor}
                    size={160}
                    label="utilised"
                  />
                  <div className="text-center">
                    <div className="font-display text-base font-semibold text-navy">
                      Budget utilisation
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-400">
                      Standard finish · {form.area} sqft
                    </div>
                  </div>
                </div>
              )}

              {/* Tier KPI cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {tierEntries.map(([tier, info]) => {
                  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.standard;
                  const pct = Math.round((info.max_affordable_area / maxArea) * 100);
                  return (
                    <div key={tier} className={`flex flex-col justify-between rounded-2xl border border-slate-200 ${cfg.bg} p-5 shadow-sm`}>
                      <div>
                        <div className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
                          {cfg.label}
                        </div>
                        <div className="mt-2 font-mono text-2xl font-bold text-navy">
                          {info.max_affordable_area.toLocaleString()}
                          <span className="ml-1 text-sm font-normal text-slate-400">sqft</span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          Up to {info.max_affordable_bhk || 0} BHK
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide">Affordability</span>
                          <span className="font-mono text-[10px] text-slate-500">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: cfg.bar }}
                          />
                        </div>
                        <div className="mt-2 font-mono text-[11px] text-slate-400">
                          ₹{info.rate_per_sqft}/sqft
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feasibility section — if requested plan was given */}
            {result.requested_plan_feasibility && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                  Plan feasibility — {form.area} sqft
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {Object.entries(result.requested_plan_feasibility).map(([tier, data]) => {
                    const cfg = TIER_CONFIG[tier] || TIER_CONFIG.standard;
                    const fits = data.fits_budget;
                    const diff = Math.abs(data.difference);
                    return (
                      <div
                        key={tier}
                        className={`rounded-xl border p-4 ${
                          fits
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-red-100 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {fits
                            ? <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                            : <TrendingDown className="h-4 w-4 text-red-400" strokeWidth={2} />}
                        </div>
                        <div className={`mt-2 text-sm font-semibold ${fits ? "text-emerald-700" : "text-red-600"}`}>
                          {fits ? "Within budget" : "Over budget"}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-slate-500">
                          {fits
                            ? `₹${diff.toLocaleString("en-IN")} surplus`
                            : `₹${diff.toLocaleString("en-IN")} shortfall`}
                        </div>
                        <div className="mt-2 font-mono text-[11px] text-slate-400">
                          Required: ₹{data.required_cost.toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
                  AI cost optimisation insights
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {result.recommendations.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-mono text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="bg-slate-50 px-9 py-12 max-md:px-6">
            <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 text-center">
              <IndianRupee className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="max-w-xs text-sm text-slate-400">
                Set your budget above and click "Optimize budget" to see what you can build.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
