import { ClipboardList } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { AssignmentCard } from "@/components/AssignmentCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const user = (await getCurrentUser())!;
  await connectDB();
  const [list, mySubs] = await Promise.all([
    Assignment.find({ isPublished: true })
      .sort({ deadline: 1 })
      .populate("teacher", "name department")
      .lean(),
    Submission.find({ student: user._id }).select("assignment").lean(),
  ]);
  const submittedSet = new Set(mySubs.map((s) => String(s.assignment)));

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Browse"
          title="All assignments"
          description="Open work assigned to you across every subject."
        />
        {list.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nothing here yet"
            description="Teachers haven't published any assignments. You'll see them here as they go live."
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((a) => (
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
    </PageTransition>
  );
}
