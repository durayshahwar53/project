"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, FileText, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { formatDateTime, timeFromNow } from "@/lib/utils";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject?: string;
  deadline: string;
  totalMarks: number;
  teacher: { name: string; department?: string };
  submitted?: boolean;
  submissionCount?: number;
  attachments?: unknown[];
}

export function AssignmentCard({
  a,
  href,
  viewer,
}: {
  a: Assignment;
  href: string;
  viewer: "student" | "teacher" | "admin";
}) {
  const deadline = new Date(a.deadline);
  const overdue = Date.now() > deadline.getTime();
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link
        href={href}
        className="card group transition-colors hover:border-[color:var(--color-ink)] block"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            {a.subject && (
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-coral-dark)] font-medium mb-1.5">
                {a.subject}
              </div>
            )}
            <h3 className="font-serif text-xl font-semibold text-[color:var(--color-ink)] leading-tight line-clamp-2 group-hover:text-[color:var(--color-coral-dark)] transition-colors">
              {a.title}
            </h3>
          </div>
          {viewer === "student" &&
            (a.submitted ? (
              <span className="pill pill-sage shrink-0">
                <CheckCircle2 size={12} />
                Submitted
              </span>
            ) : overdue ? (
              <span className="pill pill-rose shrink-0">
                <AlertTriangle size={12} />
                Overdue
              </span>
            ) : (
              <span className="pill pill-coral shrink-0">
                <Clock size={12} />
                Pending
              </span>
            ))}
        </div>

        <p className="text-sm text-[color:var(--color-ink-400)] leading-relaxed line-clamp-2">
          {a.description}
        </p>

        <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[color:var(--color-ink-400)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} />
            Due {formatDateTime(deadline)}
            <span className="text-[color:var(--color-ink-300)]">
              · {timeFromNow(deadline)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText size={13} />
            {a.totalMarks} marks
          </span>
          {(viewer === "teacher" || viewer === "admin") && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} />
              {a.submissionCount ?? 0} submission
              {(a.submissionCount ?? 0) === 1 ? "" : "s"}
            </span>
          )}
          {viewer !== "teacher" && (
            <span className="text-[color:var(--color-ink-300)]">
              by {a.teacher?.name}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
