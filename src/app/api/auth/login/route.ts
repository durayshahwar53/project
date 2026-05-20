import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { fail, handleError, ok } from "@/lib/api";
import { signToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/auth";
import { ensureAdminUser } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminUser();
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    if (!email || !password) return fail("Email and password are required", 400);

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return fail("Invalid email or password", 401);
    if (!user.isActive)
      return fail(
        "Your account has been deactivated. Please contact the administrator.",
        403
      );

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail("Invalid email or password", 401);

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const store = await cookies();
    store.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return ok({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return handleError(err);
  }
}
