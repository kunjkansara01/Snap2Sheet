from pathlib import Path
import json

from models import ExtractResponse
from preprocess import preprocess_image
from ocr_engine import ocr_extract
from layout_parse import parse_invoice
from pdf_utils import pdf_to_images


def run_sample_image(path: Path):
    content = path.read_bytes()
    processed = preprocess_image(content)
    boxes, raw_text, provider = ocr_extract(content, processed_image=processed)
    print(f"OCR provider: {provider}, boxes: {len(boxes)}")
    structured: ExtractResponse = parse_invoice(boxes, raw_text)
    print(json.dumps(structured.model_dump(), indent=2))
    assert structured.summary.invoice_date or structured.summary.invoice_number
    assert structured.summary.total
    assert len(structured.line_items) >= 1


def run_sample_pdf(path: Path):
    pages = pdf_to_images(path.read_bytes(), max_pages=1)
    if not pages:
        raise SystemExit("No pages rendered from PDF.")
    content = pages[0]
    processed = preprocess_image(content)
    boxes, raw_text, provider = ocr_extract(content, processed_image=processed)
    print(f"OCR provider: {provider}, boxes: {len(boxes)}")
    structured: ExtractResponse = parse_invoice(boxes, raw_text)
    print(json.dumps(structured.model_dump(), indent=2))
    assert structured.summary.total
    assert len(structured.line_items) >= 1


if __name__ == "__main__":
    sample_img = Path("..") / "frontend" / "public" / "sample-invoice.jpg"
    if sample_img.exists():
        run_sample_image(sample_img)
    sample_pdf = Path("..") / "frontend" / "public" / "sample-invoice.pdf"
    if sample_pdf.exists():
        run_sample_pdf(sample_pdf)
