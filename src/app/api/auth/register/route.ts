import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { fail, handleError, ok } from "@/lib/api";
import { isValidEmail, getAppUrl } from "@/lib/utils";
import { sendMail, verificationOtpEmail } from "@/lib/email";
import { ensureAdminUser } from "@/lib/seed";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminUser();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = body.role === "teacher" ? "teacher" : "student";
    const rollNumber = body.rollNumber ? String(body.rollNumber).trim() : undefined;
    const department = body.department ? String(body.department).trim() : undefined;

    if (!name || name.length < 2) return fail("Please enter your full name", 400);
    if (!isValidEmail(email)) return fail("Please enter a valid email address", 400);
    if (password.length < 6)
      return fail("Password must be at least 6 characters long", 400);

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return fail("An account with this email already exists", 409);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`[Email Verification] Generated OTP for ${email}: ${otp}`);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      rollNumber,
      department,
      isActive: true,
      isEmailVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

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

    // Fire and forget verification email
    sendMail({
      to: user.email,
      subject: `Verify your ${process.env.SMTP_FROM_NAME || "TUF Assignment Portal"} account`,
      html: verificationOtpEmail(user.name, otp),
    }).catch((e) => console.error("[verification mail]", e));

    return ok({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: false,
    });
  } catch (err) {
    return handleError(err);
  }
}
