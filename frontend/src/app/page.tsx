"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, Repeat } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Hero } from "@/components/Hero";
import { ProcessingStepper } from "@/components/ProcessingStepper";
import { ResultPanel } from "@/components/ResultPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toast } from "@/components/Toast";
import { UploadCard } from "@/components/UploadCard";
import type { ExtractResponse } from "@/types";

type Stage = "landing" | "processing" | "result" | "error";

const processSteps = ["Reading text…", "Detecting totals…", "Extracting line items…", "Building Excel…"];
const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("landing");
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant?: "success" | "error" } | null>(null);

  useEffect(() => {
    if (stage !== "processing") return;
    const interval = window.setInterval(() => setCurrentStep((prev) => (prev + 1) % processSteps.length), 1100);
    return () => clearInterval(interval);
  }, [stage]);

  const validateFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      throw new Error("Please upload a JPG or PNG image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Max file size is 5MB.");
    }
  };

  const processFile = useCallback(
    async (file: File) => {
      try {
        validateFile(file);
        setError(null);
        setStage("processing");
        setFileName(file.name);
        setCopyStatus("");

        const form = new FormData();
        form.append("file", file);

        const response = await fetch(`${apiBase}/api/extract`, {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Extraction failed.");
        }
        const json = (await response.json()) as ExtractResponse;
        setData(json);
        setStage("result");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setStage("error");
        setToast({ message, variant: "error" });
      }
    },
    [setStage],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSample = useCallback(async () => {
    try {
      setStage("processing");
      setError(null);
      setCopyStatus("");
      setFileName("sample-invoice.jpg");

      const res = await fetch("/sample-invoice.jpg");
      const blob = await res.blob();
      const sampleFile = new File([blob], "sample-invoice.jpg", { type: blob.type || "image/jpeg" });

      const form = new FormData();
      form.append("file", sampleFile);

      const response = await fetch(`${apiBase}/api/extract`, { method: "POST", body: form });
      if (!response.ok) throw new Error("Sample extraction failed. Try again.");
      const json = (await response.json()) as ExtractResponse;
      setData(json);
      setStage("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to run the sample right now.";
      setError(message);
      setStage("error");
      setToast({ message, variant: "error" });
    }
  }, []);

  const reset = () => {
    setStage("landing");
    setData(null);
    setError(null);
    setFileName(null);
    setCopyStatus("");
    setToast(null);
  };

  const handleDownload = async () => {
    if (!data) return;
    try {
      setIsDownloading(true);
      const response = await fetch(`${apiBase}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Could not generate Excel.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "snap2sheet.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed.";
      setError(message);
      setStage("error");
      setToast({ message, variant: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    const rows = [
      "description\tquantity\tunit_price\tamount",
      ...data.line_items.map((item) =>
        [item.description, item.quantity, item.unit_price, item.amount].join("\t"),
      ),
    ].join("\n");

    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : null;
    if (clipboard?.writeText) {
      await clipboard.writeText(rows);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = rows;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopyStatus("Copied!");
    setToast({ message: "Copied to clipboard", variant: "success" });
    setTimeout(() => setCopyStatus(""), 2000);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-primary">
      <AnimatedBackground />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 md:py-16">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Snap2Sheet</p>
            <p className="text-sm text-secondary">OCR → structured financial data → Excel</p>
          </div>
          <ThemeToggle />
        </header>

        <Hero onUploadClick={() => inputRef.current?.click()} onSampleClick={handleSample} />

        <section className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <UploadCard
              inputRef={inputRef}
              onInputChange={handleInputChange}
              onDropFile={handleDrop}
              onSample={handleSample}
              fileName={fileName}
            />
          </div>

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {stage === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <ProcessingStepper steps={processSteps} current={currentStep} />
                </motion.div>
              )}

              {stage === "result" && data && (
                <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <ResultPanel
                    data={data}
                    onDownload={handleDownload}
                    onCopy={handleCopy}
                    onReset={reset}
                    copyStatus={copyStatus}
                    isDownloading={isDownloading}
                  />
                </motion.div>
              )}

              {stage === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface rounded-2xl border border-[var(--border)] bg-rose-500/10 p-6 text-primary"
                >
                  <p className="text-lg font-semibold text-primary">We hit a snag</p>
                  <p className="text-sm text-secondary">
                    {error || "Something went wrong. Please try again with a clearer image."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-primary"
                    >
                      <Repeat className="h-4 w-4" />
                      Retry
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSample}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-primary"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Try sample invoice
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {stage === "landing" && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface rounded-2xl border border-[var(--border)] p-6 text-primary"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-muted">Output</p>
                  <h3 className="mt-1 text-2xl font-semibold">Accountant-ready preview</h3>
                  <p className="mt-2 text-sm text-secondary">
                    We will summarize your vendor, totals, and build a clean line-item table.
                  </p>
                  <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-primary">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Why it works</p>
                    <ul className="space-y-2 text-secondary">
                      <li>• PaddleOCR first, Tesseract as the fallback safety net.</li>
                      <li>• Heuristics to never fail: totals, currency, invoice number, dates.</li>
                      <li>• Line items always returned, even when the source is messy.</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <footer className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-6 py-4 text-sm text-secondary">
          <span>Built for accountants & freelancers</span>
          <span>System-aware theme with a manual toggle</span>
        </footer>
      </div>
      <Toast message={toast?.message || ""} variant={toast?.variant} />
    </div>
  );
}
