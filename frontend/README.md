# Frontend (React + Vite)

Quick starter for the frontend that talks to the backend at `http://localhost:8000`.

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- The dev server is configured to run on port `3000` so the existing backend CORS rules work (see `app/main.py`).
- API base can be overridden via `VITE_API_BASE` env var.
