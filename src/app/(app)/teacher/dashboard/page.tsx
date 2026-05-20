import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Inbox,
  Award,
  PlusCircle,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { AssignmentCard } from "@/components/AssignmentCard";
import { StatTile } from "@/components/StatTile";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const user = (await getCurrentUser())!;
  await connectDB();
  const [list, totalAssignments] = await Promise.all([
    Assignment.find({ teacher: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("teacher", "name department")
      .lean(),
    Assignment.countDocuments({ teacher: user._id }),
  ]);
  const ids = list.map((a) => a._id);
  const counts = await Submission.aggregate([
    { $match: { assignment: { $in: ids } } },
    { $group: { _id: "$assignment", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[String(c._id)] = c.count;

  const [totalSubs, pendingGrade, graded] = await Promise.all([
    Submission.countDocuments({
      assignment: {
        $in: await Assignment.find({ teacher: user._id }).distinct("_id"),
      },
    }),
    Submission.countDocuments({
      status: { $ne: "graded" },
      assignment: {
        $in: await Assignment.find({ teacher: user._id }).distinct("_id"),
      },
    }),
    Submission.countDocuments({
      status: "graded",
      assignment: {
        $in: await Assignment.find({ teacher: user._id }).distinct("_id"),
      },
    }),
  ]);

  return (
    <PageTransition>
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teacher workspace"
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        description="Manage your assignments, review submissions and grade work."
        action={
          <Link href="/teacher/assignments/new" className="btn btn-coral">
            <PlusCircle size={14} /> New assignment
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="My assignments" value={totalAssignments} icon={<ClipboardList />} delay={0.0} />
        <StatTile label="Total submissions" value={totalSubs} icon={<Inbox />} accent="sage" delay={0.08} />
        <StatTile label="Awaiting grading" value={pendingGrade} icon={<FileText />} accent="coral" delay={0.16} />
        <StatTile label="Graded" value={graded} icon={<Award />} accent="amber" delay={0.24} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-semibold text-[color:var(--color-ink)]">
            Recent assignments
          </h2>
          <Link
            href="/teacher/assignments"
            className="text-sm text-[color:var(--color-coral-dark)] hover:underline"
          >
            View all
          </Link>
        </div>
        {list.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            description="Get started by creating your first assignment."
            action={
              <Link href="/teacher/assignments/new" className="btn btn-primary">
                <PlusCircle size={14} /> Create assignment
              </Link>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((a) => (
              <AssignmentCard
                key={String(a._id)}
                viewer="teacher"
                href={`/teacher/assignments/${String(a._id)}`}
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
                  submissionCount: countMap[String(a._id)] || 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
