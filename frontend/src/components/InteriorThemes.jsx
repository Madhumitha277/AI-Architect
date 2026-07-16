import { useState } from "react";
import { Palette, Check, Sparkles, LayoutPanelTop } from "lucide-react";

const THEMES = [
  {
    id: "modern",
    name: "Modern Minimalist",
    palette: ["#f4f1ec", "#d6cfc1", "#2c2c2c", "#b08968"],
    description: "Clean lines, neutral tones, warm wood accents, and plenty of negative space.",
    materials: ["Matte white walls", "Engineered oak flooring", "Brushed brass fixtures", "Low-profile furniture"],
  },
  {
    id: "contemporary",
    name: "Contemporary",
    palette: ["#ffffff", "#9fb4c7", "#1c2230", "#c4502e"],
    description: "Bold contrast, statement lighting, and a mix of textures — glass, metal, and stone.",
    materials: ["Polished concrete floors", "Glass partitions", "Black steel frames", "Statement pendant lights"],
  },
  {
    id: "traditional",
    name: "Traditional Indian",
    palette: ["#7a2e2e", "#d9a441", "#3b2417", "#f3e5c4"],
    description: "Rich wood carvings, warm earthy tones, and classic symmetry.",
    materials: ["Teak wood furniture", "Marble inlay flooring", "Brass lamps", "Hand-block printed fabrics"],
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    palette: ["#fafafa", "#e3dccb", "#9c9c94", "#4a5759"],
    description: "Light woods, soft neutrals, cozy textiles, and abundant natural light.",
    materials: ["Whitewashed pine floors", "Wool textiles", "Light oak furniture", "Linen curtains"],
  },
  {
    id: "industrial",
    name: "Industrial",
    palette: ["#3c3c3c", "#6e6259", "#b5651d", "#1a1a1a"],
    description: "Exposed brick, raw metal, and utilitarian fixtures with a loft-like feel.",
    materials: ["Exposed brick walls", "Iron pipe shelving", "Polished cement floors", "Edison bulb lighting"],
  },
  {
    id: "coastal",
    name: "Coastal",
    palette: ["#eef5f7", "#a7c5cf", "#4c7c8c", "#e8d8b9"],
    description: "Breezy, light, and airy — whites and blues with natural fiber textures.",
    materials: ["White-washed walls", "Rattan furniture", "Light linen upholstery", "Sea-glass accents"],
  },
];

// Display-only category labels, keyed off the existing theme ids —
// purely cosmetic, THEMES data itself is untouched.
const CATEGORY_LABELS = {
  modern: "Minimalist",
  contemporary: "Luxury",
  traditional: "Classic",
  scandinavian: "Scandinavian",
  industrial: "Industrial",
  coastal: "Modern",
};

export default function InteriorThemes() {
  const [selected, setSelected] = useState(null);
  const activeTheme = THEMES.find((t) => t.id === selected);

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Gallery hero — soft gradient mesh, Adobe-Color style
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fdfbf9] via-white to-[#f3eef7]">
        <div className="pointer-events-none absolute -left-10 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-amber-200/30 blur-[90px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/40 to-teal/20 blur-[100px]" />

        <div className="relative flex items-center gap-3 px-9 py-8 max-md:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 via-amber-300 to-teal-400 text-white shadow-md">
            <Palette className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Style gallery</span>
            <h2 className="font-display text-2xl font-semibold text-navy">Interior themes</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Curated palettes with live previews and suggested materials for every room.
            </p>
          </div>
        </div>

        {/* Gradient swatch gallery */}
        <div className="relative grid grid-cols-1 gap-6 px-9 pb-9 sm:grid-cols-2 lg:grid-cols-3 max-md:px-6">
          {THEMES.map((theme) => {
            const isActive = selected === theme.id;
            const gradient = `linear-gradient(135deg, ${theme.palette.join(", ")})`;
            return (
              <button
                key={theme.id}
                onClick={() => setSelected(theme.id === selected ? null : theme.id)}
                className={`group overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  isActive ? "border-navy/30 ring-2 ring-navy/15" : "border-slate-100"
                }`}
              >
                {/* Gradient swatch / room preview thumbnail */}
                <div className="relative h-36 w-full" style={{ background: gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                  {/* abstract room preview thumbnail */}
                  <div className="absolute inset-3 overflow-hidden rounded-xl border border-white/30">
                    <div className="h-2/3 w-full" style={{ background: theme.palette[0] }} />
                    <div className="flex h-1/3 w-full">
                      <div className="h-full w-2/3" style={{ background: theme.palette[3] || theme.palette[1] }} />
                      <div className="h-full w-1/3" style={{ background: theme.palette[2] }} />
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-navy shadow-md">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-navy backdrop-blur-sm">
                    {CATEGORY_LABELS[theme.id] || "Style"}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="mb-2 flex gap-1.5">
                    {theme.palette.map((c, i) => (
                      <span
                        key={i}
                        className="h-5 w-5 rounded-full border border-black/5 shadow-sm transition group-hover:scale-110"
                        style={{ background: c, transitionDelay: `${i * 30}ms` }}
                      />
                    ))}
                  </div>
                  <div className="font-display text-base font-semibold text-navy">{theme.name}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{theme.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live theme preview + materials */}
        {activeTheme && (
          <div className="relative px-9 pb-9 max-md:px-6">
            <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-md">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                  <Sparkles className="h-4 w-4 text-terracotta" strokeWidth={2} />
                  Live preview — {activeTheme.name}
                </h3>
                <span className="flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-navy/60">
                  <LayoutPanelTop className="h-3 w-3" strokeWidth={2} />
                  {CATEGORY_LABELS[activeTheme.id] || "Style"}
                </span>
              </div>

              {/* Larger live room preview built from the palette */}
              <div className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
                  <div className="h-2/3 w-full" style={{ background: activeTheme.palette[0] }} />
                  <div className="flex h-1/3 w-full">
                    <div className="h-full w-1/2" style={{ background: activeTheme.palette[3] || activeTheme.palette[1] }} />
                    <div className="h-full w-1/2" style={{ background: activeTheme.palette[1] }} />
                  </div>
                  <div
                    className="absolute bottom-6 left-6 h-16 w-24 rounded-md shadow-lg"
                    style={{ background: activeTheme.palette[2] }}
                  />
                  <div
                    className="absolute bottom-6 right-6 h-10 w-10 rounded-full shadow-lg"
                    style={{ background: activeTheme.palette[3] || activeTheme.palette[0] }}
                  />
                </div>

                <div className="flex flex-col justify-center gap-2.5">
                  {activeTheme.palette.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
                      <span className="h-9 w-9 shrink-0 rounded-lg border border-black/5 shadow-sm" style={{ background: c }} />
                      <span className="font-mono text-xs uppercase tracking-wide text-slate-500">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested materials */}
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested materials</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {activeTheme.materials.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm font-medium text-navy transition hover:-translate-y-0.5 hover:border-navy/15 hover:bg-white hover:shadow-sm"
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
