from __future__ import annotations

import re
from typing import List, Tuple

from normalize import normalize_number, strip_currency
from ocr_engine import OCRBox
from models import Summary


def invoice_meta_from_text(raw_text: str) -> Tuple[str, str]:
    inv_number = ""
    inv_date = ""
    match = re.search(r"invoice\s*(?:no\.?|number|#)?[:\s]*([A-Za-z0-9-]+)", raw_text, re.IGNORECASE)
    if match:
        inv_number = match.group(1)
    if not inv_number:
        match = re.search(r"invoice\s*[:\s]+([0-9]{4,})", raw_text, re.IGNORECASE)
        if match:
            inv_number = match.group(1)
    date_match = re.search(r"(\d{2}[/-]\d{2}[/-]\d{4})", raw_text)
    if date_match:
        inv_date = date_match.group(1).replace("/", "-")
    return inv_number, inv_date


def vendor_from_boxes(boxes: List[OCRBox]) -> str:
    seller_candidates = [b for b in boxes if "seller" in b.text.lower()]
    if seller_candidates:
        # pick next line below seller label if exists
        y = seller_candidates[0].y2
        below = [b for b in boxes if b.y1 > y]
        below.sort(key=lambda b: b.y1)
        for b in below[:5]:
            text = b.text.strip()
            if len(text.split()) >= 2 and not text.lower().startswith("tax"):
                return text
    # fallback: first non-empty box that is not label
    for b in boxes:
        text = b.text.strip()
        if text and not text.lower().startswith(("seller", "client", "invoice", "date", "tax")):
            return text
    return ""


def summary_from_zone(summary_rows: List[List[OCRBox]], summary_text: str) -> Tuple[str, str, str, str]:
    subtotal = ""
    tax = ""
    total = ""
    currency = ""

    def nums_from_row(row: List[OCRBox]) -> List[str]:
        nonlocal currency
        nums: List[str] = []
        for b in row:
            cur, num = strip_currency(b.text)
            if cur and not currency:
                currency = cur
            if num:
                nums.append(num)
        return nums

    for row in summary_rows:
        text_low = " ".join(b.text for b in row).lower()
        nums = nums_from_row(row)
        if "total" in text_low and nums:
            nums_sorted = sorted([float(n) for n in nums], reverse=True)
            total = str(nums_sorted[0])
            if len(nums_sorted) > 1:
                subtotal = str(nums_sorted[-1])
            if len(nums_sorted) > 2:
                tax = str(nums_sorted[-2])
        if "vat" in text_low and len(nums) >= 3 and not subtotal:
            subtotal = nums[1]
            tax = nums[2] if len(nums) > 2 else tax
            total = nums[3] if len(nums) > 3 else total

    if not total:
        all_nums = re.findall(r"[$€£]?\s?[0-9][\d.,]*", summary_text)
        normalized = [strip_currency(n)[1] for n in all_nums if strip_currency(n)[1]]
        if normalized:
            normalized.sort(key=lambda x: float(x), reverse=True)
            total = normalized[0]
            if len(normalized) > 1:
                subtotal = normalized[-1]
    return currency, subtotal, tax, total
