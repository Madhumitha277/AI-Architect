# 🏛️ AI Architect

**AI Architect** turns a few basic inputs — plot area, number of bedrooms/bathrooms, and style — into a complete home-design package: a professional 2D floor plan, room-wise cost estimate, material quantities, wall design suggestions, Vastu guidance, and a downloadable PDF report. A rule-based chat assistant and per-user plan history are built in.

![Python](https://img.shields.io/badge/backend-FastAPI-009688)
![React](https://img.shields.io/badge/frontend-React%2019-61DAFB)
<<<<<<< HEAD
=======

>>>>>>> a572c1400890ccaac22d70593e031bf37df2eb9e


## ✨ Features

| Module | What it does |
|---|---|
| **Floor Plan Generator** | Generates a unique, connected 2D architectural blueprint (walls, doors with swing arcs, windows, furniture symbols, dimensions, north arrow, scale bar) for every input — never a static template. |
| **Room Planner** | Dynamically allocates living room / kitchen / bedroom / bathroom areas from the total square footage. |
| **Cost Estimator** | Approximate construction cost breakdown based on plot area and finish level. |
| **Material Estimator** | Cement, steel, bricks, paint, etc. quantities for the given area. |
| **Budget Optimizer** | Suggests what specs/area fit a given budget. |
| **Wall Design Advisor** | Room-specific wall design & color recommendations. |
| **Vastu Guidance** | Optional Vastu-compliant room placement and entrance orientation. |
| **AI Chat Assistant** | Rule-based conversational helper for quick questions about the plan. |
| **PDF Report** | One-click downloadable report combining plan, costs, and materials. |
| **Plan History** | Every generated plan can be saved and revisited per user (SQLite). |

---

## 🧱 Tech Stack

**Backend:** FastAPI, Pydantic, Pillow (floor plan rendering), ReportLab (PDF reports), SQLite
**Frontend:** React 19, Vite, Tailwind CSS, Axios, lucide-react

---

## 📁 Project Structure

```
AI Architect/
├── backend/
│   ├── main.py              # FastAPI app & API routes
│   ├── planner.py           # Room area allocation
│   ├── floorplan.py         # 2D floor plan generation (Pillow)
│   ├── layouts.py           # Layout style presets
│   ├── cost.py               # Cost estimation
│   ├── material.py           # Material quantity estimation
│   ├── budget_optimizer.py   # Budget-fit suggestions
│   ├── wall_design.py        # Wall design recommendations
│   ├── chatbot.py            # Rule-based chat assistant
│   ├── report.py             # PDF report generation
│   ├── history.py            # SQLite-backed plan history
│   ├── utils.py               # Shared helpers
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── AuthContext.jsx
    │   ├── ThemeContext.jsx
    │   └── api.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### 1. Backend

```bash
cd "AI Architect/backend"
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at **http://127.0.0.1:8000**.
Interactive API docs (Swagger UI): **http://127.0.0.1:8000/docs**

Plan history is stored in `backend/ai_architect.db` (SQLite, created automatically on first run).

### 2. Frontend

In a **second terminal**, with the backend still running:

```bash
cd "AI Architect/frontend"
npm install
npm run dev
```

The frontend runs at **http://localhost:5173** (Vite prints the exact URL).

By default it calls the backend at `http://127.0.0.1:8000`. To point it elsewhere (e.g. a deployed backend), copy `.env.example` to `.env`:

```
VITE_API_URL=https://your-backend-url
```

### 3. First-time checklist

1. Backend running, `/docs` loads in the browser → backend OK
2. Frontend running, login screen appears at `localhost:5173` → enter any name
3. **Floor plan** tab → fill in area / BHK / bathrooms → Generate → image + tables appear
4. **AI chat** tab → try a suggestion chip → get a reply
5. **Dashboard** tab → shows your saved plan count

If step 3 fails with a network error, check the backend is running and `VITE_API_URL` is correct.

---

## 📡 API Reference

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/generate` | Floor plan + rooms + cost + materials + Vastu (JSON) |
| `POST` | `/generate-report` | Same, returned as a downloadable PDF |
| `POST` | `/material-estimate` | Material quantities for a given area |
| `POST` | `/budget-optimizer` | What fits a given budget |
| `POST` | `/wall-design` | Wall design suggestions by room type |
| `POST` | `/chat` | Rule-based chatbot (natural language) |
| `POST` | `/save-plan` | Manually save a plan to history |
| `GET` | `/history/{user_id}` | List a user's saved plans |
| `GET` | `/history/{user_id}/{plan_id}` | One saved plan's full detail |
| `DELETE` | `/history/{user_id}/{plan_id}` | Delete a saved plan |

Full request/response schemas are available in the Swagger UI at `/docs` once the backend is running.

---

## ⚠️ Known Limitations

- **Login** is local-only (browser storage) — it organizes plans per name but is not real authentication (no passwords/sessions). A proper auth backend (JWT + users table) would be needed for real accounts.
- **3D preview** is a CSS-based illustrative block view, not a true 3D engine (kept lightweight, no Three.js dependency).
- **Voice assistant** relies on the browser's Web Speech API — well supported in Chrome/Edge, not in Firefox or Safari.
- **Chatbot** is rule-based rather than an LLM integration.

---

<<<<<<< HEAD

=======
>>>>>>> a572c1400890ccaac22d70593e031bf37df2eb9e
