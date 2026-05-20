import { Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { UserRow } from "@/components/UserRow";
import { EmptyState } from "@/components/EmptyState";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const me = (await getCurrentUser())!;
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (sp.role && ["student", "teacher", "admin"].includes(sp.role))
    filter.role = sp.role;
  if (sp.q) {
    filter.$or = [
      { name: { $regex: sp.q, $options: "i" } },
      { email: { $regex: sp.q, $options: "i" } },
      { rollNumber: { $regex: sp.q, $options: "i" } },
    ];
  }
  const users = await User.find(filter)
    .select("-passwordHash -resetTokenHash -resetTokenExpires")
    .sort({ createdAt: -1 })
    .lean();

  const buildHref = (k: string, v: string | undefined) => {
    const p = new URLSearchParams();
    if (sp.role) p.set("role", sp.role);
    if (sp.q) p.set("q", sp.q);
    if (v) p.set(k, v);
    else p.delete(k);
    const s = p.toString();
    return `/admin/users${s ? `?${s}` : ""}`;
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Manage every student, teacher, and admin in the system."
      />

      <form className="card !py-4 flex flex-wrap items-center gap-3" method="GET">
        <input
          type="search"
          name="q"
          placeholder="Search name, email, or roll number..."
          defaultValue={sp.q || ""}
          className="input flex-1 min-w-[220px]"
        />
        <select name="role" defaultValue={sp.role || ""} className="input !w-auto">
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
        <button className="btn btn-primary btn-sm">Filter</button>
      </form>

      <div className="flex gap-2 text-sm">
        <a href={buildHref("role", undefined)} className="link">
          All ({users.length})
        </a>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match"
          description="Try a different filter or search query."
        />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <UserRow
              key={String(u._id)}
              isMe={String(u._id) === String(me._id)}
              user={{
                _id: String(u._id),
                name: u.name,
                email: u.email,
                role: u.role,
                avatarUrl: u.avatarUrl,
                rollNumber: u.rollNumber,
                department: u.department,
                isActive: u.isActive,
                createdAt: u.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
}
