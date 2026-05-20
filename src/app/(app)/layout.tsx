import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ToastProvider } from "@/components/Toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isEmailVerified) redirect("/verify-email");
  const safe = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
  return (
    <ToastProvider>
      <DashboardShell user={safe}>{children}</DashboardShell>
    </ToastProvider>
  );
}
