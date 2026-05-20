import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["teacher", "admin"]);
    const { id } = await ctx.params;
    await connectDB();
    const a = await Assignment.findById(id);
    if (!a) return fail("Assignment not found", 404);
    if (user.role !== "admin" && String(a.teacher) !== String(user._id))
      return fail("Forbidden", 403);

    const subs = await Submission.find({ assignment: id })
      .populate("student", "name email rollNumber department avatarUrl")
      .sort({ submittedAt: -1 })
      .lean();

    return ok(
      subs.map((s) => ({
        ...s,
        _id: String(s._id),
        student: s.student,
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}
