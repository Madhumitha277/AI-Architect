import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import { Sparkline, MiniBarChart } from "./charts/MiniCharts";
import {
  LayoutGrid, FolderClock, MessageSquareText, Sparkles,
  Clock3, FileStack, LogOut, ArrowUpRight, Building2, TrendingUp,
} from "lucide-react";

export function LoginGate({ children }) {
  const { user, login } = useAuth();
  const [name, setName] = useState("");

  if (user) return children;

  return (
    <div className="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div className="hero-inner" style={{ padding: "60px 32px" }}>
        <span className="eyebrow">AI Architect</span>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>Welcome,<br /><em>architect.</em></h1>
        <p className="lede">Sign in with a name or email to save plans, track
          history, and pick up where you left off.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); login(name); }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 420, margin: "0 auto" }}
        >
          <input
            type="text"
            placeholder="Your name or email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              flex: 1, minWidth: 220, padding: "13px 16px", borderRadius: 4,
              border: "1.5px solid rgba(234,244,248,0.35)", background: "rgba(255,255,255,0.06)",
              color: "#eaf4f8", fontSize: 15
            }}
          />
          <button className="btn btn-primary" type="submit">Enter</button>
        </form>
        <p className="note" style={{ color: "#9bb3bd", marginTop: 16 }}>
          No password needed — this just keeps your plans organized under one name.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard({ setTab }) {
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/history/${encodeURIComponent(user.name)}`);
        if (active) setPlans(res.data.plans || []);
      } catch {
        if (active) setError("Couldn't load your saved plans. Make sure the backend is running.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user.name]);

  const initial = user.name.trim().charAt(0).toUpperCase() || "A";

  // Derived, presentation-only data computed from the already-fetched `plans`
  // array — no new API calls, no business logic changes.
  const growthTrend = plans.length
    ? plans.slice().reverse().map((_, i) => i + 1)
    : [0, 0];

  const monthBuckets = (() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: d.toLocaleString("en", { month: "short" }), year: d.getFullYear(), month: d.getMonth(), value: 0 });
    }
    plans.forEach((p) => {
      const d = new Date(p.created_at);
      const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
      if (bucket) bucket.value += 1;
    });
    return buckets;
  })();

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Full-bleed dark blueprint hero
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-navy-deep pb-24 pt-12 max-md:pb-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-terracotta/20 blur-[120px]"
        />

        <div className="relative px-9 max-md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-deep font-display text-2xl font-semibold text-white shadow-lg shadow-terracotta/30">
                {initial}
              </div>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">Project dashboard</span>
                <h2 className="font-display text-3xl font-semibold text-white">
                  {user.name}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                  Joined {new Date(user.joined).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-terracotta/50 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------
          KPI cards — overlap the hero's bottom edge
      --------------------------------------------------- */}
      <div className="relative -mt-16 px-9 max-md:px-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-navy/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saved plans</span>
              <FileStack className="h-4 w-4 text-terracotta" strokeWidth={2} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="font-mono text-3xl font-semibold text-navy">
                {loading ? <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-100" /> : plans.length}
              </span>
              {!loading && plans.length > 0 && <Sparkline data={growthTrend} color="#e86a33" />}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-navy/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last activity</span>
              <FolderClock className="h-4 w-4 text-teal-deep" strokeWidth={2} />
            </div>
            <div className="mt-2 font-mono text-xl font-semibold text-navy">
              {plans[0] ? new Date(plans[0].created_at).toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-navy to-navy-deep p-5 shadow-xl shadow-navy/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal">Status</span>
              <Sparkles className="h-4 w-4 text-teal" strokeWidth={2} />
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              {loading ? "Syncing…" : "All systems ready"}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------
          Body — activity chart + connected timeline
      --------------------------------------------------- */}
      <div className="px-9 pb-9 pt-10 max-md:px-5 max-md:pb-7">
        {error && (
          <div className="mb-6 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm font-medium text-terracotta-deep">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Activity chart */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-terracotta" strokeWidth={2} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plans generated, last 6 months</h3>
            </div>
            <MiniBarChart data={monthBuckets} color="#e86a33" />
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick actions</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => setTab("plan")}
                className="group flex flex-col items-start gap-3 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-deep p-4 text-left text-white shadow-md shadow-terracotta/25 transition hover:-translate-y-0.5"
              >
                <Building2 className="h-5 w-5" strokeWidth={2} />
                <span className="text-sm font-medium">New floor plan</span>
                <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => setTab("history")}
                className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 p-4 text-left text-navy transition hover:-translate-y-0.5 hover:border-navy/20"
              >
                <LayoutGrid className="h-5 w-5 text-navy/70" strokeWidth={2} />
                <span className="text-sm font-medium">View saved plans</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-navy" />
              </button>

              <button
                onClick={() => setTab("chat")}
                className="group flex flex-col items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-4 text-left text-navy transition hover:-translate-y-0.5"
              >
                <MessageSquareText className="h-5 w-5 text-teal-deep" strokeWidth={2} />
                <span className="text-sm font-medium">Ask the AI assistant</span>
                <ArrowUpRight className="h-4 w-4 text-teal/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-deep" />
              </button>
            </div>
          </div>
        </div>

        {/* Connected timeline */}
        {plans.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Recent activity</h3>
            <div className="relative">
              <div className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-200" />
              <div className="space-y-6">
                {plans.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="relative flex items-start gap-4 pl-0">
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-terracotta text-white" : "bg-slate-100 text-slate-400"}`}>
                      <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-sm font-semibold text-navy">{p.title}</div>
                      <div className="font-mono text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && plans.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">
              No saved plans yet. Generate your first floor plan to see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
