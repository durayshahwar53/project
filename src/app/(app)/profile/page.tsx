import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/ProfileForm";
import { PageTransition } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = (await getCurrentUser())!;
  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Update your personal information and security settings."
      />
      <ProfileForm
        me={{
          id: me._id.toString(),
          name: me.name,
          email: me.email,
          role: me.role,
          avatarUrl: me.avatarUrl,
          rollNumber: me.rollNumber,
          department: me.department,
          bio: me.bio,
        }}
      />
    </div>
    </PageTransition>
  );
}
