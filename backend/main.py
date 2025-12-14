from __future__ import annotations

import io
import logging
import os
from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from starlette.responses import JSONResponse

from models import ExtractResponse, ExportPayload, LineItem
from preprocess import preprocess_image
from ocr_engine import ocr_extract
from layout_parse import parse_invoice
from pdf_utils import pdf_to_images, score_page

logger = logging.getLogger("snap2sheet")
logging.basicConfig(level=logging.INFO)


def _build_cors_origins() -> List[str]:
    configured = os.getenv("CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS")
    if configured:
        origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    else:
        origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    return origins


app = FastAPI(title="Snap2Sheet API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@app.get("/api/health")
async def api_health() -> JSONResponse:
    return JSONResponse({"ok": True})


@app.post("/api/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)) -> ExtractResponse:
    content = await file.read()
    filename = file.filename or ""
    is_pdf = file.content_type == "application/pdf" or filename.lower().endswith(".pdf")
    if not is_pdf and file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, or PDF are supported.")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    debug_mode = os.getenv("DEBUG_OCR", "").lower() == "true"

    if is_pdf:
        pages = pdf_to_images(content, max_pages=3)
        if not pages:
            raise HTTPException(status_code=400, detail="Could not render PDF.")
        page_results = []
        for idx, page_bytes in enumerate(pages):
            processed = preprocess_image(page_bytes)
            boxes, raw_text, provider = ocr_extract(page_bytes, processed_image=processed)
            sc = score_page(boxes, raw_text)
            logger.info("PDF page %s provider=%s boxes=%s score=%s", idx, provider, len(boxes), sc)
            page_results.append((sc, boxes, raw_text))
        page_results.sort(key=lambda t: t[0], reverse=True)
        best_score, best_boxes, best_text = page_results[0]
        structured = parse_invoice(best_boxes, best_text)
        raw_text = best_text
    else:
        processed = preprocess_image(content)
        boxes, raw_text, provider = ocr_extract(content, processed_image=processed)
        logger.info("Image provider=%s boxes=%s", provider, len(boxes))
        structured = parse_invoice(boxes, raw_text)

    if debug_mode:
        structured_dict = structured.model_dump()
        structured_dict["debug_raw_text"] = raw_text
        return structured.__class__(**structured_dict)
    return structured


def _write_excel(payload: ExportPayload) -> io.BytesIO:
    wb = Workbook()
    ws_summary = wb.active
    ws_summary.title = "Summary"
    ws_summary["A1"] = "Field"
    ws_summary["B1"] = "Value"
    ws_summary.append(["Vendor", payload.summary.vendor_name])
    ws_summary.append(["Invoice #", payload.summary.invoice_number])
    ws_summary.append(["Date", payload.summary.invoice_date])
    ws_summary.append(["Currency", payload.summary.currency])
    ws_summary.append(["Subtotal", payload.summary.subtotal])
    ws_summary.append(["Tax", payload.summary.tax])
    ws_summary.append(["Total", payload.summary.total])

    ws_items = wb.create_sheet("LineItems")
    ws_items.append(["description", "quantity", "unit_price", "amount"])
    for item in payload.line_items or [LineItem(description="")]:
        ws_items.append([item.description, item.quantity, item.unit_price, item.amount])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


@app.post("/api/export")
async def export_excel(payload: ExportPayload):
    buffer = _write_excel(payload)
    headers = {"Content-Disposition": 'attachment; filename="snap2sheet.xlsx"'}
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/")
async def root():
    return {"message": "Snap2Sheet API ready", "docs": "/docs"}
