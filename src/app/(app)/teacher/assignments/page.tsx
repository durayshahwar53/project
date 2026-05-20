import Link from "next/link";
import { ClipboardList, PlusCircle } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { AssignmentCard } from "@/components/AssignmentCard";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const user = (await getCurrentUser())!;
  await connectDB();
  const list = await Assignment.find({ teacher: user._id })
    .sort({ createdAt: -1 })
    .populate("teacher", "name department")
    .lean();
  const counts = await Submission.aggregate([
    { $match: { assignment: { $in: list.map((a) => a._id) } } },
    { $group: { _id: "$assignment", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[String(c._id)] = c.count;

  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader
        eyebrow="My work"
        title="Assignments"
        description="Everything you've published, with submission counts at a glance."
        action={
          <Link href="/teacher/assignments/new" className="btn btn-coral">
            <PlusCircle size={14} /> New assignment
          </Link>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Publish your first assignment to start collecting submissions."
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
    </PageTransition>
  );
}
