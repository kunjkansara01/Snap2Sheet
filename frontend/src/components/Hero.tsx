import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileSpreadsheet, Upload } from "lucide-react";

type HeroProps = {
  onUploadClick: () => void;
  onSampleClick: () => void;
};

export function Hero({ onUploadClick, onSampleClick }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs text-secondary"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Built for accountants & freelancers
      </motion.div>
      <motion.h1
        variants={item}
        className="text-balance text-4xl font-semibold leading-tight text-primary md:text-6xl"
      >
        Stop typing numbers from screenshots.
      </motion.h1>
      <motion.p variants={item} className="max-w-2xl text-lg text-secondary md:text-xl">
        Upload an invoice screenshot. Download a clean{" "}
        <span className="relative inline-block">
          <span className="relative z-10 font-semibold text-primary">Excel</span>
          <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-70" />
        </span>{" "}
        in seconds.
      </motion.p>
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ y: prefersReducedMotion ? 0 : -2, boxShadow: "0 18px 50px rgba(79,70,229,0.3)" }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
          onClick={onUploadClick}
          className="button-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-6 py-3 text-sm font-medium text-white shadow-lg"
        >
          <Upload className="h-4 w-4" />
          Upload invoice
        </motion.button>
        <motion.button
          whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
          onClick={onSampleClick}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-6 py-3 text-sm font-medium text-primary"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Try sample invoice
          <ArrowUpRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
