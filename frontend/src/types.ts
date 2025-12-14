export type Summary = {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  currency: string;
  subtotal: string;
  tax: string;
  total: string;
};

export type LineItem = {
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
};

export type ExtractResponse = {
  summary: Summary;
  line_items: LineItem[];
};
