# Real Estate

Basic repository for the **Real Estate** project.

## Client (React + TypeScript)

The frontend lives in `client/` and is a Vite + React + TypeScript app.

### Prerequisites

- Node.js (recommended: 20+; Node 21 works in this repo)
- npm (comes with Node)

### Install

From the repo root:

```bash
cd client
npm install
```

### Run (development)

Starts the dev server with hot reload:

```bash
cd client
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

## Backend (FastAPI)

The backend lives in `py/` and is a FastAPI app.

### Setup

```bash
cd py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Run (development)

```bash
cd py
source .venv/bin/activate
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

### Optional: production build

Generates a production build into `client/dist/`:

```bash
cd client
npm run build
```

### Optional: preview the production build

Serves `dist/` locally using Vite:

```bash
cd client
npm run preview
```

## Design note (approach, trade-offs, next steps)

### Approach

- **Thin backend, explicit schema:** The FastAPI backend exposes a small set of endpoints and shapes responses into a stable `PropertyBrief`-style schema so the UI can be built against a clear contract.
- **Buyer-guidance over raw facts:** The “Property Brief” is intentionally opinionated: it turns inputs into “what it means”, risks, verify-items (with “why”), and confidence/explainability instead of dumping fields.
- **Mock-first, swap-later:** Property and brief data are mocked behind services/routers so replacing inputs later (real datasets/providers) won’t require rewriting the UI.
- **Simple state + navigation:** Session + “recently viewed” are kept in `localStorage` to keep the MVP flow coherent without introducing a database.

### Trade-offs (MVP)

- **No real data sources yet:** Listing-level and parcel-level facts are mocked, so accuracy and coverage are not representative.
- **No strong auth/security model:** Login/guest is intentionally lightweight and not suitable for production.
- **No persistence layer:** Without a DB, there’s no multi-device history, saved searches, or audit trail.
- **Limited validation/testing:** The focus is on UX + contract; broader test coverage and hardening are not done.

### With more time

- **Data integrations:** Add a provider layer (with caching, rate-limit handling, and source attribution) and gradually replace mocked facts with permissible datasets.
- **Persistence:** Introduce a DB for users, sessions, saved properties, and “brief snapshots” so a brief can be reproduced later.
- **Trust & transparency:** Store provenance per fact (source, fetched_at, method) and surface conflicts/uncertainty in the UI.
- **Quality & ops:** Add contract tests between backend/frontend, e2e tests for the main flows, structured logging, and basic monitoring.
