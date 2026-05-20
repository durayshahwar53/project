import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  MessageSquare,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDateTime, timeFromNow } from "@/lib/utils";
import { SubmissionForm } from "@/components/SubmissionForm";
import { buildDownloadUrl } from "@/lib/cloudinary";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  await connectDB();
  const a = await Assignment.findById(id)
    .populate("teacher", "name email department")
    .lean();
  if (!a) notFound();
  const mySub = await Submission.findOne({
    assignment: id,
    student: user._id,
  }).lean();

  const deadline = new Date(a.deadline);
  const overdue = Date.now() > deadline.getTime();
  const teacher = a.teacher as unknown as {
    name: string;
    email: string;
    department?: string;
  };

  return (
    <PageTransition>
    <div className="space-y-8">
      <Link
        href="/student/assignments"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ink-400)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} /> All assignments
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {a.subject && (
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-coral-dark)] font-medium mb-1.5">
                {a.subject}
              </div>
            )}
            <h1 className="font-serif text-3xl font-semibold text-[color:var(--color-ink)] tracking-tight">
              {a.title}
            </h1>
            <div className="mt-2 text-sm text-[color:var(--color-ink-400)]">
              Set by {teacher?.name}
              {teacher?.department ? ` · ${teacher.department}` : ""}
            </div>
          </div>
          {mySub ? (
            <span className="pill pill-sage">
              <CheckCircle2 size={12} /> Submitted
            </span>
          ) : overdue ? (
            <span className="pill pill-rose">
              <AlertTriangle size={12} /> Overdue
            </span>
          ) : (
            <span className="pill pill-coral">
              <Clock size={12} /> Open
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Meta
            label="Deadline"
            value={formatDateTime(deadline)}
            sub={timeFromNow(deadline)}
          />
          <Meta label="Total marks" value={`${a.totalMarks}`} />
          <Meta
            label="Late policy"
            value={
              a.allowLateSubmission
                ? a.latePenaltyMarks > 0
                  ? `Late allowed · −${a.latePenaltyMarks} marks penalty`
                  : "Late submissions allowed"
                : "Strict deadline — no late submissions"
            }
          />
        </div>

        <p className="text-[15px] text-[color:var(--color-ink-700)] leading-relaxed whitespace-pre-wrap">
          {a.description}
        </p>

        {a.attachments && a.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[color:var(--color-line)]">
            <div className="text-sm font-medium text-[color:var(--color-ink)] mb-3">
              Reference files
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {a.attachments.map((att) => (
                <a
                  key={att.publicId}
                  href={buildDownloadUrl(att.publicId, att.format, att.resourceType)}
                  className="flex items-center gap-3 rounded-xl border border-[color:var(--color-line)] px-3 py-2.5 hover:bg-[color:var(--color-cream-100)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={18} className="text-[color:var(--color-coral-dark)]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {att.originalName}
                    </div>
                    <div className="text-xs text-[color:var(--color-ink-400)]">
                      {formatBytes(att.bytes)} · {att.format?.toUpperCase()}
                    </div>
                  </div>
                  <Download size={14} className="text-[color:var(--color-ink-400)]" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* My submission */}
      <div className="card">
        <h2 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
          {mySub ? "Your submission" : "Submit your work"}
        </h2>

        {mySub && (
          <div className="mt-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-cream-100)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <FileText
                  size={20}
                  className="text-[color:var(--color-coral-dark)] shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-[color:var(--color-ink)] truncate">
                    {mySub.file.originalName}
                  </div>
                  <div className="text-xs text-[color:var(--color-ink-400)]">
                    Submitted {formatDateTime(mySub.submittedAt)} ·{" "}
                    {formatBytes(mySub.file.bytes)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mySub.isLate && (
                  <span className="pill pill-rose">
                    <AlertTriangle size={12} /> Late
                  </span>
                )}
                <a
                  className="btn btn-ghost btn-sm"
                  href={buildDownloadUrl(
                    mySub.file.publicId,
                    mySub.file.format,
                    mySub.file.resourceType
                  )}
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>

            {mySub.status === "graded" && (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <div className="card !p-4 flex items-center gap-3">
                  <Award className="text-[color:var(--color-amber)]" />
                  <div>
                    <div className="text-xs text-[color:var(--color-ink-400)]">
                      Final grade
                    </div>
                    <div className="font-serif text-2xl text-[color:var(--color-ink)] font-semibold">
                      {mySub.grade}
                      <span className="text-base text-[color:var(--color-ink-400)]">
                        {" "}
                        / {a.totalMarks}
                      </span>
                    </div>
                    {(mySub.latePenaltyApplied || 0) > 0 && (
                      <div className="text-[11px] text-[color:var(--color-rose)] mt-0.5">
                        {mySub.gradeRaw} − {mySub.latePenaltyApplied} late penalty
                      </div>
                    )}
                  </div>
                </div>
                {mySub.feedback && (
                  <div className="sm:col-span-2 card !p-4">
                    <div className="text-xs text-[color:var(--color-ink-400)] flex items-center gap-1.5 mb-1">
                      <MessageSquare size={12} /> Teacher feedback
                    </div>
                    <div className="text-sm text-[color:var(--color-ink-700)] whitespace-pre-wrap leading-relaxed">
                      {mySub.feedback}
                    </div>
                  </div>
                )}
              </div>
            )}
            {mySub.note && (
              <div className="mt-4 text-sm text-[color:var(--color-ink-500)]">
                <span className="text-[color:var(--color-ink-400)]">Your note: </span>
                {mySub.note}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="text-sm font-medium text-[color:var(--color-ink)] mb-3">
            {mySub?.status === "graded"
              ? "Locked"
              : mySub
                ? "Replace submission"
                : "Upload your file"}
          </div>
          <SubmissionForm
            assignmentId={String(a._id)}
            existingFileName={mySub?.file.originalName}
            locked={
              mySub?.status === "graded"
                ? "graded"
                : overdue && !a.allowLateSubmission && !mySub
                  ? "deadline"
                  : false
            }
            lateWarning={
              overdue && a.allowLateSubmission && mySub?.status !== "graded"
                ? a.latePenaltyMarks > 0
                  ? `This submission will be marked as late. ${a.latePenaltyMarks} marks will be automatically deducted from your grade.`
                  : "This submission will be marked as late."
                : undefined
            }
          />
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-cream-100)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-ink-400)] mb-1">
        {label}
      </div>
      <div className="text-sm font-medium text-[color:var(--color-ink)]">{value}</div>
      {sub && (
        <div className="text-xs text-[color:var(--color-ink-400)] mt-0.5">{sub}</div>
      )}
    </div>
  );
}
