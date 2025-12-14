import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";

type ProcessingStepperProps = {
  steps: string[];
  current: number;
};

export function ProcessingStepper({ steps, current }: ProcessingStepperProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="surface rounded-2xl p-6">
      <div className="mb-3 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <p className="text-lg font-semibold text-primary">Processing your invoice</p>
      </div>
      <p className="text-sm text-secondary mb-3">Making sense of the image so you don&apos;t have to.</p>
      <div className="grid gap-2">
        <AnimatePresence initial={false}>
          {steps.map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
            >
              <div className="flex items-center gap-2 text-primary">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    idx === current
                      ? "bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.1)]"
                      : idx < current
                        ? "bg-emerald-400"
                        : "bg-[var(--border)]"
                  }`}
                />
                <span className="text-sm">{step}</span>
              </div>
              <span className="text-xs text-secondary">
                {idx === current ? "running" : idx < current ? "done" : "queued"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
