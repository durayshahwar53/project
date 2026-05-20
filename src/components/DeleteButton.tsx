"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "./Toast";

export function DeleteButton({
  url,
  redirectTo,
  confirmText = "This will be deleted permanently. Continue?",
  label = "Delete",
}: {
  url: string;
  redirectTo?: string;
  confirmText?: string;
  label?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.push("Deleted", "success");
      if (redirectTo) router.replace(redirectTo);
      else router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={run} disabled={busy} className="btn btn-ghost btn-sm">
      {busy ? <Loader2 className="spin-slow" size={14} /> : <Trash2 size={14} />}
      {label}
    </button>
  );
}
