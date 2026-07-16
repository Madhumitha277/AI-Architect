import { useEffect, useRef, useState } from "react";
import api from "../api";
import {
  Send, Bot, User, Building2, IndianRupee,
  Layers, Wallet, Paintbrush, Compass, Loader2,
  LayoutTemplate, Home, BedDouble, ChefHat, ShowerHead,
  DoorOpen, Package, Link2, Grid3x3, Mountain, CircleDot,
  PaintBucket, LayoutGrid, TrendingDown,
} from "lucide-react";

const STARTERS = [
  "Generate a 2bhk plan for 1200 sqft with 2 bathrooms",
  "Cost for 1500 sqft",
  "Materials for 1500 sqft",
  "My budget is 15 lakhs for a 3bhk",
  "Wall design ideas for bedroom",
  "Tell me about vastu",
];

// Icon + accent per starter — purely decorative,
// STARTERS array itself is untouched.
const STARTER_META = [
  { icon: Building2,    accent: "#e86a33", bg: "rgba(232,106,51,0.08)" },
  { icon: IndianRupee,  accent: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  { icon: Layers,       accent: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { icon: Wallet,       accent: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { icon: Paintbrush,   accent: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { icon: Compass,      accent: "#2dd4bf", bg: "rgba(45,212,191,0.08)" },
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your AI Architect assistant. Ask me to generate a floor plan, estimate cost or materials, optimize your budget, or suggest wall designs and Vastu rules." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const windowRef = useRef(null);

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.scrollTop = windowRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/chat", { message });
      const { reply, data } = res.data;
      setMessages((m) => [...m, { role: "bot", text: reply, data }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: "I couldn't reach the backend just now. Make sure the API server is running and try again." }]);
    } finally {
      setSending(false);
    }
  };

  // ── Structured card renderers ─────────────────────────────────
  // Only the presentation layer changes here.
  // The `data` object shape comes 100% from the existing API — untouched.

  const MATERIAL_ICONS = {
    cement: Package, steel: Link2, bricks: Grid3x3, sand: Mountain,
    aggregate: CircleDot, paint: PaintBucket, tiles: LayoutGrid,
  };

  const VASTU_META = {
    entrance:       { Icon: DoorOpen,  label: "Entrance" },
    kitchen:        { Icon: ChefHat,   label: "Kitchen" },
    master_bedroom: { Icon: BedDouble, label: "Master Bedroom" },
    living_room:    { Icon: Home,      label: "Living Room" },
  };

  const ROOM_META = {
    living_room:    { Icon: Home,       label: "Living Room" },
    bedroom_size:   { Icon: BedDouble,  label: "Each Bedroom" },
    kitchen:        { Icon: ChefHat,    label: "Kitchen" },
    bathroom_size:  { Icon: ShowerHead, label: "Each Bathroom" },
  };

  const renderData = (data) => {
    if (!data) return null;

    // ── Floor plan image ─────────────────────────────────────────
    if (data.image_url) {
      return (
        <img
          src={`${data.image_url}?t=${Date.now()}`}
          alt="Generated floor plan"
          className="mt-3 w-full rounded-xl border border-white/20"
        />
      );
    }

    const rendered = [];

    // ── Vastu rules ──────────────────────────────────────────────
    const vastu = data.vastu_rules || (data.entrance && data);
    if (vastu && (vastu.entrance || vastu.kitchen)) {
      rendered.push(
        <div key="vastu" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-teal-deep">
            <Compass className="h-3 w-3" strokeWidth={2} />
            Vastu layout
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(VASTU_META).map(([key, { Icon, label }]) => {
              const val = vastu[key];
              if (!val) return null;
              return (
                <div key={key} className="flex items-center gap-2.5 rounded-xl border border-teal/20 bg-teal/5 px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal-deep">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="text-sm font-semibold text-navy">{val}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Room allocation ──────────────────────────────────────────
    const rooms = data.rooms;
    if (rooms && (rooms.living_room || rooms.bedroom_size)) {
      rendered.push(
        <div key="rooms" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-blue-500">
            <Building2 className="h-3 w-3" strokeWidth={2} />
            Room allocation
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ROOM_META).map(([key, { Icon, label }]) => {
              const val = rooms[key];
              if (!val) return null;
              return (
                <div key={key} className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="font-mono text-sm font-semibold text-navy">{val} <span className="text-[10px] font-normal text-slate-400">sqft</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Cost estimation ──────────────────────────────────────────
    const cost = data.cost_estimation;
    if (cost && (cost.basic || cost.standard || cost.premium)) {
      rendered.push(
        <div key="cost" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-terracotta">
            <IndianRupee className="h-3 w-3" strokeWidth={2} />
            Cost estimation
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { tier: "Basic",    key: "basic",    accent: "border-slate-200 bg-slate-50", text: "text-slate-600" },
              { tier: "Standard", key: "standard", accent: "border-terracotta/40 bg-terracotta/8", text: "text-terracotta-deep" },
              { tier: "Premium",  key: "premium",  accent: "border-slate-200 bg-slate-50", text: "text-slate-600" },
            ].map(({ tier, key, accent, text }) => (
              <div key={key} className={`rounded-xl border ${accent} p-3 text-center`}>
                <div className={`font-mono text-[9px] uppercase tracking-wider ${text}`}>{tier}</div>
                <div className={`mt-1 font-mono text-xs font-semibold ${text}`}>
                  ₹{(cost[key] || 0).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Material estimation ──────────────────────────────────────
    const mat = data.material_estimation || (data.materials && data);
    const materials = mat?.materials;
    const matCosts  = mat?.estimated_material_cost || {};
    const totalCost = mat?.total_material_cost || 1;

    if (materials && Object.keys(materials).length > 0) {
      rendered.push(
        <div key="materials" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-green-600">
            <Layers className="h-3 w-3" strokeWidth={2} />
            Material estimation
          </p>
          <div className="space-y-1.5">
            {Object.entries(materials).map(([key, info]) => {
              const Icon = MATERIAL_ICONS[key] || Package;
              const itemCost = matCosts[key] || 0;
              const pct = totalCost > 1 ? Math.round((itemCost / totalCost) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2.5 rounded-xl border border-green-100 bg-green-50/50 px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <span className="text-xs font-semibold capitalize text-navy">{key}</span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{info.quantity} {info.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="h-1 w-10 overflow-hidden rounded-full bg-green-100">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-green-700 w-16 text-right">
                      ₹{itemCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-green-700">Total</span>
              <span className="font-mono text-sm font-bold text-green-700">₹{(mat.total_material_cost || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      );
    }

    // ── Budget tier breakdown ─────────────────────────────────────
    const tiers = data.tier_breakdown;
    if (tiers && Object.keys(tiers).length > 0) {
      rendered.push(
        <div key="budget" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-600">
            <Wallet className="h-3 w-3" strokeWidth={2} />
            Budget breakdown
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(tiers).map(([tier, info]) => (
              <div key={tier} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center">
                <div className="font-mono text-[9px] uppercase tracking-wider text-amber-700">{tier}</div>
                <div className="mt-1 font-mono text-xs font-bold text-navy">{info.max_affordable_area?.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">sqft</span></div>
                <div className="font-mono text-[10px] text-amber-600">{info.max_affordable_bhk || 0} BHK max</div>
              </div>
            ))}
          </div>
          {data.recommendations?.length > 0 && (
            <div className="mt-2 space-y-1">
              {data.recommendations.slice(0, 3).map((tip, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" strokeWidth={2} />
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── Wall design suggestions (array) ──────────────────────────
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
      rendered.push(
        <div key="walldesign" className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-500">
            <Paintbrush className="h-3 w-3" strokeWidth={2} />
            Design suggestions
          </p>
          <div className="space-y-1.5">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-purple-100 bg-purple-50/60 px-3 py-2.5">
                <div className="h-2 w-2 shrink-0 rounded-full bg-purple-400" />
                <span className="text-sm text-navy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Recommendations array (wall design from object) ──────────
    if (data.recommendations && Array.isArray(data.recommendations) && !tiers) {
      rendered.push(
        <div key="recs" className="mt-3 space-y-1.5">
          {data.recommendations.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-purple-100 bg-purple-50/60 px-3 py-2.5">
              <div className="h-2 w-2 shrink-0 rounded-full bg-purple-400" />
              <span className="text-sm text-navy">{item}</span>
            </div>
          ))}
        </div>
      );
    }

    // ── Fallback: raw JSON for any unrecognised structure ────────
    if (rendered.length === 0) {
      return (
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[12px] text-slate-600">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }

    return <>{rendered}</>;
  };

  const isOnlyWelcome = messages.length === 1;

  return (
    <div className="-m-9 flex max-md:-m-6" style={{ height: "calc(100vh - 180px)", minHeight: 560 }}>

      {/* =====================================================
          Left sidebar — branding + prompt cards
      ===================================================== */}
      <div
        className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/10 px-6 py-8 lg:flex"
        style={{
          background: "linear-gradient(160deg, #0f2a43 0%, #0a1f30 60%, #081a28 100%)",
        }}
      >
        {/* Sidebar top — branding */}
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta to-terracotta-deep text-white shadow-lg shadow-terracotta/30">
              <Bot className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="font-display text-base font-semibold text-white">AI Architect</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-teal/70">Assistant</div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">What I can do</span>
            <div className="mt-3 space-y-2.5">
              {[
                { icon: Building2,   label: "Generate floor plans" },
                { icon: IndianRupee, label: "Estimate project cost" },
                { icon: Layers,      label: "Calculate materials" },
                { icon: Wallet,      label: "Optimize your budget" },
                { icon: Paintbrush,  label: "Suggest wall designs" },
                { icon: Compass,     label: "Vastu consultations" },
                { icon: LayoutTemplate, label: "Layout recommendations" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-slate-400">
                  <Icon className="h-3.5 w-3.5 text-teal/60 shrink-0" strokeWidth={2} />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar bottom — conversation count */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Conversation</div>
          <div className="mt-1 font-mono text-xl font-semibold text-white">{messages.length}</div>
          <div className="mt-0.5 text-xs text-slate-500">messages exchanged</div>
        </div>
      </div>

      {/* =====================================================
          Main chat area
      ===================================================== */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">

        {/* Chat header bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-terracotta to-terracotta-deep text-white shadow-sm">
            <Bot className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-semibold text-navy">AI Architect Assistant</div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Online</span>
            </div>
          </div>
        </div>

        {/* Message list */}
        <div
          ref={windowRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          {/* Welcome card — shown only at conversation start */}
          {isOnlyWelcome && (
            <div className="mx-auto mb-6 max-w-lg text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-teal shadow-xl shadow-navy/20">
                <Bot className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy">Your AI Architect</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Ask anything about floor plans, costs, materials, budgets, wall designs, or Vastu guidelines.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                m.role === "user"
                  ? "bg-gradient-to-br from-terracotta to-terracotta-deep text-white"
                  : "bg-gradient-to-br from-navy to-navy-deep text-teal"
              }`}>
                {m.role === "user"
                  ? <User className="h-4 w-4" strokeWidth={2} />
                  : <Bot className="h-4 w-4" strokeWidth={2} />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-gradient-to-br from-navy to-navy-deep text-white"
                  : "rounded-bl-sm border border-slate-100 bg-white text-navy"
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                {m.role === "bot" && renderData(m.data)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-end gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-deep text-teal shadow-sm">
                <Bot className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" strokeWidth={2} />
                <span className="text-sm text-slate-400">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Starter prompt chips — visible only on fresh conversation */}
        {isOnlyWelcome && (
          <div className="border-t border-slate-100 bg-white px-6 py-4">
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Try asking
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {STARTERS.map((s, i) => {
                const meta = STARTER_META[i] || STARTER_META[0];
                const Icon = meta.icon;
                return (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="group flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-110"
                      style={{ background: meta.bg }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} style={{ color: meta.accent }} />
                    </span>
                    <span className="text-xs leading-relaxed text-slate-600">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input bar — pinned to bottom */}
        <div className="border-t border-slate-100 bg-white/90 px-6 py-4 backdrop-blur-sm">
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              type="text"
              placeholder="Ask about a plan, cost, materials, or budget…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-navy outline-none transition focus:border-navy/30 focus:bg-white focus:ring-2 focus:ring-navy/8 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-deep text-white shadow-md shadow-terracotta/25 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {sending
                ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                : <Send className="h-4 w-4" strokeWidth={2.5} />
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
