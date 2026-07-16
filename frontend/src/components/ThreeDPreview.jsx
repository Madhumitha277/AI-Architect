import { useState } from "react";
import api from "../api";
import { Boxes, RotateCw, Move3d, Loader2, AlertCircle, Sparkles } from "lucide-react";

export default function ThreeDPreview() {
  const [form, setForm] = useState({ area: 1200, bedrooms: 2, bathrooms: 2 });
  const [rooms, setRooms] = useState(null);
  const [rotation, setRotation] = useState({ x: 55, z: -35 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/generate", { ...form, style: "Modern" });
      setRooms(res.data.rooms);
    } catch {
      setError("Couldn't generate room data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Build simple block layout (purely illustrative, not to exact scale)
  const blocks = rooms ? [
    { label: "Living", area: rooms.living_room, color: "#0c2d48", w: 220, d: 160 },
    { label: "Kitchen", area: rooms.kitchen, color: "#5f2c82", w: 140, d: 120 },
    { label: "Bedroom", area: rooms.bedroom_size, color: "#c4502e", w: 150, d: 130 },
    { label: "Bathroom", area: rooms.bathroom_size, color: "#2f7a4f", w: 90, d: 90 },
  ] : [];

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Dark futuristic studio stage — full bleed
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-[#06080d]">
        {/* glow accents */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal/20 blur-[110px]" />
        <div className="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-terracotta/15 blur-[100px]" />
        {/* fine scanline texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #2dd4bf 0px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Studio header */}
        <div className="relative flex items-center gap-3 px-9 py-8 max-md:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal shadow-[0_0_20px_-4px_rgba(45,212,191,0.5)]">
            <Boxes className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-teal/80">3D Studio</span>
            <h2 className="font-display text-2xl font-semibold text-white">Massing preview</h2>
          </div>
        </div>

        {/* Input rail — glass panel */}
        <div className="relative px-9 pb-7 max-md:px-6">
          <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <div className="flex-1 min-w-[110px]">
              <label htmlFor="td-area" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Area (sqft)</label>
              <input
                id="td-area" type="number" min="100" value={form.area}
                onChange={(e) => update("area", Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-teal/50 focus:bg-white/10"
              />
            </div>
            <div className="flex-1 min-w-[110px]">
              <label htmlFor="td-bed" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Bedrooms</label>
              <input
                id="td-bed" type="number" min="1" max="10" value={form.bedrooms}
                onChange={(e) => update("bedrooms", Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-teal/50 focus:bg-white/10"
              />
            </div>
            <div className="flex-1 min-w-[110px]">
              <label htmlFor="td-bath" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Bathrooms</label>
              <input
                id="td-bath" type="number" min="1" max="10" value={form.bathrooms}
                onChange={(e) => update("bathrooms", Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-teal/50 focus:bg-white/10"
              />
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-teal to-teal-deep px-5 py-2.5 text-sm font-semibold text-navy-deep shadow-[0_0_24px_-6px_rgba(45,212,191,0.7)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Sparkles className="h-4 w-4" strokeWidth={2.5} />}
              {loading ? "Building…" : "Generate"}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------
            Viewport — perspective floor grid + floating
            glass toolbar overlay, Blender/Autodesk style
        --------------------------------------------------- */}
        {rooms && (
          <div className="relative px-9 pb-9 max-md:px-6">
            <div
              className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/10"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.08), transparent 70%), linear-gradient(180deg, #0a0e16 0%, #06080d 100%)",
              }}
            >
              {/* converging perspective floor grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(45,212,191,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.4) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  maskImage: "radial-gradient(ellipse 70% 70% at 50% 65%, black 30%, transparent 75%)",
                  WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 65%, black 30%, transparent 75%)",
                }}
              />

              {/* rotated block scene */}
              <div style={{ perspective: "1100px" }}>
                <div
                  style={{
                    position: "relative",
                    width: 300,
                    height: 220,
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
                    transition: "transform 0.15s ease",
                  }}
                >
                  {blocks.map((b, i) => {
                    const height = Math.max(20, Math.min(b.area / 4, 70));
                    const left = (i % 2) * 150;
                    const top = Math.floor(i / 2) * 110;
                    return (
                      <div
                        key={b.label}
                        style={{
                          position: "absolute",
                          left,
                          top,
                          width: b.w * 0.55,
                          height: b.d * 0.55,
                          background: b.color,
                          opacity: 0.92,
                          transform: `translateZ(${height / 2}px)`,
                          borderRadius: 3,
                          boxShadow: `0 0 0 ${height}px ${b.color}33, 0 0 30px -4px ${b.color}AA`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontFamily: "JetBrains Mono, ui-monospace, monospace",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        <strong style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11 }}>{b.label}</strong>
                        {b.area} sqft
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating glass control toolbar */}
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <RotateCw className="h-4 w-4 text-teal" strokeWidth={2} />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Tilt {rotation.x}°</div>
                    <input
                      type="range" min="20" max="80" value={rotation.x}
                      onChange={(e) => setRotation((r) => ({ ...r, x: Number(e.target.value) }))}
                      className="h-1 w-32 cursor-pointer accent-teal"
                    />
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <Move3d className="h-4 w-4 text-terracotta" strokeWidth={2} />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Spin {rotation.z}°</div>
                    <input
                      type="range" min="-180" max="180" value={rotation.z}
                      onChange={(e) => setRotation((r) => ({ ...r, z: Number(e.target.value) }))}
                      className="h-1 w-32 cursor-pointer accent-terracotta"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-slate-500">
              Illustrative block massing only — not architecturally to scale. See the Floor Plan tab for the precise 2D layout.
            </p>
          </div>
        )}

        {!rooms && (
          <div className="relative px-9 pb-9 max-md:px-6">
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 text-center">
              <Boxes className="h-8 w-8 text-white/15" strokeWidth={1.5} />
              <p className="max-w-xs text-sm text-slate-500">
                Enter your room details and generate to see the 3D massing preview.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
