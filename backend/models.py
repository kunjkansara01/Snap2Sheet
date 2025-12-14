from typing import List
from pydantic import BaseModel


class Summary(BaseModel):
    vendor_name: str = ""
    invoice_number: str = ""
    invoice_date: str = ""
    currency: str = ""
    subtotal: str = ""
    tax: str = ""
    total: str = ""


class LineItem(BaseModel):
    description: str = ""
    quantity: str = ""
    unit_price: str = ""
    amount: str = ""


class ExtractResponse(BaseModel):
    summary: Summary
    line_items: List[LineItem]


class ExportPayload(BaseModel):
    summary: Summary
    line_items: List[LineItem]
