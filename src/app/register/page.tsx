"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, GraduationCap, Briefcase } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          rollNumber: role === "student" ? rollNumber : undefined,
          department,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account."
      subtitle="A couple of details and you'll be in the portal."
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="link">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <div className="label">I am a</div>
          <div className="grid grid-cols-2 gap-2">
            <RoleTile
              icon={<GraduationCap size={18} />}
              label="Student"
              active={role === "student"}
              onClick={() => setRole("student")}
            />
            <RoleTile
              icon={<Briefcase size={18} />}
              label="Teacher"
              active={role === "teacher"}
              onClick={() => setRole("teacher")}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dury Shahwar"
          />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {role === "student" && (
            <div>
              <label className="label" htmlFor="roll">
                Roll number
              </label>
              <input
                id="roll"
                className="input"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="BSSE-2022-078"
              />
            </div>
          )}
          <div className={role === "teacher" ? "sm:col-span-2" : ""}>
            <label className="label" htmlFor="dept">
              Department
            </label>
            <input
              id="dept"
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Computer Science"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              className="input pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
          {loading ? <Loader2 className="spin-slow" size={16} /> : <UserPlus size={16} />}
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="text-[12px] text-[color:var(--color-ink-300)] text-center">
          By creating an account you agree to keep your credentials private.
        </p>
      </form>
    </AuthLayout>
  );
}

function RoleTile({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 justify-center rounded-xl border px-4 py-3 text-sm transition-all",
        active
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-cream)]"
          : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-500)] hover:border-[color:var(--color-ink)]"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
