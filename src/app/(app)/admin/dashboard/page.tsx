import Link from "next/link";
import {
  Users,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Inbox,
  Award,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { formatDate, formatDateTime } from "@/lib/utils";
import { StatTile } from "@/components/StatTile";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  const [students, teachers, admins, assignments, submissions, late, graded] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      Assignment.countDocuments({}),
      Submission.countDocuments({}),
      Submission.countDocuments({ isLate: true }),
      Submission.countDocuments({ status: "graded" }),
    ]);

  const recentUsers = await User.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .select("-passwordHash -resetTokenHash -resetTokenExpires")
    .lean();

  const recentAssignments = await Assignment.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("teacher", "name")
    .lean();

  return (
    <PageTransition>
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="System overview"
        description="Everything happening across the portal — at a glance."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Students" value={students} icon={<GraduationCap />} accent="coral" delay={0.0} />
        <StatTile label="Teachers" value={teachers} icon={<Briefcase />} accent="sage" delay={0.06} />
        <StatTile label="Admins" value={admins} icon={<ShieldCheck />} accent="amber" delay={0.12} />
        <StatTile label="Assignments" value={assignments} icon={<ClipboardList />} delay={0.18} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label="Submissions" value={submissions} icon={<Inbox />} accent="sage" delay={0.24} />
        <StatTile label="Late submissions" value={late} icon={<AlertTriangle />} accent="coral" delay={0.30} />
        <StatTile label="Graded" value={graded} icon={<Award />} accent="amber" delay={0.36} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
              Recent users
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-[color:var(--color-coral-dark)] hover:underline"
            >
              Manage all
            </Link>
          </div>
          <ul className="divide-y divide-[color:var(--color-line-soft)]">
            {recentUsers.map((u) => (
              <li key={String(u._id)} className="py-3 flex items-center gap-3">
                <Avatar name={u.name} src={u.avatarUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[color:var(--color-ink)] truncate">
                    {u.name}
                  </div>
                  <div className="text-xs text-[color:var(--color-ink-400)]">
                    {u.email} · Joined {formatDate(u.createdAt)}
                  </div>
                </div>
                <span className={`pill ${roleColor(u.role)}`}>{u.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
              Recent assignments
            </h2>
            <Link
              href="/admin/assignments"
              className="text-sm text-[color:var(--color-coral-dark)] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[color:var(--color-line-soft)]">
            {recentAssignments.length === 0 && (
              <li className="py-6 text-sm text-[color:var(--color-ink-400)] text-center">
                Nothing yet.
              </li>
            )}
            {recentAssignments.map((a) => {
              const t = a.teacher as unknown as { name: string };
              return (
                <li
                  key={String(a._id)}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[color:var(--color-ink)] truncate">
                      {a.title}
                    </div>
                    <div className="text-xs text-[color:var(--color-ink-400)]">
                      by {t?.name} · Due {formatDateTime(a.deadline)}
                    </div>
                  </div>
                  <span className="text-xs text-[color:var(--color-ink-400)]">
                    {formatDate(a.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

function roleColor(role: string) {
  if (role === "admin") return "pill-amber";
  if (role === "teacher") return "pill-sage";
  return "pill-coral";
}
