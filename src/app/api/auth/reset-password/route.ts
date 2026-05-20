import { NextRequest } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { fail, handleError, ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || "");
    const password = String(body.password || "");
    if (!token) return fail("Reset token is missing", 400);
    if (password.length < 6)
      return fail("Password must be at least 6 characters long", 400);

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    await connectDB();
    const user = await User.findOne({
      resetTokenHash: hash,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) return fail("This reset link is invalid or has expired", 400);

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return ok({ reset: true });
  } catch (err) {
    return handleError(err);
  }
}
