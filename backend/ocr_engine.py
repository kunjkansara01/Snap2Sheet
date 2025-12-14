from __future__ import annotations

import io
import logging
import os
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

from PIL import Image

logger = logging.getLogger("snap2sheet.ocr")


@dataclass
class OCRBox:
    x1: float
    y1: float
    x2: float
    y2: float
    text: str
    conf: float


def _paddle_available() -> bool:
    try:
        import paddleocr  # noqa
    except Exception as exc:
        logger.warning("PaddleOCR unavailable: %s", exc)
        return False
    return True


def _run_paddle(img_array: np.ndarray) -> Tuple[List[OCRBox], str]:
    try:
        from paddleocr import PaddleOCR  # type: ignore
    except Exception as exc:
        logger.warning("PaddleOCR import failed: %s", exc)
        return [], ""
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        result = ocr.ocr(img_array)
        boxes: List[OCRBox] = []
        texts: List[str] = []
        for block in result:
            for item in block:
                bbox = item[0]
                text, conf = item[1]
                x_coords = [pt[0] for pt in bbox]
                y_coords = [pt[1] for pt in bbox]
                boxes.append(
                    OCRBox(
                        x1=float(min(x_coords)),
                        y1=float(min(y_coords)),
                        x2=float(max(x_coords)),
                        y2=float(max(y_coords)),
                        text=text,
                        conf=float(conf),
                    )
                )
                texts.append(text)
        return boxes, "\n".join(texts)
    except Exception as exc:
        logger.warning("PaddleOCR failed: %s", exc)
        return [], ""


def _run_tesseract(img_array: np.ndarray) -> Tuple[List[OCRBox], str]:
    try:
        import pytesseract  # type: ignore
        from pytesseract import Output, pytesseract as tcmd  # type: ignore
    except Exception as exc:
        logger.warning("pytesseract import failed: %s", exc)
        return [], ""
    try:
        default_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe" if os.name == "nt" else "tesseract"
        tcmd.tesseract_cmd = os.getenv("TESSERACT_CMD", default_cmd)
    except Exception:
        pass
    data = pytesseract.image_to_data(img_array, output_type=Output.DICT)
    n_boxes = len(data["text"])
    boxes: List[OCRBox] = []
    texts: List[str] = []
    for i in range(n_boxes):
        text = (data["text"][i] or "").strip()
        if not text:
            continue
        conf = float(data["conf"][i]) if data["conf"][i] not in ("", "-1") else 0.0
        x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
        boxes.append(OCRBox(x1=x, y1=y, x2=x + w, y2=y + h, text=text, conf=conf))
        texts.append(text)
    return boxes, "\n".join(texts)


def ocr_extract(image_bytes: bytes, processed_image: np.ndarray | None = None) -> Tuple[List[OCRBox], str, str]:
    """
    Run OCR returning boxes, raw text, and provider ("paddle" or "tesseract").
    processed_image: preprocessed numpy array (BGR). If None, will decode raw bytes.
    """
    if processed_image is None:
        processed_image = np.asarray(Image.open(io.BytesIO(image_bytes)).convert("RGB"))

    provider = "paddle"
    boxes: List[OCRBox] = []
    raw_text = ""

    if _paddle_available():
        boxes, raw_text = _run_paddle(processed_image)
        if not boxes:
            # try original color if processed failed
            orig = np.asarray(Image.open(io.BytesIO(image_bytes)).convert("RGB"))
            boxes, raw_text = _run_paddle(orig)
    if not boxes:
        boxes, raw_text = _run_tesseract(processed_image)
        provider = "tesseract"
    if not boxes:
        orig = np.asarray(Image.open(io.BytesIO(image_bytes)).convert("RGB"))
        boxes, raw_text = _run_tesseract(orig)
        provider = "tesseract"
    return boxes, raw_text, provider
