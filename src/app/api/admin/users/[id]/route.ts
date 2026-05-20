import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { Assignment } from "@/models/Assignment";
import { requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await ctx.params;
    const body = await req.json();
    await connectDB();
    const user = await User.findById(id);
    if (!user) return fail("User not found", 404);

    if (typeof body.isActive === "boolean") user.isActive = body.isActive;
    if (body.role && ["student", "teacher", "admin"].includes(body.role))
      user.role = body.role;
    if (typeof body.name === "string" && body.name.trim()) user.name = body.name.trim();
    if (typeof body.department === "string") user.department = body.department.trim();
    if (typeof body.rollNumber === "string") user.rollNumber = body.rollNumber.trim();

    await user.save();
    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireRole(["admin"]);
    const { id } = await ctx.params;
    if (String(me._id) === id)
      return fail("You cannot delete your own admin account", 400);
    await connectDB();
    const user = await User.findById(id);
    if (!user) return fail("User not found", 404);

    if (user.avatarPublicId)
      await deleteFromCloudinary(user.avatarPublicId, "image");

    if (user.role === "student") {
      const subs = await Submission.find({ student: id });
      for (const s of subs)
        await deleteFromCloudinary(s.file.publicId, s.file.resourceType);
      await Submission.deleteMany({ student: id });
    } else if (user.role === "teacher") {
      const ass = await Assignment.find({ teacher: id });
      for (const a of ass) {
        for (const att of a.attachments)
          await deleteFromCloudinary(att.publicId, att.resourceType);
        const subs = await Submission.find({ assignment: a._id });
        for (const s of subs)
          await deleteFromCloudinary(s.file.publicId, s.file.resourceType);
        await Submission.deleteMany({ assignment: a._id });
        await a.deleteOne();
      }
    }

    await user.deleteOne();
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
