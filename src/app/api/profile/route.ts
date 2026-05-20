import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "@/lib/cloudinary";

export async function PATCH(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return fail("Not authenticated", 401);

    const contentType = req.headers.get("content-type") || "";
    await connectDB();
    const user = await User.findById(me._id);
    if (!user) return fail("User not found", 404);

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const name = String(form.get("name") || "").trim();
      const department = String(form.get("department") || "").trim();
      const rollNumber = String(form.get("rollNumber") || "").trim();
      const bio = String(form.get("bio") || "").trim();
      if (name) user.name = name;
      user.department = department || undefined;
      user.rollNumber = rollNumber || undefined;
      user.bio = bio || undefined;

      const avatar = form.get("avatar") as File | null;
      if (avatar && typeof avatar === "object" && "arrayBuffer" in avatar && avatar.size > 0) {
        const buf = Buffer.from(await avatar.arrayBuffer());
        const uploaded = await uploadBufferToCloudinary(buf, avatar.name, "avatars");
        if (user.avatarPublicId)
          await deleteFromCloudinary(user.avatarPublicId, "image");
        user.avatarUrl = uploaded.url;
        user.avatarPublicId = uploaded.publicId;
      }
    } else {
      const body = await req.json();
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");
      if (!currentPassword || !newPassword)
        return fail("Current and new password are required", 400);
      if (newPassword.length < 6) return fail("Password is too short", 400);
      const ok2 = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok2) return fail("Current password is incorrect", 400);
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}
