import Link from "next/link";
import {
  Award,
  Clock,
  Download,
  FileText,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { buildDownloadUrl } from "@/lib/cloudinary";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function MySubmissions() {
  const user = (await getCurrentUser())!;
  await connectDB();
  const subs = await Submission.find({ student: user._id })
    .sort({ submittedAt: -1 })
    .populate("assignment", "title totalMarks deadline")
    .lean();

  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="My submissions"
        description="Every assignment you've turned in, with grades and feedback."
      />
      {subs.length === 0 ? (
        <EmptyState
          icon={Send}
          title="You haven't submitted anything yet"
          description="Once you submit an assignment, the receipt will appear here."
        />
      ) : (
        <div className="space-y-3">
          {subs.map((s) => {
            const a = s.assignment as unknown as {
              _id: string;
              title: string;
              totalMarks: number;
              deadline: Date;
            };
            return (
              <div key={String(s._id)} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/student/assignments/${String(a._id)}`}
                      className="font-serif text-xl font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-coral-dark)] block leading-tight"
                    >
                      {a.title}
                    </Link>
                    <div className="mt-1 text-xs text-[color:var(--color-ink-400)] flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> Submitted {formatDateTime(s.submittedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText size={12} /> {formatBytes(s.file.bytes)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.status === "graded" ? (
                      <span className="pill pill-amber">
                        <Award size={12} /> {s.grade}/{a.totalMarks}
                      </span>
                    ) : s.isLate ? (
                      <span className="pill pill-rose">
                        <AlertTriangle size={12} /> Late
                      </span>
                    ) : (
                      <span className="pill pill-sage">
                        <CheckCircle2 size={12} /> Submitted
                      </span>
                    )}
                    <a
                      className="btn btn-ghost btn-sm"
                      href={buildDownloadUrl(
                        s.file.publicId,
                        s.file.format,
                        s.file.resourceType
                      )}
                    >
                      <Download size={14} /> File
                    </a>
                  </div>
                </div>
                {s.feedback && (
                  <div className="mt-4 card-flat !py-3">
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-ink-400)] mb-1">
                      Feedback
                    </div>
                    <div className="text-sm text-[color:var(--color-ink-700)] leading-relaxed whitespace-pre-wrap">
                      {s.feedback}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </PageTransition>
  );
}
