import { useRef, useState } from "react";
import api from "../api";
import {
  Camera, Upload, Sparkles, Sofa, BedDouble, Briefcase,
  Loader2, AlertCircle, ImageOff, SwatchBook, X,
} from "lucide-react";

const ROOM_TYPES = ["living room", "bedroom", "office"];

const ROOM_ICONS = {
  "living room": Sofa,
  "bedroom": BedDouble,
  "office": Briefcase,
};

// Purely decorative texture swatches cycled per suggestion card —
// does not touch the actual `suggestions` data returned by the API.
const SWATCH_TEXTURES = [
  "linear-gradient(135deg, #e8ddd0 0%, #c9b8a3 50%, #ad9579 100%)", // marble/stone
  "repeating-linear-gradient(100deg, #8a5a36 0px, #6e431f 6px, #8a5a36 12px)", // wood
  "linear-gradient(135deg, #9a9a96 0%, #b9b9b4 50%, #8c8c87 100%)", // concrete
  "repeating-linear-gradient(45deg, #d8c7a1 0px, #d8c7a1 4px, #c9b489 4px, #c9b489 8px)", // wallpaper weave
  "linear-gradient(135deg, #c4502e 0%, #a23d20 100%)", // paint finish
];

export default function WallDesign() {
  const [roomType, setRoomType] = useState("living room");
  const [image, setImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setError("Couldn't access the camera. Check your browser permissions, or upload a photo instead.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setImage(blob);
    }, "image/jpeg", 0.92);
    stopCamera();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const getSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/wall-design", { room_type: roomType });
      setSuggestions(res.data.recommendations || res.data);
    } catch (err) {
      setError("Couldn't fetch wall design suggestions. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-m-9 max-md:-m-6">
      {/* ---------------------------------------------------
          Material studio — seamless-paper backdrop, soft
          overhead spotlight, like a photography studio
      --------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#e9e4dc] via-[#ddd6cb] to-[#cfc6b8]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[640px] -translate-x-1/2 rounded-full bg-white/50 blur-[110px]" />

        {/* Studio header */}
        <div className="relative flex items-center gap-3 px-9 py-8 max-md:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-cream shadow-md">
            <SwatchBook className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-navy/50">Material studio</span>
            <h2 className="font-display text-2xl font-semibold text-navy">Wall design assistant</h2>
            <p className="mt-0.5 text-sm text-navy/60">
              Snap or upload a wall photo, choose the room, and receive curated finish recommendations.
            </p>
          </div>
        </div>

        {/* Room type — premium card selector, replaces dropdown */}
        <div className="relative px-9 pb-6 max-md:px-6">
          <span className="mb-3 block font-mono text-[11px] uppercase tracking-wider text-navy/50">Room type</span>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            {ROOM_TYPES.map((r) => {
              const Icon = ROOM_ICONS[r] || Sofa;
              const active = roomType === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoomType(r)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 ${
                    active
                      ? "border-navy bg-navy text-cream shadow-md"
                      : "border-navy/10 bg-white/70 text-navy backdrop-blur-sm hover:border-navy/30"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-xs font-semibold capitalize">{r}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capture / upload controls */}
        <div className="relative flex flex-wrap items-center gap-3 px-9 pb-7 max-md:px-6">
          {!cameraOn ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 rounded-full border border-navy/15 bg-white/80 px-5 py-2.5 text-sm font-medium text-navy shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-navy/30"
            >
              <Camera className="h-4 w-4" strokeWidth={2} />
              Use camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 rounded-full border border-terracotta/40 bg-white/80 px-5 py-2.5 text-sm font-medium text-terracotta-deep shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5"
            >
              <X className="h-4 w-4" strokeWidth={2} />
              Cancel camera
            </button>
          )}

          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-navy/15 bg-white/80 px-5 py-2.5 text-sm font-medium text-navy shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-navy/30">
            <Upload className="h-4 w-4" strokeWidth={2} />
            Upload photo
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </label>

          <button
            onClick={getSuggestions}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-terracotta/25 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Sparkles className="h-4 w-4" strokeWidth={2.5} />}
            {loading ? "Thinking…" : "Get wall design ideas"}
          </button>
        </div>

        {cameraOn && (
          <div className="relative px-9 pb-7 max-md:px-6">
            <div className="overflow-hidden rounded-2xl border border-navy/10 bg-black shadow-lg">
              <video ref={videoRef} className="w-full max-w-xl" muted playsInline />
            </div>
            <button
              onClick={capturePhoto}
              className="mt-4 flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream shadow-md transition hover:-translate-y-0.5"
            >
              <Camera className="h-4 w-4" strokeWidth={2} />
              Capture photo
            </button>
          </div>
        )}

        {error && (
          <div className="relative mx-9 mb-7 flex items-start gap-2.5 rounded-xl border border-terracotta/30 bg-white/80 px-4 py-3 text-sm font-medium text-terracotta-deep backdrop-blur-sm max-md:mx-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ---------------------------------------------------
            Before / Inspiration split — wall photo vs swatches
        --------------------------------------------------- */}
        {(image || suggestions.length > 0) && !cameraOn && (
          <div className="relative grid grid-cols-1 gap-6 px-9 pb-9 lg:grid-cols-2 max-md:px-6">

            {/* "Before" — captured/uploaded wall */}
            <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white/80 shadow-md backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-navy/10 px-5 py-3.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-navy/50">Your wall</span>
                <span className="rounded-full bg-navy/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-navy/50">Before</span>
              </div>
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Captured wall"
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 flex-col items-center justify-center gap-2 text-navy/30">
                  <ImageOff className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-xs">No photo yet — upload or capture one above</span>
                </div>
              )}
            </div>

            {/* "Inspiration" — recommended material swatches */}
            <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white/80 shadow-md backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-navy/10 px-5 py-3.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-navy/50">Recommended finishes</span>
                <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-terracotta-deep">Inspiration</span>
              </div>
              {suggestions.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 p-4">
                  {suggestions.map((item, i) => (
                    <div
                      key={i}
                      className="group overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className="h-16 w-full transition group-hover:scale-105"
                        style={{ background: SWATCH_TEXTURES[i % SWATCH_TEXTURES.length] }}
                      />
                      <div className="p-3">
                        <span className="text-xs font-semibold text-navy">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center gap-2 text-navy/30">
                  <SwatchBook className="h-8 w-8" strokeWidth={1.5} />
                  <span className="px-6 text-center text-xs">Click "Get wall design ideas" to see recommended finishes here</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
