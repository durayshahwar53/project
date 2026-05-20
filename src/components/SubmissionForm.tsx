"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, FileText, X, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "./Toast";
import { formatBytes } from "@/lib/utils";

type LockReason = false | "graded" | "deadline";

export function SubmissionForm({
  assignmentId,
  existingFileName,
  locked = false,
  lateWarning,
}: {
  assignmentId: string;
  existingFileName?: string;
  locked?: LockReason;
  lateWarning?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.push("Please attach a file first", "error");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("assignmentId", assignmentId);
    fd.append("file", file);
    if (note) fd.append("note", note);
    try {
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      toast.push(
        data.data?.isLate
          ? "Submitted (marked as late)"
          : "Submission received successfully",
        "success"
      );
      setFile(null);
      router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Submission failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (locked === "graded") {
    return (
      <div className="card-flat flex items-start gap-3">
        <Lock size={18} className="text-[color:var(--color-ink-400)] shrink-0 mt-0.5" />
        <div className="text-sm text-[color:var(--color-ink-500)] leading-relaxed">
          This submission has been graded by your teacher.{" "}
          <span className="text-[color:var(--color-ink)] font-medium">
            Marks are final.
          </span>{" "}
          You can no longer change the file you submitted.
        </div>
      </div>
    );
  }

  if (locked === "deadline") {
    return (
      <div className="card-flat flex items-start gap-3">
        <Lock size={18} className="text-[color:var(--color-rose)] shrink-0 mt-0.5" />
        <div className="text-sm text-[color:var(--color-ink-500)] leading-relaxed">
          The deadline has passed and the teacher has disabled late submissions.
          You can no longer submit this assignment.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {lateWarning && (
        <div
          className="rounded-2xl border px-4 py-3 flex items-start gap-3"
          style={{
            background: "var(--color-amber-soft)",
            borderColor: "var(--color-amber-soft)",
            color: "var(--color-amber)",
          }}
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">{lateWarning}</div>
        </div>
      )}

      <label
        className="block border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-colors hover:bg-[color:var(--color-cream-100)]"
        style={{ borderColor: "var(--color-line)" }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <FileText size={20} className="text-[color:var(--color-coral-dark)]" />
            <div className="text-left">
              <div className="font-medium text-[color:var(--color-ink)]">
                {file.name}
              </div>
              <div className="text-xs text-[color:var(--color-ink-400)]">
                {formatBytes(file.size)}
              </div>
            </div>
            <button
              type="button"
              className="ml-2 text-[color:var(--color-ink-300)] hover:text-[color:var(--color-rose)]"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              size={28}
              className="mx-auto text-[color:var(--color-ink-400)] mb-2"
            />
            <div className="text-sm font-medium text-[color:var(--color-ink)]">
              Click to choose a file
            </div>
            <div className="text-xs text-[color:var(--color-ink-400)] mt-1">
              PDF, DOCX, ZIP, images — up to 25 MB
            </div>
          </>
        )}
      </label>

      {existingFileName && !file && (
        <div className="text-xs text-[color:var(--color-ink-400)]">
          Replacing previous submission:{" "}
          <span className="text-[color:var(--color-ink)]">{existingFileName}</span>
        </div>
      )}

      <div>
        <label className="label">Optional note to teacher</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Anything you want to add about this submission..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1500}
        />
      </div>

      <button type="submit" disabled={busy || !file} className="btn btn-primary">
        {busy ? <Loader2 className="spin-slow" size={16} /> : <UploadCloud size={16} />}
        {busy ? "Uploading..." : existingFileName ? "Resubmit" : "Submit"}
      </button>
    </form>
  );
}
