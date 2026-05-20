"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Paperclip,
  PlusCircle,
  X,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { formatBytes } from "@/lib/utils";
import { PageTransition } from "@/components/Motion";

export default function NewAssignmentPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    totalMarks: "100",
    deadline: defaultDeadline(),
    allowLateSubmission: true,
    latePenaltyMarks: "10",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subject", form.subject);
    fd.append("description", form.description);
    fd.append("deadline", new Date(form.deadline).toISOString());
    fd.append("totalMarks", form.totalMarks);
    fd.append("allowLateSubmission", String(form.allowLateSubmission));
    fd.append(
      "latePenaltyMarks",
      form.allowLateSubmission ? form.latePenaltyMarks || "0" : "0"
    );
    files.forEach((f) => fd.append("attachments", f));
    try {
      const res = await fetch("/api/assignments", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.push("Assignment published", "success");
      router.replace(`/teacher/assignments/${data.data.id}`);
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Failed to create", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTransition>
    <div className="space-y-8">
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ink-400)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} /> Back to assignments
      </Link>

      <PageHeader
        eyebrow="New"
        title="Create assignment"
        description="Set a clear title, description, and deadline. Students will see it instantly."
      />

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <div className="card space-y-4">
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                required
                className="input"
                placeholder="e.g. Database normalization — week 4"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="subject">
                Subject / Course
              </label>
              <input
                id="subject"
                className="input"
                placeholder="e.g. CS-302 Database Systems"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Description & instructions
              </label>
              <textarea
                id="description"
                required
                className="input min-h-[180px] resize-y leading-relaxed"
                placeholder="What should students do? Mention deliverables, file formats, evaluation criteria..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)]">
                  Reference attachments
                </h3>
                <p className="text-xs text-[color:var(--color-ink-400)]">
                  Optional. PDFs, slides, datasets — anything the student needs.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fileInput.current?.click()}
              >
                <Paperclip size={14} /> Add file
              </button>
              <input
                ref={fileInput}
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  setFiles((arr) => [...arr, ...Array.from(e.target.files || [])])
                }
              />
            </div>
            {files.length === 0 ? (
              <div
                className="text-center text-sm text-[color:var(--color-ink-400)] py-6 rounded-xl border border-dashed cursor-pointer hover:bg-[color:var(--color-cream-100)]"
                style={{ borderColor: "var(--color-line)" }}
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={20} className="mx-auto mb-1.5" />
                Drop files or click to browse
              </div>
            ) : (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[color:var(--color-line)] px-3 py-2"
                  >
                    <Paperclip
                      size={14}
                      className="text-[color:var(--color-coral-dark)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{f.name}</div>
                      <div className="text-xs text-[color:var(--color-ink-400)]">
                        {formatBytes(f.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[color:var(--color-ink-300)] hover:text-[color:var(--color-rose)]"
                      onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card space-y-4 sticky top-20">
            <div>
              <label className="label" htmlFor="deadline">
                Deadline
              </label>
              <input
                id="deadline"
                required
                type="datetime-local"
                className="input"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="totalMarks">
                Total marks
              </label>
              <input
                id="totalMarks"
                type="number"
                min={0}
                className="input"
                value={form.totalMarks}
                onChange={(e) => update("totalMarks", e.target.value)}
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-[color:var(--color-ink-500)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowLateSubmission}
                onChange={(e) =>
                  update("allowLateSubmission", e.target.checked)
                }
                className="mt-1"
              />
              <span>
                Allow late submissions{" "}
                <span className="block text-xs text-[color:var(--color-ink-400)]">
                  Students can submit after the deadline (flagged as late).
                </span>
              </span>
            </label>

            <div
              className={
                form.allowLateSubmission
                  ? ""
                  : "opacity-50 pointer-events-none select-none"
              }
            >
              <label className="label" htmlFor="latePenalty">
                Late penalty (marks)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="latePenalty"
                  type="number"
                  min={0}
                  max={form.totalMarks || 100}
                  disabled={!form.allowLateSubmission}
                  className="input"
                  value={form.latePenaltyMarks}
                  onChange={(e) => update("latePenaltyMarks", e.target.value)}
                />
                <span className="text-xs text-[color:var(--color-ink-400)] whitespace-nowrap">
                  / {form.totalMarks || 0} marks
                </span>
              </div>
              <p className="text-[11px] text-[color:var(--color-ink-400)] mt-1.5 leading-relaxed">
                Marks automatically deducted from the grade when a late submission is graded.
              </p>
            </div>

            <button type="submit" disabled={busy} className="btn btn-coral w-full">
              {busy ? <Loader2 className="spin-slow" size={16} /> : <PlusCircle size={16} />}
              {busy ? "Publishing..." : "Publish assignment"}
            </button>
          </div>
        </aside>
      </form>
    </div>
    </PageTransition>
  );
}

function defaultDeadline() {
  const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  d.setHours(23, 59, 0, 0);
  return d.toISOString().slice(0, 16);
}
