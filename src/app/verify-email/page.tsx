"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, CheckCircle2, RotateCcw, LogOut } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle verification form submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccess("Account verified successfully! Redirecting...");
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  // Handle resend code request
  async function onResend() {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");

      setSuccess("A new verification code has been sent to your email.");
      setCountdown(60); // 60-second delay
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  // Handle sign out
  async function onSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  }

  return (
    <AuthLayout
      title="Verify your email."
      subtitle="We have sent a 6-digit verification OTP to your registered email address."
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-ink-400)]">Didn't receive the email?</span>
            <button
              onClick={onResend}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-1.5 font-medium text-[color:var(--color-coral-dark)] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              <RotateCcw size={13} />
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? "Resending..."
                  : "Resend OTP"}
            </button>
          </div>
          <div className="divider my-1" />
          <button
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-[color:var(--color-ink-400)] hover:text-[color:var(--color-rose)] transition-colors w-full"
          >
            <LogOut size={13} />
            <span>Sign out and use another account</span>
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="otp">
            Verification Code (6-digit OTP)
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            className="input text-center text-2xl tracking-[10px] font-bold font-mono !rounded-xl !py-3"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) setOtp(val);
            }}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[color:var(--color-rose-soft)] bg-[color:var(--color-rose-soft)] text-[color:var(--color-rose)] text-sm px-4 py-2.5">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-sm px-4 py-2.5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn btn-primary w-full !rounded-xl !py-3"
        >
          {loading ? (
            <Loader2 className="spin-slow" size={16} />
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
