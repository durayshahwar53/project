"use client";

import Link, { LinkProps } from "next/link";
import { motion } from "framer-motion";
import React from "react";

type Props = LinkProps & {
  className?: string;
  children: React.ReactNode;
};

/**
 * A next/link with subtle framer-motion hover/tap micro-interactions.
 * Renders the link as the child of a motion.span so the motion props don't
 * conflict with Link's ref forwarding.
 */
export function MotionLink({ children, className, ...props }: Props) {
  return (
    <motion.span
      className="inline-flex"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      <Link {...props} className={className}>
        {children}
      </Link>
    </motion.span>
  );
}
