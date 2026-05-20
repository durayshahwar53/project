"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "./Toast";

export function GradeForm({
  submissionId,
  totalMarks,
  isLate,
  latePenaltyMarks,
  alreadyGraded,
  initialGrade,
  initialFeedback,
  finalGrade,
}: {
  submissionId: string;
  totalMarks: number;
  isLate: boolean;
  latePenaltyMarks: number;
  alreadyGraded: boolean;
  initialGrade?: number;
  initialFeedback?: string;
  finalGrade?: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [grade, setGrade] = useState<string>(
    initialGrade !== undefined ? String(initialGrade) : ""
  );
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [busy, setBusy] = useState(false);

  const penaltyToApply = isLate ? latePenaltyMarks : 0;
  const parsed = Number(grade);
  const previewFinal = Number.isFinite(parsed)
    ? Math.max(0, parsed - penaltyToApply)
    : null;

  async function save() {
    if (grade === "" || isNaN(Number(grade))) {
      toast.push("Please enter a numeric grade", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: Number(grade), feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade");
      toast.push("Grade saved — this is final", "success");
      router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Failed to grade", "error");
    } finally {
      setBusy(false);
    }
  }

  if (alreadyGraded) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-cream-100)] p-3 text-sm text-[color:var(--color-ink-500)]">
          <Lock size={16} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-[color:var(--color-ink)]">
              Already graded — marks are final
            </div>
            <div className="text-xs mt-0.5">
              The student is now locked out of replacing their submission.
            </div>
          </div>
        </div>
        <div className="card !p-4">
          <div className="text-xs text-[color:var(--color-ink-400)]">Final grade</div>
          <div className="font-serif text-2xl text-[color:var(--color-ink)] font-semibold">
            {finalGrade ?? initialGrade}
            <span className="text-base text-[color:var(--color-ink-400)]">
              {" "}
              / {totalMarks}
            </span>
          </div>
          {penaltyToApply > 0 && initialGrade !== undefined && (
            <div className="text-[11px] text-[color:var(--color-rose)] mt-0.5">
              {initialGrade} − {penaltyToApply} late penalty
            </div>
          )}
        </div>
        {initialFeedback && (
          <div className="card !p-4">
            <div className="text-xs text-[color:var(--color-ink-400)] mb-1">
              Feedback
            </div>
            <div className="text-sm text-[color:var(--color-ink-700)] whitespace-pre-wrap">
              {initialFeedback}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLate && (
        <div
          className="rounded-xl px-3 py-2 flex items-start gap-2 text-xs"
          style={{
            background: "var(--color-rose-soft)",
            color: "var(--color-rose)",
          }}
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Late submission.</span>{" "}
            {latePenaltyMarks > 0
              ? `${latePenaltyMarks} marks will be automatically deducted from the grade you enter below.`
              : "No automatic penalty is configured for this assignment."}
          </div>
        </div>
      )}
      <div>
        <label className="label">Grade (out of {totalMarks})</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input w-28"
            min={0}
            max={totalMarks}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <span className="text-sm text-[color:var(--color-ink-400)]">
            / {totalMarks}
          </span>
        </div>
        {penaltyToApply > 0 && grade !== "" && previewFinal !== null && (
          <div className="text-[11px] text-[color:var(--color-ink-400)] mt-1.5">
            After late penalty:{" "}
            <span className="text-[color:var(--color-ink)] font-medium">
              {previewFinal} / {totalMarks}
            </span>{" "}
            ({parsed} − {penaltyToApply})
          </div>
        )}
      </div>
      <div>
        <label className="label">Feedback</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Constructive feedback for the student..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={2000}
        />
      </div>
      <p className="text-[11px] text-[color:var(--color-ink-400)] leading-relaxed">
        Heads up — marks become final the moment you save. You won&apos;t be able
        to change them afterwards.
      </p>
      <button onClick={save} disabled={busy} className="btn btn-primary btn-sm">
        {busy ? <Loader2 className="spin-slow" size={14} /> : <Award size={14} />}
        {busy ? "Saving..." : "Save grade — final"}
      </button>
    </div>
  );
}
