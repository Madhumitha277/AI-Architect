import { useState } from "react";
import api, { API_BASE } from "../api";
import {
  Ruler, BedDouble, Bath, Palette, LayoutTemplate, Compass,
  Download, Loader2, Sparkles, Home, ChefHat, DoorOpen,
  ShowerHead, Package, IndianRupee, Check, AlertCircle,
  Link2, Grid3x3, Mountain, CircleDot, PaintBucket, LayoutGrid,
} from "lucide-react";

const STYLES = ["Modern", "Contemporary", "Traditional", "Minimalist", "Colonial"];

const MATERIAL_ICONS = {
  cement: Package,
  steel: Link2,
  bricks: Grid3x3,
  sand: Mountain,
  aggregate: CircleDot,
  paint: PaintBucket,
  tiles: LayoutGrid,
};

export default function PlanGenerator({ userId }) {
  const [form, setForm] = useState({
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    style: "Modern",
    layout_type: "A",
    vastu: true,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post("/generate", { ...form, user_id: userId || undefined });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Couldn't reach the backend. Make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.post("/generate-report", { ...form, user_id: userId || undefined }, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "AI_Architect_Floor_Plan_Report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Couldn't generate the PDF report. Try generating the plan again first.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Workspace hero strip
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-navy-deep px-9 py-8 max-md:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/20 text-terracotta">
            <Home className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">Architect workspace</span>
            <h2 className="font-display text-2xl font-semibold text-white">Draft a floor plan</h2>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------
          Two-column workspace
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 bg-slate-50 p-9 lg:grid-cols-[1.1fr_0.9fr] max-md:p-5">

        {/* ---------- LEFT: form card ---------- */}
        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-navy">Project details</h3>
          <p className="mb-6 text-sm text-slate-500">
            Plot area and room counts. The plan, cost, room sizes, and Vastu
            layout are generated together, instantly.
          </p>

          <div className="space-y-5">
            <div>
              <label htmlFor="area" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Ruler className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                Plot area (sqft)
              </label>
              <input
                id="area"
                type="number"
                min="100"
                value={form.area}
                onChange={(e) => update("area", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base text-navy outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bedrooms" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <BedDouble className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  min="1"
                  max="10"
                  value={form.bedrooms}
                  onChange={(e) => update("bedrooms", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base text-navy outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/15"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Bath className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  min="1"
                  max="10"
                  value={form.bathrooms}
                  onChange={(e) => update("bathrooms", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base text-navy outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="style" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Palette className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                Style
              </label>
              <select
                id="style"
                value={form.style}
                onChange={(e) => update("style", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-navy outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/15"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="layout" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <LayoutTemplate className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                Layout type
              </label>
              <select
                id="layout"
                value={form.layout_type}
                onChange={(e) => update("layout_type", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-navy outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/15"
              >
                <option value="A">A — Open Kitchen</option>
                <option value="B">B — Large Living Room</option>
                <option value="C">C — Large Bedrooms</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-teal/25 bg-teal/5 px-4 py-3.5">
              <input
                type="checkbox"
                checked={form.vastu}
                onChange={(e) => update("vastu", e.target.checked)}
                className="h-4 w-4 accent-teal-deep"
              />
              <Compass className="h-4 w-4 text-teal-deep" strokeWidth={2} />
              <span className="text-sm font-medium text-navy">Include Vastu-compliant layout suggestions</span>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-deep px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-terracotta/25 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Sparkles className="h-4 w-4" strokeWidth={2} />}
              {loading ? "Drafting…" : "Generate floor plan"}
            </button>
            {result && (
              <button
                onClick={downloadReport}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:border-navy/20 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                {downloading ? "Preparing PDF…" : "Download PDF report"}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm font-medium text-terracotta-deep">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>

        {/* ---------- RIGHT: live project summary ---------- */}
        <div className="h-fit space-y-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-navy to-navy-deep p-6 text-white shadow-lg shadow-navy/20">
            <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Live project summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <Ruler className="h-3 w-3" strokeWidth={2} /> Area
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">{form.area} <span className="text-xs font-normal text-slate-400">sqft</span></div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <BedDouble className="h-3 w-3" strokeWidth={2} /> Bedrooms
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">{form.bedrooms}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <Bath className="h-3 w-3" strokeWidth={2} /> Bathrooms
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">{form.bathrooms}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <Palette className="h-3 w-3" strokeWidth={2} /> Style
                </div>
                <div className="mt-1 truncate text-sm font-semibold">{form.style}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <LayoutTemplate className="h-3 w-3" strokeWidth={2} /> Layout
                </div>
                <div className="mt-1 text-sm font-semibold">Type {form.layout_type}</div>
              </div>
              <div className={`rounded-xl p-3.5 ${form.vastu ? "bg-teal/15" : "bg-white/5"}`}>
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <Compass className="h-3 w-3" strokeWidth={2} /> Vastu
                </div>
                <div className={`mt-1 flex items-center gap-1 text-sm font-semibold ${form.vastu ? "text-teal" : "text-slate-400"}`}>
                  {form.vastu && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {form.vastu ? "Enabled" : "Off"}
                </div>
              </div>
            </div>
          </div>

          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-10 text-center">
              <Home className="mx-auto h-7 w-7 text-slate-300" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-slate-500">
                Fill in the details and generate a plan to see your floor plan,
                cost, and material breakdown here.
              </p>
            </div>
          )}

          {userId && result?.saved_plan_id && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              Saved to your history as plan #{result.saved_plan_id}.
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------
          Results — full width below the workspace
      --------------------------------------------------- */}
      {result && (
        <div className="space-y-8 bg-slate-50 px-9 pb-9 max-md:px-5 max-md:pb-7">

          {/* Floor plan preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <Home className="h-4 w-4 text-terracotta" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-navy">Floor plan preview</h3>
            </div>
            <div className="bg-slate-100 p-6">
              <img
                src={`${result.image_url || `${API_BASE}/static/floor_plan.png`}?t=${Date.now()}`}
                alt="Generated floor plan"
                className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Room allocation cards */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <DoorOpen className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
              Room allocation
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { Icon: Home,       label: "Living room",    value: result.rooms.living_room },
                { Icon: BedDouble,  label: "Each bedroom",   value: result.rooms.bedroom_size },
                { Icon: ChefHat,    label: "Kitchen",        value: result.rooms.kitchen },
                { Icon: ShowerHead, label: "Each bathroom",  value: result.rooms.bathroom_size },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm"
                  style={{ transition: "transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(59,130,246,0.30)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "rgba(226,232,240,1)";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <Icon
                    className="mx-auto h-5 w-5 text-blue-400 transition-transform duration-300 group-hover:rotate-12 group-hover:text-blue-600"
                    strokeWidth={2}
                  />
                  <div className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="mt-1 font-mono text-xl font-semibold text-navy transition-colors duration-300 group-hover:text-blue-600">
                    {value}
                  </div>
                  <div className="text-[11px] text-slate-400">sqft</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost estimation — pricing cards */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <IndianRupee className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
              Cost estimate
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Basic */}
              <div
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                style={{ transition: "transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(232,106,51,0.28)";
                  e.currentTarget.style.borderColor = "rgba(232,106,51,0.40)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #fff7f4 0%, #ffffff 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "rgba(226,232,240,1)";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Basic</div>
                <div className="mt-2 font-mono text-2xl font-semibold text-navy transition-colors duration-300 group-hover:text-terracotta">
                  ₹{result.cost_estimation.basic.toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-slate-400">Functional finishes, standard fittings</p>
              </div>

              {/* Standard — promoted card, always styled */}
              <div
                className="group relative rounded-2xl border-2 border-terracotta bg-gradient-to-br from-terracotta to-terracotta-deep p-6 text-white shadow-lg shadow-terracotta/25"
                style={{ transition: "transform 300ms ease, box-shadow 300ms ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 20px 48px -8px rgba(232,106,51,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(232,106,51,0.25)";
                }}
              >
                <span className="absolute -top-3 left-6 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Recommended
                </span>
                <div className="text-xs font-semibold uppercase tracking-wide text-white/80">Standard</div>
                <div className="mt-2 font-mono text-2xl font-semibold transition-all duration-300 group-hover:text-yellow-200">
                  ₹{result.cost_estimation.standard.toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-white/80">Balanced quality and value finishes</p>
              </div>

              {/* Premium */}
              <div
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                style={{ transition: "transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(232,106,51,0.28)";
                  e.currentTarget.style.borderColor = "rgba(232,106,51,0.40)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #fff7f4 0%, #ffffff 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "rgba(226,232,240,1)";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Premium</div>
                <div className="mt-2 font-mono text-2xl font-semibold text-navy transition-colors duration-300 group-hover:text-terracotta">
                  ₹{result.cost_estimation.premium.toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-slate-400">High-end materials and fittings</p>
              </div>
            </div>
          </div>

          {/* Materials — icon cards with cost-share progress */}
          {result.material_estimation && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Package className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                Materials
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(result.material_estimation.materials).map(([key, info]) => {
                  const Icon = MATERIAL_ICONS[key] || Package;
                  const cost = result.material_estimation.estimated_material_cost[key];
                  const total = result.material_estimation.total_material_cost || 1;
                  const pct = Math.round((cost / total) * 100);
                  return (
                    <div
                      key={key}
                      className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                      style={{ transition: "transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                        e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(34,197,94,0.28)";
                        e.currentTarget.style.borderColor = "rgba(34,197,94,0.40)";
                        e.currentTarget.style.background = "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                        e.currentTarget.style.borderColor = "rgba(226,232,240,1)";
                        e.currentTarget.style.background = "#ffffff";
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-500 transition-all duration-300 group-hover:bg-green-100 group-hover:text-green-700">
                            <Icon
                              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                              strokeWidth={2}
                            />
                          </div>
                          <span className="text-sm font-semibold capitalize text-navy">{key}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-400 transition-colors duration-300 group-hover:text-green-600 group-hover:font-semibold">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700 group-hover:opacity-90"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, #22c55e, #16a34a)",
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="font-mono text-sm text-slate-500">{info.quantity} {info.unit}</span>
                        <span className="font-mono text-sm font-semibold text-navy transition-colors duration-300 group-hover:text-green-700">
                          ₹{cost.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-400">{result.material_estimation.note}</p>
            </div>
          )}

          {/* Vastu recommendation cards */}
          {result.vastu && result.vastu_rules && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Compass className="h-3.5 w-3.5 text-teal-deep" strokeWidth={2} />
                Vastu recommendations
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { Icon: DoorOpen, label: "Entrance",      value: result.vastu_rules.entrance },
                  { Icon: ChefHat,  label: "Kitchen",       value: result.vastu_rules.kitchen },
                  { Icon: BedDouble,label: "Master bedroom", value: result.vastu_rules.master_bedroom },
                  { Icon: Home,     label: "Living room",   value: result.vastu_rules.living_room },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="group rounded-2xl border border-teal/20 bg-teal/5 p-5"
                    style={{ transition: "transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                      e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(45,212,191,0.30)";
                      e.currentTarget.style.borderColor = "rgba(45,212,191,0.60)";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(45,212,191,0.10) 0%, rgba(45,212,191,0.04) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "rgba(45,212,191,0.20)";
                      e.currentTarget.style.background = "rgba(45,212,191,0.05)";
                    }}
                  >
                    <Icon
                      className="h-5 w-5 text-teal-deep transition-transform duration-300 group-hover:rotate-12 group-hover:text-teal"
                      strokeWidth={2}
                    />
                    <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
                    <div className="mt-0.5 text-base font-semibold text-navy transition-colors duration-300 group-hover:text-teal-deep">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
