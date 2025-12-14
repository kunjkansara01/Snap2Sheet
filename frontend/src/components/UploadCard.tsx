import { motion, useReducedMotion } from "framer-motion";
import { FileSpreadsheet, Upload } from "lucide-react";
import type { ChangeEvent, DragEvent, RefObject } from "react";

type UploadCardProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDropFile: (event: DragEvent<HTMLDivElement>) => void;
  onSample: () => void;
  fileName: string | null;
};

export function UploadCard({ inputRef, onInputChange, onDropFile, onSample, fileName }: UploadCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="surface relative flex flex-col gap-4 rounded-2xl p-6 md:p-7"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropFile}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Upload</p>
          <h2 className="text-2xl font-semibold text-primary">Invoice screenshot</h2>
        </div>
        <div className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-secondary">
          PNG/JPG · Max 5MB
        </div>
      </div>

      <motion.div
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
        className="surface-2 relative flex cursor-pointer flex-col gap-3 rounded-xl border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 transition"
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/15 text-primary">
            <Upload className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="font-semibold text-primary">Drag & drop</p>
            <p className="text-sm text-secondary">or choose from your files</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-1)] px-4 py-2 text-sm font-medium text-primary shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <Upload className="h-4 w-4" />
            Choose file
          </motion.button>
          <motion.button
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onSample();
            }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Try sample invoice
          </motion.button>
        </div>
        <p className="text-xs text-secondary">Files are processed in memory. Nothing is stored.</p>
        {fileName && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-xs text-secondary">
            {fileName}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-all" />
      </motion.div>
    </motion.div>
  );
}
