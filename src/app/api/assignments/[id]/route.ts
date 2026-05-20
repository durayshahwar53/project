import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    await connectDB();

    const a = await Assignment.findById(id)
      .populate("teacher", "name email department")
      .lean();
    if (!a) return fail("Assignment not found", 404);

    let mySubmission = null;
    if (user.role === "student") {
      mySubmission = await Submission.findOne({
        assignment: id,
        student: user._id,
      }).lean();
    }

    return ok({
      ...a,
      _id: String(a._id),
      mySubmission: mySubmission
        ? { ...mySubmission, _id: String(mySubmission._id) }
        : null,
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["teacher", "admin"]);
    const { id } = await ctx.params;
    await connectDB();

    const a = await Assignment.findById(id);
    if (!a) return fail("Assignment not found", 404);
    if (user.role !== "admin" && String(a.teacher) !== String(user._id)) {
      return fail("Forbidden", 403);
    }

    // Best-effort cleanup of Cloudinary files
    for (const att of a.attachments)
      await deleteFromCloudinary(att.publicId, att.resourceType);
    const subs = await Submission.find({ assignment: id });
    for (const s of subs)
      await deleteFromCloudinary(s.file.publicId, s.file.resourceType);

    await Submission.deleteMany({ assignment: id });
    await a.deleteOne();
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
