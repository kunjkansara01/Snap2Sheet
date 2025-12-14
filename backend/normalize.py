import re
from typing import Tuple

CURRENCY_MAP = {
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "₹": "INR",
    "AED": "AED",
    "USD": "USD",
    "EUR": "EUR",
    "GBP": "GBP",
    "INR": "INR",
}


def normalize_number(text: str) -> str:
    """Normalize EU/US number strings into dotted decimal representation."""
    cleaned = (text or "").replace("\u00a0", "").replace(" ", "")
    if not cleaned:
        return ""
    if "," in cleaned and "." in cleaned and cleaned.rfind(",") > cleaned.rfind("."):
        cleaned = cleaned.replace(".", "")
    if cleaned.count(",") == 1 and cleaned.count(".") == 0:
        cleaned = cleaned.replace(",", ".")
    parts = cleaned.split(".")
    if len(parts) > 2:
        cleaned = "".join(parts[:-1]) + "." + parts[-1]
    cleaned = re.sub(r"[^0-9\.-]", "", cleaned)
    if cleaned.count(".") > 1:
        first, *rest = cleaned.split(".")
        cleaned = first + "." + "".join(rest)
    return cleaned


def strip_currency(text: str) -> Tuple[str, str]:
    if not text:
        return "", ""
    currency = ""
    for sym in ["$", "€", "£", "₹"]:
        if sym in text:
            currency = CURRENCY_MAP.get(sym, "")
            break
    for code in ["USD", "EUR", "GBP", "INR", "AED"]:
        if code in text.upper():
            currency = CURRENCY_MAP.get(code, code)
            break
    number = normalize_number(text)
    return currency, number
