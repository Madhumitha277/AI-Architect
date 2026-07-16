import { useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { AuthProvider, useAuth } from "./AuthContext";
import { LoginGate } from "./components/Dashboard";
import Dashboard from "./components/Dashboard";
import PlanGenerator from "./components/PlanGenerator";
import WallDesign from "./components/WallDesign";
import Materials from "./components/Materials";
import Budget from "./components/Budget";
import Chatbot from "./components/Chatbot";
import History from "./components/History";
import ThreeDPreview from "./components/ThreeDPreview";
import FurnitureDesigner from "./components/FurnitureDesigner";
import InteriorThemes from "./components/InteriorThemes";
import VoiceAssistant from "./components/VoiceAssistant";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "plan", label: "Floor plan" },
  { id: "preview3d", label: "3D preview" },
  { id: "furniture", label: "Furniture" },
  { id: "themes", label: "Themes" },
  { id: "wall", label: "Wall design" },
  { id: "materials", label: "Materials" },
  { id: "budget", label: "Budget" },
  { id: "chat", label: "AI chat" },
  { id: "voice", label: "Voice" },
  { id: "history", label: "Saved plans" },
];

function Compass() {
  return (
    <svg className="compass" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#5fb8d1" strokeWidth="1" />
      <circle cx="50" cy="50" r="2.5" fill="#5fb8d1" />
      <path d="M50 6 L56 50 L50 94 L44 50 Z" fill="#5fb8d1" opacity="0.85" />
      <path d="M6 50 L50 44 L94 50 L50 56 Z" fill="#5fb8d1" opacity="0.4" />
      <text x="50" y="20" textAnchor="middle" fill="#eaf4f8" fontSize="9" fontFamily="JetBrains Mono">N</text>
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀ Light"}
    </button>
  );
}

function MainApp() {
  const [tab, setTab] = useState("dashboard");
  const { user } = useAuth();
  const userId = user?.name || "";

  return (
    <div>
      <section className="hero">
        <ThemeToggle />
        <Compass />
        <div className="hero-inner">
          <span className="eyebrow">AI Architect</span>
          <h1>Draft your home,<br /><em>the smart way.</em></h1>
          <p className="lede">
            Floor plans, cost estimates, material quantities, budget planning,
            and Vastu guidance — generated instantly from a few numbers, or
            just by asking.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => setTab("plan")}>
              Generate a plan
            </button>
            <button className="btn btn-ghost" onClick={() => setTab("chat")}>
              Ask the AI assistant
            </button>
          </div>
        </div>
      </section>

      <div className="deck">
        <div className="tabbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="panel">
          {tab === "dashboard" && <Dashboard setTab={setTab} />}
          {tab === "plan" && <PlanGenerator userId={userId} />}
          {tab === "preview3d" && <ThreeDPreview />}
          {tab === "furniture" && <FurnitureDesigner />}
          {tab === "themes" && <InteriorThemes />}
          {tab === "wall" && <WallDesign />}
          {tab === "materials" && <Materials />}
          {tab === "budget" && <Budget />}
          {tab === "chat" && <Chatbot />}
          {tab === "voice" && <VoiceAssistant />}
          {tab === "history" && <History userId={userId} setUserId={() => {}} />}
        </div>
      </div>

      <footer className="site-footer">
        AI ARCHITECT — drafted with care, verified by professionals before construction.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginGate>
          <MainApp />
        </LoginGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
