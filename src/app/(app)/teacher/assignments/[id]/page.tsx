import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Inbox,
  Award,
  AlertTriangle,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDateTime, timeFromNow } from "@/lib/utils";
import { Avatar } from "@/components/Avatar";
import { GradeForm } from "@/components/GradeForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { buildDownloadUrl } from "@/lib/cloudinary";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = (await getCurrentUser())!;
  await connectDB();
  const a = await Assignment.findById(id).lean();
  if (!a) notFound();
  if (
    me.role !== "admin" &&
    String(a.teacher) !== String(me._id)
  )
    notFound();

  const subs = await Submission.find({ assignment: id })
    .populate("student", "name email rollNumber department avatarUrl")
    .sort({ submittedAt: -1 })
    .lean();

  const deadline = new Date(a.deadline);
  const overdue = Date.now() > deadline.getTime();
  const lateCount = subs.filter((s) => s.isLate).length;
  const gradedCount = subs.filter((s) => s.status === "graded").length;

  return (
    <PageTransition>
    <div className="space-y-8">
      <Link
        href="/teacher/assignments"
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
            <div className="mt-1 text-sm text-[color:var(--color-ink-400)] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} /> Due {formatDateTime(deadline)} ·{" "}
                {timeFromNow(deadline)}
              </span>
              <span>·</span>
              <span>{a.totalMarks} marks</span>
              <span>·</span>
              <span>
                {a.allowLateSubmission
                  ? a.latePenaltyMarks > 0
                    ? `Late allowed · −${a.latePenaltyMarks} marks penalty`
                    : "Late submissions allowed"
                  : "Strict deadline"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overdue ? (
              <span className="pill pill-rose">
                <AlertTriangle size={12} /> Past deadline
              </span>
            ) : (
              <span className="pill pill-coral">
                <Clock size={12} /> Open
              </span>
            )}
            <DeleteButton
              url={`/api/assignments/${String(a._id)}`}
              redirectTo="/teacher/assignments"
              confirmText="Delete this assignment? All submissions will also be removed."
            />
          </div>
        </div>
        <p className="text-[15px] text-[color:var(--color-ink-700)] leading-relaxed whitespace-pre-wrap">
          {a.description}
        </p>
        {a.attachments && a.attachments.length > 0 && (
          <div className="mt-5 pt-5 border-t border-[color:var(--color-line)]">
            <div className="text-sm font-medium text-[color:var(--color-ink)] mb-2">
              Reference files
            </div>
            <div className="flex flex-wrap gap-2">
              {a.attachments.map((att) => (
                <a
                  key={att.publicId}
                  href={buildDownloadUrl(att.publicId, att.format, att.resourceType)}
                  className="inline-flex items-center gap-2 text-sm border border-[color:var(--color-line)] rounded-xl px-3 py-1.5 hover:bg-[color:var(--color-cream-100)]"
                >
                  <FileText size={14} />
                  {att.originalName}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Submissions" value={subs.length} icon={<Inbox />} />
        <Stat label="Late" value={lateCount} icon={<AlertTriangle />} accent="rose" />
        <Stat label="Graded" value={gradedCount} icon={<Award />} accent="amber" />
      </div>

      <div>
        <h2 className="font-serif text-2xl font-semibold text-[color:var(--color-ink)] mb-4">
          Submissions
        </h2>

        {subs.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="Students will appear here as soon as they submit their work."
          />
        ) : (
          <div className="space-y-3">
            {subs.map((s) => {
              const st = s.student as unknown as {
                name: string;
                email: string;
                rollNumber?: string;
                department?: string;
                avatarUrl?: string;
              };
              return (
                <details
                  key={String(s._id)}
                  className="card group transition-all open:border-[color:var(--color-ink)]"
                >
                  <summary className="cursor-pointer list-none flex flex-wrap items-center gap-3">
                    <Avatar name={st.name} src={st.avatarUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[color:var(--color-ink)] truncate">
                        {st.name}{" "}
                        {st.rollNumber && (
                          <span className="text-[color:var(--color-ink-400)] text-sm font-normal">
                            · {st.rollNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[color:var(--color-ink-400)]">
                        {st.email} · Submitted {formatDateTime(s.submittedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.isLate && (
                        <span className="pill pill-rose">
                          <AlertTriangle size={12} /> Late
                        </span>
                      )}
                      {s.status === "graded" ? (
                        <span className="pill pill-amber">
                          <Award size={12} /> {s.grade}/{a.totalMarks}
                        </span>
                      ) : (
                        <span className="pill pill-ink">Ungraded</span>
                      )}
                      <a
                        className="btn btn-ghost btn-sm"
                        href={buildDownloadUrl(
                          s.file.publicId,
                          s.file.format,
                          s.file.resourceType
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={14} /> File
                      </a>
                    </div>
                  </summary>

                  <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] grid lg:grid-cols-[1fr_320px] gap-5">
                    <div>
                      <div className="text-xs text-[color:var(--color-ink-400)] mb-2">
                        File details
                      </div>
                      <div className="rounded-xl border border-[color:var(--color-line)] p-3 flex items-center gap-3">
                        <FileText
                          size={18}
                          className="text-[color:var(--color-coral-dark)]"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.file.originalName}
                          </div>
                          <div className="text-xs text-[color:var(--color-ink-400)]">
                            {formatBytes(s.file.bytes)} · {s.file.format?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {s.note && (
                        <div className="mt-3 card-flat !py-3">
                          <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-ink-400)] mb-1">
                            Student note
                          </div>
                          <div className="text-sm text-[color:var(--color-ink-700)] whitespace-pre-wrap">
                            {s.note}
                          </div>
                        </div>
                      )}
                    </div>
                    <GradeForm
                      submissionId={String(s._id)}
                      totalMarks={a.totalMarks}
                      isLate={!!s.isLate}
                      latePenaltyMarks={a.latePenaltyMarks || 0}
                      alreadyGraded={s.status === "graded"}
                      initialGrade={s.gradeRaw ?? s.grade}
                      finalGrade={s.grade}
                      initialFeedback={s.feedback}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "rose" | "amber";
}) {
  const colors: Record<string, string> = {
    rose: "var(--color-rose-soft)",
    amber: "var(--color-amber-soft)",
    ink: "var(--color-cream-200)",
  };
  const text: Record<string, string> = {
    rose: "var(--color-rose)",
    amber: "var(--color-amber)",
    ink: "var(--color-ink-500)",
  };
  const key = accent || "ink";
  return (
    <div className="card !p-5 flex items-center justify-between">
      <div>
        <div className="text-xs text-[color:var(--color-ink-400)]">{label}</div>
        <div className="font-serif text-2xl text-[color:var(--color-ink)] font-semibold">
          {value}
        </div>
      </div>
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: colors[key], color: text[key] }}
      >
        {icon}
      </span>
    </div>
  );
}
