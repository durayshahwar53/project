import { getCurrentUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    return ok({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      rollNumber: user.rollNumber,
      department: user.department,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return handleError(err);
  }
}
