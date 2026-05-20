"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Send,
  ClipboardList,
  Users,
  PlusCircle,
  LogOut,
  Menu,
  X,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Brand } from "./Brand";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatarUrl?: string;
}

const NAV = {
  student: [
    { href: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/student/assignments", label: "Assignments", icon: FileText },
    { href: "/student/submissions", label: "My Submissions", icon: Send },
    { href: "/profile", label: "Profile", icon: UserRound },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/teacher/assignments/new", label: "Create New", icon: PlusCircle },
    { href: "/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/profile", label: "Profile", icon: UserRound },
  ],
};

export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const items = NAV[user.role];
  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "teacher"
        ? "Teacher"
        : "Student";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)]">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-cream)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-cream)]/70">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[color:var(--color-ink)]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
            <Brand subtitle={roleLabel + " workspace"} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-[color:var(--color-ink)]">
                {user.name}
              </span>
              <span className="text-[11px] text-[color:var(--color-ink-400)]">
                {user.email}
              </span>
            </div>
            <Avatar name={user.name} src={user.avatarUrl} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-6 grid md:grid-cols-[240px_1fr] gap-8">
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
          className={cn("md:block", mobileOpen ? "block" : "hidden md:block")}
        >
              <nav className="card !p-3 sticky top-20">
                <div className="px-2 py-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-400)] font-medium">
                  <ShieldCheck size={12} />
                  <span>{roleLabel}</span>
                </div>
                <ul className="space-y-0.5 relative">
                  {items.map((it) => {
                    const active =
                      pathname === it.href ||
                      (it.href !== "/" &&
                        pathname.startsWith(it.href) &&
                        !(it.href === "/teacher/assignments" && pathname === "/teacher/assignments/new"));
                    const Icon = it.icon;
                    return (
                      <li key={it.href} className="relative">
                        {active && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-xl bg-[color:var(--color-ink)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <Link
                          href={it.href}
                          className={cn(
                            "relative z-10 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                            active
                              ? "text-[color:var(--color-cream)]"
                              : "text-[color:var(--color-ink-500)] hover:bg-[color:var(--color-cream-100)] hover:text-[color:var(--color-ink)]"
                          )}
                        >
                          <Icon size={16} />
                          <span>{it.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="divider my-3" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[color:var(--color-ink-500)] hover:bg-[color:var(--color-rose-soft)] hover:text-[color:var(--color-rose)] transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </nav>
        </motion.aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
