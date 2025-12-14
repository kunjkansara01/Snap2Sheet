import { AnimatePresence, motion } from "framer-motion";

type ToastProps = {
  message: string;
  variant?: "success" | "error";
};

export function Toast({ message, variant = "success" }: ToastProps) {
  const color =
    variant === "success"
      ? "bg-emerald-500/90 text-white"
      : "bg-rose-500/90 text-white";

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform px-4"
        >
          <div className={`rounded-full px-4 py-2 text-sm shadow-lg ${color}`}>{message}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
