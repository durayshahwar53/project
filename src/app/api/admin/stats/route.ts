import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { requireRole } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    await requireRole(["admin"]);
    await connectDB();
    const [students, teachers, admins, assignments, submissions, lateSubs, gradedSubs] =
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

    return ok({
      counts: {
        students,
        teachers,
        admins,
        assignments,
        submissions,
        lateSubs,
        gradedSubs,
      },
      recentUsers: recentUsers.map((u) => ({ ...u, _id: String(u._id) })),
      recentAssignments: recentAssignments.map((a) => ({
        ...a,
        _id: String(a._id),
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
