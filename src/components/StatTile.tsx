"use client";

import { motion } from "framer-motion";
import { CountUp } from "./Motion";

type Accent = "sage" | "coral" | "amber" | "rose" | "ink";

const BG: Record<Accent, string> = {
  sage: "var(--color-sage-soft)",
  coral: "var(--color-coral-soft)",
  amber: "var(--color-amber-soft)",
  rose: "var(--color-rose-soft)",
  ink: "var(--color-cream-200)",
};
const FG: Record<Accent, string> = {
  sage: "var(--color-sage)",
  coral: "var(--color-coral-dark)",
  amber: "var(--color-amber)",
  rose: "var(--color-rose)",
  ink: "var(--color-ink-500)",
};

export function StatTile({
  label,
  value,
  icon,
  accent = "ink",
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: Accent;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
      whileHover={{ y: -2 }}
      className="card !p-5"
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: BG[accent], color: FG[accent] }}
        >
          {icon}
        </span>
        <CountUp
          value={value}
          className="font-serif text-3xl font-semibold text-[color:var(--color-ink)]"
        />
      </div>
      <div className="mt-3 text-sm text-[color:var(--color-ink-400)]">{label}</div>
    </motion.div>
  );
}
