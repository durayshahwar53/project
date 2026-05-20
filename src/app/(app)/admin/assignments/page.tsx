import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  await connectDB();
  const list = await Assignment.find({})
    .sort({ createdAt: -1 })
    .populate("teacher", "name email department")
    .lean();
  const counts = await Submission.aggregate([
    { $group: { _id: "$assignment", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[String(c._id)] = c.count;

  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="All assignments"
        description="Every assignment in the system, across all teachers."
      />

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Teachers will publish assignments here as they go live."
        />
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--color-cream-100)] text-[color:var(--color-ink-400)] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Teacher</th>
                <th className="text-left px-4 py-3">Deadline</th>
                <th className="text-left px-4 py-3">Marks</th>
                <th className="text-left px-4 py-3">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-line-soft)]">
              {list.map((a) => {
                const t = a.teacher as unknown as {
                  name: string;
                  department?: string;
                };
                return (
                  <tr
                    key={String(a._id)}
                    className="hover:bg-[color:var(--color-cream)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/teacher/assignments/${String(a._id)}`}
                        className="font-medium text-[color:var(--color-ink)] hover:text-[color:var(--color-coral-dark)]"
                      >
                        {a.title}
                      </Link>
                      {a.subject && (
                        <div className="text-xs text-[color:var(--color-ink-400)]">
                          {a.subject}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{t?.name}</div>
                      {t?.department && (
                        <div className="text-xs text-[color:var(--color-ink-400)]">
                          {t.department}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-ink-500)]">
                      {formatDateTime(a.deadline)}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-ink-500)]">
                      {a.totalMarks}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-ink)] font-medium">
                      {countMap[String(a._id)] || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
