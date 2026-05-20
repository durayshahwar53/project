"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff, Trash2, ShieldCheck } from "lucide-react";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { formatDate } from "@/lib/utils";

interface UserLite {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatarUrl?: string;
  rollNumber?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export function UserRow({ user, isMe }: { user: UserLite; isMe: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [role, setRole] = useState(user.role);

  async function toggleActive() {
    start(async () => {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.push(
          user.isActive ? "User deactivated" : "User reactivated",
          "success"
        );
        router.refresh();
      } else toast.push("Failed", "error");
    });
  }

  async function changeRole(next: UserLite["role"]) {
    setRole(next);
    start(async () => {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) {
        toast.push(`Role updated to ${next}`, "success");
        router.refresh();
      } else {
        setRole(user.role);
        toast.push("Failed to update role", "error");
      }
    });
  }

  async function remove() {
    if (
      !confirm(
        `Permanently delete ${user.name}? All of their assignments and submissions will also be removed. This cannot be undone.`
      )
    )
      return;
    start(async () => {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.push("User deleted", "success");
        router.refresh();
      } else {
        const d = await res.json();
        toast.push(d.error || "Delete failed", "error");
      }
    });
  }

  return (
    <div className="card flex flex-wrap items-center gap-3">
      <Avatar name={user.name} src={user.avatarUrl} size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium text-[color:var(--color-ink)] truncate">
            {user.name}
          </div>
          {!user.isActive && (
            <span className="pill pill-rose">Deactivated</span>
          )}
          {isMe && (
            <span className="pill pill-amber">
              <ShieldCheck size={12} /> You
            </span>
          )}
        </div>
        <div className="text-xs text-[color:var(--color-ink-400)]">
          {user.email}
          {user.rollNumber ? ` · ${user.rollNumber}` : ""}
          {user.department ? ` · ${user.department}` : ""}
        </div>
        <div className="text-[11px] text-[color:var(--color-ink-300)] mt-0.5">
          Joined {formatDate(user.createdAt)}
        </div>
      </div>

      <select
        disabled={pending || isMe}
        value={role}
        onChange={(e) => changeRole(e.target.value as UserLite["role"])}
        className="input !py-1.5 !w-auto !text-xs"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>

      <button
        disabled={pending || isMe}
        onClick={toggleActive}
        className="btn btn-ghost btn-sm"
        title={user.isActive ? "Deactivate" : "Reactivate"}
      >
        {pending ? (
          <Loader2 className="spin-slow" size={14} />
        ) : user.isActive ? (
          <PowerOff size={14} />
        ) : (
          <Power size={14} />
        )}
        {user.isActive ? "Deactivate" : "Reactivate"}
      </button>

      <button
        disabled={pending || isMe}
        onClick={remove}
        className="btn btn-ghost btn-sm text-[color:var(--color-rose)] hover:!bg-[color:var(--color-rose-soft)]"
        title="Delete"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}
