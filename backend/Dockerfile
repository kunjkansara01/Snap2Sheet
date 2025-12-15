FROM python:3.11-slim

WORKDIR /app

# System deps for pymupdf/paddle/opencv runtime + tesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
  && rm -rf /var/lib/apt/lists/*

# Sanity check tesseract is present
RUN tesseract --version

# More resilient pip settings for large wheels (opencv/paddle)
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=180 \
    PIP_NO_CACHE_DIR=1

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=180 --retries 5 -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]