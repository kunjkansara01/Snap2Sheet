from __future__ import annotations

import io
import numpy as np
from PIL import Image, ImageFilter, ImageOps


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Pillow-based preprocessing to avoid OpenCV/ABI issues.
    Returns a numpy array (RGB) suitable for OCR engines.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    img = ImageOps.autocontrast(img)
    img = img.filter(ImageFilter.MedianFilter(size=3))
    # Simple threshold
    arr = np.asarray(img, dtype=np.uint8)
    thresh = arr.mean()
    binary = (arr > thresh).astype(np.uint8) * 255
    # Return 3-channel RGB
    return np.stack([binary, binary, binary], axis=-1)
