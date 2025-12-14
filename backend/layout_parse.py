from __future__ import annotations

import statistics
from typing import List, Tuple

from normalize import normalize_number
from ocr_engine import OCRBox
from models import LineItem, ExtractResponse, Summary
from extract_fields import invoice_meta_from_text, vendor_from_boxes, summary_from_zone

HEADER_WORDS = {"description", "qty", "quantity", "um", "net", "gross", "vat"}


def _y_center(box: OCRBox) -> float:
    return (box.y1 + box.y2) / 2


def _y_height(box: OCRBox) -> float:
    return abs(box.y2 - box.y1)


def _row_text(row: List[OCRBox]) -> str:
    return " ".join(b.text for b in row if b.text).strip()


def zone_bounds(boxes: List[OCRBox]) -> Tuple[float, float]:
    items_anchor = None
    summary_anchor = None
    for b in boxes:
        text_low = b.text.lower()
        if "items" in text_low and items_anchor is None:
            items_anchor = b.y1
        if "summary" in text_low and summary_anchor is None:
            summary_anchor = b.y1
    ys = [b.y1 for b in boxes]
    min_y, max_y = min(ys), max(ys)
    items_start = items_anchor + 5 if items_anchor else (min_y + (max_y - min_y) * 0.35)
    summary_start = summary_anchor if summary_anchor else (min_y + (max_y - min_y) * 0.75)
    return items_start, summary_start


def group_rows(boxes: List[OCRBox], y_threshold: float) -> List[List[OCRBox]]:
    rows: List[List[OCRBox]] = []
    sorted_boxes = sorted(boxes, key=lambda b: _y_center(b))
    for b in sorted_boxes:
        placed = False
        for row in rows:
            if abs(_y_center(row[0]) - _y_center(b)) <= y_threshold:
                row.append(b)
                placed = True
                break
        if not placed:
            rows.append([b])
    for row in rows:
        row.sort(key=lambda bb: bb.x1)
    return rows


def _looks_header(row: List[OCRBox]) -> bool:
    text = _row_text(row).lower()
    return any(w in text for w in HEADER_WORDS)


def parse_items(rows: List[List[OCRBox]]) -> List[LineItem]:
    if not rows:
        return [LineItem(description="Line item")]
    # Determine numeric column centers
    numeric_centers = []
    for row in rows:
        for b in row:
            if any(c.isdigit() for c in b.text):
                numeric_centers.append((b.x1 + b.x2) / 2)
    numeric_centers.sort()

    def is_numeric_col(center: float) -> bool:
        if not numeric_centers:
            return False
        # simple distance to nearest numeric center
        return min(abs(center - c) for c in numeric_centers) <= 35

    items: List[LineItem] = []
    prev_desc = ""
    for row in rows:
        if _looks_header(row):
            continue
        numeric_cells = []
        text_cells = []
        for b in row:
            center = (b.x1 + b.x2) / 2
            if is_numeric_col(center):
                numeric_cells.append(b)
            else:
                text_cells.append(b)
        if not numeric_cells and text_cells and items:
            # continuation row
            prev_desc = (items[-1].description + " " + _row_text(text_cells)).strip()
            items[-1].description = prev_desc
            continue
        description = _row_text(text_cells) or prev_desc or _row_text(row)
        numeric_cells_sorted = sorted(numeric_cells, key=lambda b: b.x1)
        qty = normalize_number(numeric_cells_sorted[0].text) if len(numeric_cells_sorted) >= 1 else ""
        unit_price = normalize_number(numeric_cells_sorted[1].text) if len(numeric_cells_sorted) >= 2 else ""
        amount = normalize_number(numeric_cells_sorted[2].text) if len(numeric_cells_sorted) >= 3 else ""
        items.append(LineItem(description=description, quantity=qty, unit_price=unit_price, amount=amount))
    if not items:
        items.append(LineItem(description=_row_text(rows[0])))
    return items


def parse_invoice(boxes: List[OCRBox], raw_text: str) -> ExtractResponse:
    if not boxes:
        return ExtractResponse(summary=Summary(), line_items=[LineItem(description="Line item")])

    items_start, summary_start = zone_bounds(boxes)
    items_zone = [b for b in boxes if items_start <= b.y1 <= summary_start]
    summary_zone = [b for b in boxes if b.y1 >= summary_start]

    heights = [_y_height(b) for b in items_zone] or [20]
    med_height = statistics.median(heights)
    rows = group_rows(items_zone, y_threshold=med_height * 0.6)
    summary_rows = group_rows(summary_zone, y_threshold=med_height * 0.6)

    items = parse_items(rows)
    currency, subtotal, tax, total = summary_from_zone(summary_rows, "\n".join(b.text for b in summary_zone))
    inv_number, inv_date = invoice_meta_from_text(raw_text)
    vendor = vendor_from_boxes(boxes)

    summary = Summary(
        vendor_name=vendor,
        invoice_number=inv_number,
        invoice_date=inv_date,
        currency=currency,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )
    return ExtractResponse(summary=summary, line_items=items)
