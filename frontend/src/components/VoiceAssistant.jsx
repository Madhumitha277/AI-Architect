import { useEffect, useRef, useState } from "react";
import api from "../api";
import { Mic, MicOff, Send, Bot, AlertCircle, Volume2 } from "lucide-react";

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// CSS-only waveform — purely decorative, 10 animated bars
function Waveform({ active }) {
  return (
    <div className={`flex items-end justify-center gap-[3px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-20"}`}
      style={{ height: 40 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${active ? "wave-bar" : ""}`}
          style={{
            height: active ? `${12 + ((i * 7 + 8) % 28)}px` : "6px",
            background: "linear-gradient(180deg, #2dd4bf, #818cf8)",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceAssistant() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Couldn't hear that clearly. Check mic permissions and try again.");
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript("");
    setReply("");
    setData(null);
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setError("Couldn't start the microphone.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const sendToAssistant = async () => {
    if (!transcript.trim()) return;
    setError(null);
    try {
      const res = await api.post("/chat", { message: transcript });
      setReply(res.data.reply);
      setData(res.data.data);
      speak(res.data.reply);
    } catch {
      setError("Couldn't reach the backend assistant.");
    }
  };

  // Determine current phase for UI state labelling
  const phase = listening ? "listening" : reply ? "replied" : transcript ? "ready" : "idle";

  if (!supported) {
    return (
      <div className="-m-9 max-md:-m-6">
        <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 bg-[#06080d] px-9 py-16 text-center max-md:px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
            <MicOff className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Speech not supported</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Your browser doesn't support speech recognition. Try Chrome or Edge on desktop or Android.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-9 max-md:-m-6">
      {/* =====================================================
          Full-bleed dark immersive stage
          Teal/purple/cyan — NOT navy/concrete/beige/green
      ===================================================== */}
      <div
        className="relative flex min-h-[600px] flex-col items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #060b12 0%, #080d18 50%, #06080d 100%)" }}
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-96 -translate-x-1/2 rounded-full bg-teal/12 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-56 w-56 rounded-full bg-violet-500/12 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-10 right-1/4 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px]" />

        {/* Header */}
        <div className="relative w-full px-9 pt-8 max-md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal shadow-[0_0_20px_-4px_rgba(45,212,191,0.5)]">
              <Mic className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-teal/70">Voice assistant</span>
              <h2 className="font-display text-2xl font-semibold text-white">AI Architect Voice</h2>
            </div>
          </div>
        </div>

        {/* Central mic stage */}
        <div className="relative flex flex-1 flex-col items-center justify-center py-12">

          {/* Pulse rings — shown only while listening */}
          {listening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="voice-ring-1 absolute h-40 w-40 rounded-full border border-teal/40" />
              <div className="voice-ring-2 absolute h-40 w-40 rounded-full border border-teal/30" />
              <div className="voice-ring-3 absolute h-40 w-40 rounded-full border border-teal/20" />
            </div>
          )}

          {/* Mic button */}
          <button
            onClick={listening ? stopListening : startListening}
            className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
              listening
                ? "scale-110 bg-gradient-to-br from-teal to-teal-deep shadow-teal/40"
                : "bg-gradient-to-br from-slate-700 to-slate-800 shadow-black/50 hover:from-teal/80 hover:to-teal-deep hover:shadow-teal/25 hover:scale-105"
            }`}
          >
            {listening ? (
              <MicOff className="h-12 w-12 text-navy-deep" strokeWidth={1.75} />
            ) : (
              <Mic className="h-12 w-12 text-white/80" strokeWidth={1.75} />
            )}
          </button>

          {/* Waveform bars */}
          <div className="mt-8">
            <Waveform active={listening} />
          </div>

          {/* Phase status label */}
          <div className="mt-5 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                listening ? "animate-pulse bg-teal" :
                phase === "replied" ? "bg-violet-400" :
                phase === "ready" ? "bg-amber-400" : "bg-slate-600"
              }`}
            />
            <span className="font-mono text-sm tracking-widest text-slate-400 uppercase">
              {listening ? "Listening…" :
               phase === "replied" ? "Assistant replied" :
               phase === "ready" ? "Ready to send" : "Tap mic to speak"}
            </span>
          </div>

          {/* Send button — shown when transcript is ready */}
          {transcript && !listening && (
            <button
              onClick={sendToAssistant}
              className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:-translate-y-0.5 hover:shadow-violet-500/30"
            >
              <Send className="h-4 w-4" strokeWidth={2.5} />
              Send to assistant
            </button>
          )}
        </div>

        {/* ---- Transcript card ---- */}
        {transcript && (
          <div className="relative w-full max-w-2xl px-9 pb-6 max-md:px-6">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
                <Mic className="h-3.5 w-3.5 text-teal/60" strokeWidth={2} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">You said</span>
              </div>
              <p className="px-5 py-4 text-base leading-relaxed text-white/90">{transcript}</p>
            </div>
          </div>
        )}

        {/* ---- Error ---- */}
        {error && (
          <div className="relative w-full max-w-2xl px-9 pb-6 max-md:px-6">
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          </div>
        )}

        {/* ---- Assistant reply ---- */}
        {reply && (
          <div className="relative w-full max-w-2xl px-9 pb-10 max-md:px-6">
            <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-violet-500/15 px-5 py-3">
                <Volume2 className="h-3.5 w-3.5 text-violet-400/70" strokeWidth={2} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-violet-300/60">Assistant</span>
                <div className="flex items-center gap-1 ml-1">
                  <Bot className="h-3.5 w-3.5 text-violet-400" strokeWidth={2} />
                  <span className="font-mono text-[10px] text-violet-400/80">Speaking</span>
                </div>
              </div>
              <p className="px-5 py-4 text-base leading-relaxed text-slate-200">{reply}</p>
              {data?.image_url && (
                <div className="px-5 pb-5">
                  <img
                    src={`${data.image_url}?t=${Date.now()}`}
                    alt="Generated floor plan"
                    className="w-full rounded-xl border border-white/10"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
