import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, Copy, Repeat } from "lucide-react";
import type { ExtractResponse } from "@/types";

type ResultPanelProps = {
  data: ExtractResponse;
  onDownload: () => void;
  onCopy: () => void;
  onReset: () => void;
  copyStatus: string;
  isDownloading: boolean;
};

export function ResultPanel({
  data,
  onDownload,
  onCopy,
  onReset,
  copyStatus,
  isDownloading,
}: ResultPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  const summaryFields = [
    { label: "Vendor", value: data.summary.vendor_name },
    { label: "Invoice #", value: data.summary.invoice_number },
    { label: "Date", value: data.summary.invoice_date },
    { label: "Currency", value: data.summary.currency },
    { label: "Subtotal", value: data.summary.subtotal },
    { label: "Tax", value: data.summary.tax },
    { label: "Total", value: data.summary.total },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="surface flex flex-col gap-4 rounded-2xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Results</p>
          <h3 className="text-2xl font-semibold text-primary">Accountant-ready Excel</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            onClick={onDownload}
            disabled={isDownloading}
            className="button-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white"
          >
            <ArrowDownToLine className="h-4 w-4" />
            {isDownloading ? "Preparing…" : "Download .xlsx"}
          </motion.button>
          <motion.button
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-primary"
          >
            <Copy className="h-4 w-4" />
            {copyStatus || "Copy TSV"}
          </motion.button>
          <motion.button
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-primary"
          >
            <Repeat className="h-4 w-4" />
            Upload another
          </motion.button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-primary">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Summary</p>
          <div className="grid grid-cols-2 gap-3">
            {summaryFields.map((field) => (
              <div key={field.label} className="space-y-1 rounded-lg bg-[var(--surface-1)] p-3">
                <p className="text-xs text-secondary">{field.label}</p>
                <p className="font-medium text-primary">{field.value?.trim() || "—"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-primary">
          <p className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
            Line items
            <span className="rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-[10px] text-secondary">
              {data.line_items.length} rows
            </span>
          </p>
          <div className="max-h-[360px] overflow-auto rounded-lg border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--surface-2)] text-secondary">
                <tr>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Rate</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.line_items.map((item, idx) => (
                  <tr
                    key={`${item.description}-${idx}`}
                    className="border-t border-[var(--border)] text-primary transition hover:bg-[var(--surface-1)]"
                  >
                    <td className="px-3 py-2">{item.description || "—"}</td>
                    <td className="px-3 py-2">{item.quantity || "—"}</td>
                    <td className="px-3 py-2">{item.unit_price || "—"}</td>
                    <td className="px-3 py-2">{item.amount || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
