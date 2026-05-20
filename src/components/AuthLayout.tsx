"use client";

import { Brand } from "./Brand";
import { motion } from "framer-motion";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  side,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[color:var(--color-cream)]">
      <div className="flex flex-col p-6 sm:p-10">
        <Brand />
        <div className="flex-1 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="w-full max-w-md mx-auto"
          >
            <h1 className="font-serif text-4xl font-semibold text-[color:var(--color-ink)] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[color:var(--color-ink-400)] leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-8 text-sm text-[color:var(--color-ink-400)]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
        <div className="text-xs text-[color:var(--color-ink-400)]">
          © {new Date().getFullYear()} The University of Faisalabad · Department of
          Computer Science
        </div>
      </div>
      <div className="hidden lg:block relative bg-[color:var(--color-ink)] text-[color:var(--color-cream)] overflow-hidden">
        <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="relative h-full flex items-center justify-center p-12"
        >
          {side || <DefaultSidePanel />}
        </motion.div>
      </div>
    </div>
  );
}

function DefaultSidePanel() {
  const tiles = [
    ["Submissions tracked", "every file"],
    ["Deadlines enforced", "automatic"],
    ["Cloud-secured", "by Cloudinary"],
    ["Reset by email", "in 60 min"],
  ];
  return (
    <div className="max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-serif text-[42px] leading-[1.1] tracking-tight"
      >
        Submit better.{" "}
        <span className="italic text-[color:var(--color-coral-soft)]">
          Teach calmer.
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-6 text-[color:var(--color-cream-200)] leading-relaxed"
      >
        One workspace for assignments, deadlines, submissions, grades, and feedback —
        designed to feel as thoughtful as the work itself.
      </motion.div>
      <div className="mt-10 grid grid-cols-2 gap-4">
        {tiles.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="font-serif text-lg">{k}</div>
            <div className="text-xs text-[color:var(--color-cream-300)] mt-0.5">
              {v}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
