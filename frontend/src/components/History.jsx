import { useEffect, useState } from "react";
import api from "../api";
import {
  FolderOpen, Search, SlidersHorizontal, Eye, Trash2,
  CalendarDays, Building2, BedDouble, Bath, Loader2,
  AlertCircle, ArrowUpDown, FileDown, X, ChevronDown,
} from "lucide-react";

// Presentational helpers — no business logic changed
function parseTitleMeta(title) {
  // e.g. "3BHK - 1400 sqft" -> { bhk: 3, area: 1400 }
  const bhk  = title?.match(/(\d+)\s*BHK/i)?.[1];
  const area = title?.match(/(\d[\d,]*)\s*sqft/i)?.[1]?.replace(",", "");
  return { bhk: bhk ? Number(bhk) : null, area: area ? Number(area) : null };
}

function BlueprintThumb({ title, index }) {
  const { bhk, area } = parseTitleMeta(title);
  const hues = ["#0f2a43", "#0a4569", "#1c4060", "#0e3a5a", "#0c2d48", "#163d5c"];
  const bg = hues[index % hues.length];
  return (
    <div
      className="relative flex h-36 w-full shrink-0 items-end overflow-hidden"
      style={{ background: bg }}
    >
      {/* Blueprint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(#5fb8d1 1px, transparent 1px), linear-gradient(90deg, #5fb8d1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Abstract floor plan blocks */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet">
        <rect x="10" y="15" width="65" height="45" fill="none" stroke="#5fb8d1" strokeWidth="1.2" opacity="0.6" />
        <rect x="10" y="62" width="30" height="25" fill="none" stroke="#5fb8d1" strokeWidth="1.2" opacity="0.6" />
        <rect x="42" y="62" width="33" height="25" fill="none" stroke="#5fb8d1" strokeWidth="1.2" opacity="0.6" />
        <rect x="77" y="15" width="35" height="30" fill="none" stroke="#e86a33" strokeWidth="1.2" opacity="0.5" />
        <rect x="77" y="47" width="35" height="40" fill="none" stroke="#5fb8d1" strokeWidth="1.2" opacity="0.6" />
        <line x1="10" y1="62" x2="75" y2="62" stroke="#5fb8d1" strokeWidth="0.8" opacity="0.5" />
        <line x1="77" y1="47" x2="112" y2="47" stroke="#5fb8d1" strokeWidth="0.8" opacity="0.5" />
      </svg>
      {/* Bottom info bar */}
      <div className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-4">
        <div className="flex items-end justify-between">
          {bhk && <span className="font-mono text-[11px] font-semibold text-white/90">{bhk} BHK</span>}
          {area && <span className="font-mono text-[11px] text-white/60">{area.toLocaleString()} sqft</span>}
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = ["Newest", "Oldest", "Area ↑", "Area ↓"];

export default function History({ userId, setUserId }) {
  const [inputId, setInputId]   = useState(userId || "");
  const [plans, setPlans]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Display-only state — no API interaction
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("Newest");
  const [showSort, setShowSort] = useState(false);

  const load = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await api.get(`/history/${id}`);
      setPlans(res.data.plans || []);
    } catch {
      setError("Couldn't load history. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load(userId);
  }, [userId]);

  const viewPlan = async (planId) => {
    try {
      const res = await api.get(`/history/${userId}/${planId}`);
      setSelected(res.data);
    } catch {
      setError("Couldn't load that plan.");
    }
  };

  const removePlan = async (planId) => {
    try {
      await api.delete(`/history/${userId}/${planId}`);
      setPlans((p) => p.filter((pl) => pl.id !== planId));
      if (selected?.id === planId) setSelected(null);
    } catch {
      setError("Couldn't delete that plan.");
    }
  };

  // Derived display list — filters + sorts applied client-side on the
  // already-fetched `plans` array. No new API calls.
  const displayPlans = plans
    .filter((p) => !search || p.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "Oldest") return new Date(a.created_at) - new Date(b.created_at);
      const aArea = parseTitleMeta(a.title).area || 0;
      const bArea = parseTitleMeta(b.title).area || 0;
      return sortBy === "Area ↑" ? aArea - bArea : bArea - aArea;
    });

  return (
    <div className="-m-9 max-md:-m-6">
      {/* =====================================================
          Premium project library
          Light professional — blue/white/slate
          NOT dark studio, NOT concrete, NOT beige, NOT finance
      ===================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/60">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-50 blur-[100px]" />

        {/* Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-6 px-9 py-8 max-md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <FolderOpen className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-400">Project library</span>
              <h2 className="font-display text-2xl font-semibold text-navy">Saved plans</h2>
            </div>
          </div>

          {/* User ID input + load button */}
          <div className="flex items-end gap-3">
            <div>
              <label htmlFor="user-id" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                User ID
              </label>
              <input
                id="user-id"
                type="text"
                placeholder="Your name or email"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                className="w-52 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => { setUserId(inputId); load(inputId); }}
              disabled={loading || !inputId}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                : <FolderOpen className="h-4 w-4" strokeWidth={2.5} />}
              {loading ? "Loading…" : "Load history"}
            </button>
          </div>
        </div>

        {error && (
          <div className="relative mx-9 mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 max-md:mx-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ---- Search + sort toolbar ---- */}
        {plans.length > 0 && (
          <div className="relative flex flex-wrap items-center gap-3 px-9 pb-6 max-md:px-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search plans…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy">
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSort((s) => !s)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                {sortBy}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full z-20 mt-1.5 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSort(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${sortBy === opt ? "font-semibold text-blue-600" : "text-slate-600"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
              <span className="font-mono text-[11px] text-slate-500">
                {displayPlans.length} / {plans.length} plans
              </span>
            </div>
          </div>
        )}

        {/* ---- Project card grid ---- */}
        {displayPlans.length > 0 && (
          <div className="relative grid grid-cols-1 gap-5 px-9 pb-9 sm:grid-cols-2 lg:grid-cols-3 max-md:px-6">
            {displayPlans.map((p, index) => {
              const meta = parseTitleMeta(p.title);
              const isSelected = selected?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg ${
                    isSelected ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-100"
                  }`}
                >
                  {/* Blueprint thumbnail */}
                  <BlueprintThumb title={p.title} index={index} />

                  {/* Card body */}
                  <div className="p-5">
                    <div className="mb-3">
                      <div className="font-display text-base font-semibold text-navy leading-snug">
                        {p.title}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <CalendarDays className="h-3 w-3" strokeWidth={2} />
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {meta.area && (
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-500">
                          <Building2 className="h-3 w-3" strokeWidth={2} />
                          {meta.area.toLocaleString()} sqft
                        </span>
                      )}
                      {meta.bhk && (
                        <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-[11px] text-blue-600">
                          <BedDouble className="h-3 w-3" strokeWidth={2} />
                          {meta.bhk} BHK
                        </span>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewPlan(p.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                        View
                      </button>
                      <button
                        onClick={() => removePlan(p.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---- Plan detail drawer ---- */}
        {selected && (
          <div className="relative px-9 pb-9 max-md:px-6">
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-blue-500" strokeWidth={2} />
                  <span className="font-display text-sm font-semibold text-navy">Plan #{selected.id} — {selected.plan_data?.area} sqft</span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Key metrics from plan_data */}
              {selected.plan_data && (
                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-4">
                  {[
                    { label: "Area",      value: `${selected.plan_data.area} sqft`,     icon: Building2  },
                    { label: "Bedrooms",  value: `${selected.plan_data.bedrooms} BHK`,  icon: BedDouble  },
                    { label: "Bathrooms", value: selected.plan_data.bathrooms,           icon: Bath       },
                    { label: "Style",     value: selected.plan_data.style || "—",       icon: Eye        },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        <Icon className="h-3 w-3" strokeWidth={2} />
                        {label}
                      </div>
                      <div className="mt-1 font-mono text-sm font-semibold text-navy">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Raw JSON fallback */}
              <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[12px] text-slate-500">
                {JSON.stringify(selected.plan_data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* ---- Empty state — after load, no plans ---- */}
        {plans.length === 0 && !loading && userId && !error && (
          <div className="relative px-9 pb-10 max-md:px-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                <FolderOpen className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-slate-400">No projects yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  No saved plans for "{userId}". Generate a floor plan with this user ID to see it here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---- Initial state — before loading ---- */}
        {!userId && !loading && (
          <div className="relative px-9 pb-10 max-md:px-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-300">
                <Search className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-slate-400">Enter a user ID above</p>
                <p className="mt-1 text-sm text-slate-400">
                  Use the same name or email you used when generating floor plans.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
