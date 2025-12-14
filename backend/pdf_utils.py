from __future__ import annotations

import io
import logging
from typing import List, Tuple

import fitz  # PyMuPDF
import numpy as np
from PIL import Image

from ocr_engine import OCRBox

logger = logging.getLogger("snap2sheet.pdf")


def pdf_to_images(pdf_bytes: bytes, max_pages: int = 3, dpi: int = 220) -> List[bytes]:
    """Render PDF pages to image bytes (PNG) limited to max_pages."""
    images: List[bytes] = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = min(len(doc), max_pages)
    for i in range(page_count):
        page = doc.load_page(i)
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        images.append(pix.tobytes("png"))
    doc.close()
    return images


def score_page(boxes: List[OCRBox], raw_text: str) -> int:
    """Heuristic page score to choose best page."""
    score = 0
    text_low = raw_text.lower()
    if "items" in text_low:
        score += 5
    if all(k in text_low for k in ["description", "qty"]):
        score += 5
    if "invoice" in text_low and ("date" in text_low or "date of issue" in text_low):
        score += 4
    numeric_cells = sum(1 for b in boxes if any(c.isdigit() for c in b.text))
    score += min(numeric_cells // 5, 6)
    return score
