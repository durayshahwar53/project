"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setDone(true);
      setTimeout(() => router.replace("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={done ? "All set." : "Choose a new password."}
      subtitle={
        done
          ? "Your password has been updated. Redirecting you to sign in..."
          : "Pick something memorable but strong — at least 6 characters."
      }
      footer={
        !done && (
          <span>
            Changed your mind?{" "}
            <Link href="/login" className="link">
              Back to sign in
            </Link>
          </span>
        )
      }
    >
      {done ? (
        <div className="card-flat text-center py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-sage-soft)] text-[color:var(--color-sage)] mb-3">
            <CheckCircle2 size={22} />
          </div>
          <p className="text-[color:var(--color-ink-500)] text-sm">
            Password updated successfully.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="password">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                className="input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-300)] hover:text-[color:var(--color-ink)]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPw ? "text" : "password"}
              required
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[color:var(--color-rose-soft)] bg-[color:var(--color-rose-soft)] text-[color:var(--color-rose)] text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full !rounded-xl !py-3"
          >
            {loading ? <Loader2 className="spin-slow" size={16} /> : <KeyRound size={16} />}
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
