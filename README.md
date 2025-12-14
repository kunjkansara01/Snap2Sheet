# **Snap2Sheet**

Upload an invoice image or PDF → download an accountant-ready Excel (.xlsx). Exports **Summary + LineItems** sheets.

## Features
- Supports invoice **images (png/jpg/jpeg)** and **PDF**
- Layout-aware OCR (table extraction)
- EU/US number normalization
- Download `.xlsx`

## Quick Start (Docker) — 2 minutes
```bash
git clone https://github.com/kunjkansara01/Snap2Sheet.git
cd Snap2Sheet
docker compose down --remove-orphans
docker compose up --build
```
Then open http://localhost:3000, click “Try sample invoice” → download .xlsx.

## Services / Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (FastAPI docs at `/docs`)

## Environment Variables
- See `.env.example` in `frontend/` and `backend/`
- `NEXT_PUBLIC_API_BASE`
- `CORS_ORIGINS`
- `DEBUG_OCR`

## Troubleshooting (Windows)
- If `open` command fails, use `start http://localhost:3000`
- If Docker engine isn’t running, start Docker Desktop
- If ports 3000/8000 are busy, stop the process or change compose port mappings

## Submission info
- Problem statement: **Problem 3 – Data Trap**
- Judges can test in 30 seconds: run the Quick Start above, open http://localhost:3000, click “Try sample invoice,” download .xlsx
