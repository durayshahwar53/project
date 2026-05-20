"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck, Send } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={sent ? "Check your inbox." : "Reset your password."}
      subtitle={
        sent
          ? "If an account exists for that email, we've sent a reset link valid for 60 minutes."
          : "Enter your email and we'll send you a secure link to choose a new password."
      }
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/login" className="link">
            Back to sign in
          </Link>
        </span>
      }
    >
      {sent ? (
        <div className="card-flat text-center py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-sage-soft)] text-[color:var(--color-sage)] mb-3">
            <MailCheck size={22} />
          </div>
          <p className="text-[color:var(--color-ink-500)] text-sm">
            Sent to <strong>{email}</strong>. Check spam if you don&apos;t see it.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full !rounded-xl !py-3"
          >
            {loading ? <Loader2 className="spin-slow" size={16} /> : <Send size={16} />}
            {loading ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
