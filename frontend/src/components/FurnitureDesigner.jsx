import { useRef, useState } from "react";
import {
  BedDouble, Armchair, UtensilsCrossed, Shirt, Tv, PencilRuler,
  Sofa, Trash2, MousePointerClick,
} from "lucide-react";

const CATALOG = [
  { id: "bed", label: "Bed", w: 90, h: 60, color: "#c4502e" },
  { id: "sofa", label: "Sofa", w: 100, h: 45, color: "#0c2d48" },
  { id: "table", label: "Dining Table", w: 70, h: 70, color: "#5f2c82" },
  { id: "wardrobe", label: "Wardrobe", w: 50, h: 30, color: "#2f7a4f" },
  { id: "tv", label: "TV Unit", w: 60, h: 20, color: "#756c5c" },
  { id: "desk", label: "Study Desk", w: 55, h: 35, color: "#5fb8d1" },
];

const CATALOG_ICONS = {
  bed: BedDouble,
  sofa: Armchair,
  table: UtensilsCrossed,
  wardrobe: Shirt,
  tv: Tv,
  desk: PencilRuler,
};

let nextId = 1;

export default function FurnitureDesigner() {
  const [placed, setPlaced] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const roomRef = useRef(null);

  const onCatalogDragStart = (item) => setDragItem(item);

  const onRoomDrop = (e) => {
    e.preventDefault();
    if (!dragItem || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragItem.w / 2;
    const y = e.clientY - rect.top - dragItem.h / 2;
    setPlaced((p) => [...p, {
      ...dragItem,
      x: Math.max(0, Math.min(x, rect.width - dragItem.w)),
      y: Math.max(0, Math.min(y, rect.height - dragItem.h)),
      uid: nextId++,
    }]);
    setDragItem(null);
  };

  const movePlaced = (uid, dx, dy) => {
    setPlaced((items) => items.map((it) =>
      it.uid === uid ? { ...it, x: it.x + dx, y: it.y + dy } : it
    ));
  };

  const removeItem = (uid) => setPlaced((items) => items.filter((it) => it.uid !== uid));

  const clearAll = () => setPlaced([]);

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Warm showroom — beige/cream, soft wood texture
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-beige-warm via-beige to-cream">
        {/* subtle wood-grain stripes */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(100deg, #4a2c1a 0px, transparent 2px, transparent 26px, #4a2c1a 28px)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-walnut-light/15 blur-[100px]" />

        {/* Showroom header */}
        <div className="relative flex items-center gap-3 px-9 py-8 max-md:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-walnut text-cream shadow-md shadow-walnut/30">
            <Sofa className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-walnut-light">Interior showroom</span>
            <h2 className="font-display text-2xl font-semibold text-walnut-deep">Furniture designer</h2>
            <p className="mt-0.5 text-sm text-walnut-light">
              Drag a piece into the room to sketch your layout — drag again to reposition, double-click to remove.
            </p>
          </div>
        </div>

        {/* Product catalog — showroom cards */}
        <div className="relative px-9 pb-7 max-md:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATALOG.map((item) => {
              const Icon = CATALOG_ICONS[item.id] || Armchair;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onCatalogDragStart(item)}
                  className="group flex cursor-grab select-none flex-col items-center gap-3 rounded-2xl border border-walnut/10 bg-cream/80 p-5 text-center shadow-sm shadow-walnut/5 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-walnut/15"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-inner transition group-hover:scale-105"
                    style={{ background: `linear-gradient(145deg, ${item.color}, ${item.color}cc)` }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <span className="font-display text-sm font-semibold text-walnut-deep">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room canvas toolbar */}
        <div className="relative flex items-center justify-between px-9 pb-3 max-md:px-6">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-walnut-light">
            <MousePointerClick className="h-3.5 w-3.5" strokeWidth={2} />
            Showroom floor
          </span>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-full border border-walnut/20 bg-cream px-3.5 py-1.5 text-xs font-medium text-walnut-deep transition hover:border-terracotta/40 hover:text-terracotta-deep"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Clear all
          </button>
        </div>

        {/* Room canvas — herringbone wood floor */}
        <div className="relative px-9 pb-9 max-md:px-6">
          <div
            ref={roomRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onRoomDrop}
            className="relative h-[420px] w-full overflow-hidden rounded-2xl border-2 border-dashed border-walnut/25 shadow-inner"
            style={{
              backgroundColor: "#d9c4a3",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(74,44,26,0.10) 0px, rgba(74,44,26,0.10) 2px, transparent 2px, transparent 18px), repeating-linear-gradient(-45deg, rgba(74,44,26,0.10) 0px, rgba(74,44,26,0.10) 2px, transparent 2px, transparent 18px)",
            }}
          >
            {placed.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Armchair className="h-8 w-8 text-walnut/25" strokeWidth={1.5} />
                <p className="max-w-[220px] text-sm text-walnut/50">
                  Drag a piece of furniture from above into this room.
                </p>
              </div>
            )}
            {placed.map((item) => {
              const Icon = CATALOG_ICONS[item.id] || Armchair;
              return (
                <div
                  key={item.uid}
                  draggable
                  onDragEnd={(e) => {
                    const rect = roomRef.current.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left - item.w / 2, rect.width - item.w));
                    const y = Math.max(0, Math.min(e.clientY - rect.top - item.h / 2, rect.height - item.h));
                    movePlaced(item.uid, x - item.x, y - item.y);
                  }}
                  onDoubleClick={() => removeItem(item.uid)}
                  title="Drag to move, double-click to remove"
                  className="absolute flex cursor-grab flex-col items-center justify-center gap-0.5 rounded-lg text-white shadow-lg"
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.w,
                    height: item.h,
                    background: `linear-gradient(145deg, ${item.color}, ${item.color}dd)`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
                  <span className="font-mono text-[10px] leading-none">{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-walnut-light">Tip: double-click a placed item to remove it.</p>
        </div>
      </div>
    </div>
  );
}
