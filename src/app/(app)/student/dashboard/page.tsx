import Link from "next/link";
import {
  ClipboardList,
  Send,
  Clock,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AssignmentCard } from "@/components/AssignmentCard";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { StatTile } from "@/components/StatTile";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const user = (await getCurrentUser())!;
  await connectDB();

  const [assignments, mySubs] = await Promise.all([
    Assignment.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("teacher", "name department")
      .lean(),
    Submission.find({ student: user._id }).lean(),
  ]);

  const submittedSet = new Set(mySubs.map((s) => String(s.assignment)));
  const totalAssignments = await Assignment.countDocuments({ isPublished: true });
  const pending = totalAssignments - submittedSet.size;
  const lateCount = mySubs.filter((s) => s.isLate).length;
  const gradedCount = mySubs.filter((s) => s.status === "graded").length;

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Student workspace"
          title={`Hello, ${user.name.split(" ")[0]}.`}
          description={
            totalAssignments === 0
              ? "No assignments yet — check back soon."
              : pending > 0
                ? `You have ${pending} assignment${pending === 1 ? "" : "s"} waiting to be submitted.`
                : "You're all caught up. Nicely done."
          }
          action={
            <Link href="/student/assignments" className="btn btn-primary">
              Browse assignments <ArrowRight size={14} />
            </Link>
          }
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="All assignments" value={totalAssignments} icon={<ClipboardList />} delay={0.0} />
          <StatTile label="Submitted" value={mySubs.length} icon={<Send />} accent="sage" delay={0.08} />
          <StatTile label="Pending" value={Math.max(pending, 0)} icon={<Clock />} accent="coral" delay={0.16} />
          <StatTile label="Graded" value={gradedCount} icon={<CheckCircle2 />} accent="amber" delay={0.24} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-semibold text-[color:var(--color-ink)]">
              Recent assignments
            </h2>
            <Link
              href="/student/assignments"
              className="text-sm text-[color:var(--color-coral-dark)] hover:underline"
            >
              View all
            </Link>
          </div>
          {assignments.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No assignments yet"
              description="Once your teachers publish new work, it will appear here."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {assignments.map((a) => (
                <AssignmentCard
                  key={String(a._id)}
                  viewer="student"
                  href={`/student/assignments/${String(a._id)}`}
                  a={{
                    _id: String(a._id),
                    title: a.title,
                    description: a.description,
                    subject: a.subject,
                    deadline: a.deadline as unknown as string,
                    totalMarks: a.totalMarks,
                    teacher: a.teacher as unknown as {
                      name: string;
                      department?: string;
                    },
                    submitted: submittedSet.has(String(a._id)),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {lateCount > 0 && (
          <div className="card-flat border-[color:var(--color-amber-soft)] bg-[color:var(--color-amber-soft)]/40">
            <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)] mb-1">
              Heads up — {lateCount} late submission{lateCount === 1 ? "" : "s"}
            </h3>
            <p className="text-sm text-[color:var(--color-ink-500)]">
              Late submissions are still recorded but may affect your grade. Try to submit
              before the deadline next time.
            </p>
          </div>
        )}

        <p className="text-xs text-[color:var(--color-ink-300)]">
          Signed in as {user.email} · Member since {formatDate(user.createdAt)}
        </p>
      </div>
    </PageTransition>
  );
}
