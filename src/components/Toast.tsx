"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Variant = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  variant: Variant;
}

interface ToastCtx {
  push: (message: string, variant?: Variant) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, variant: Variant = "info") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, message, variant }]);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((t) => (
            <ToastItemView
              key={t.id}
              item={t}
              onClose={() => setItems((s) => s.filter((x) => x.id !== t.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

function ToastItemView({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const tm = setTimeout(onClose, 4500);
    return () => clearTimeout(tm);
  }, [onClose]);

  const Icon =
    item.variant === "success"
      ? CheckCircle2
      : item.variant === "error"
        ? AlertCircle
        : Info;

  const accent =
    item.variant === "success"
      ? "var(--color-sage)"
      : item.variant === "error"
        ? "var(--color-rose)"
        : "var(--color-coral)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="pointer-events-auto min-w-[280px] max-w-[420px] rounded-2xl border bg-white shadow-lg flex items-start gap-3 px-4 py-3"
      style={{ borderColor: "var(--color-line)" }}
    >
      <Icon size={20} style={{ color: accent }} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm text-[color:var(--color-ink-700)] leading-relaxed">
        {item.message}
      </div>
      <button
        onClick={onClose}
        className="text-[color:var(--color-ink-300)] hover:text-[color:var(--color-ink)]"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
  return ctx;
}
