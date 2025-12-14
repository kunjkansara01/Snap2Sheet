# Snap2Sheet

Upload an invoice screenshot or PDF → download an accountant-ready Excel file.

- Live frontend: _TBD (Render frontend)_
- Live backend: _TBD (Render backend)_

## What it does
- Accepts JPG/PNG/PDF invoices (multi-page PDFs pick the best page)
- OCR (PaddleOCR → Tesseract fallback), layout-aware table parsing
- Outputs structured JSON and downloadable Excel with Summary + LineItems

## Quick start (Docker)
```bash
docker compose up --build
# frontend: http://localhost:3000
# backend:  http://localhost:8000
```

## Local dev (without Docker)
Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```
Frontend:
```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev
```

## Env vars
Backend (`backend/.env.example`)
- `CORS_ORIGINS` (comma separated, e.g. `http://localhost:3000,http://frontend:3000`)
- `DEBUG_OCR` (default false)

Frontend (`frontend/.env.example`)
- `NEXT_PUBLIC_API_BASE` (e.g. `http://localhost:8000`)

## Deployment (Render, two services – recommended)
- Backend: Deploy Docker using `backend/Dockerfile`; set `CORS_ORIGINS=<frontend_url>`
- Frontend: Deploy Docker using `frontend/Dockerfile`; set `NEXT_PUBLIC_API_BASE=<backend_url>`
- Render template: see `render.yaml`

## CI
GitHub Actions (`.github/workflows/ci.yml`) runs:
- Frontend lint + build
- Backend dependency install + import/compile check

## Smoke test checklist
- `docker compose up --build`
- Open http://localhost:3000
- Upload sample image/PDF → summary + line items populate
- Download Excel works

## Tech stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
- Backend: FastAPI, PaddleOCR/Tesseract fallback, PyMuPDF for PDFs, openpyxl for Excel

## Notes
- No DB; all processing in-memory
- Supports JPG/PNG/PDF up to ~10MB
