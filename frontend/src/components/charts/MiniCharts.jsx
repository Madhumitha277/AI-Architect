// Lightweight, dependency-free SVG charts — avoids npm peer-dependency
// issues (recharts etc. don't officially support React 19 yet).

export function Sparkline({ data, color = "#2dd4bf", height = 36, width = 100 }) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} />;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon points={areaPoints} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniBarChart({ data, color = "#e86a33", height = 140 }) {
  if (!data || data.length === 0) {
    return <div style={{ height }} />;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max((d.value / max) * 100, 4)}%`,
                background: `linear-gradient(180deg, ${color}, ${color}99)`,
              }}
            />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function RadialGauge({ value, max, color = "#2dd4bf", size = 120, label }) {
  const pct = Math.max(0, Math.min(value / max, 1));
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-lg font-semibold text-navy">{Math.round(pct * 100)}%</span>
        {label && <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>}
      </div>
    </div>
  );
}
