import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { sendMail, verificationOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);

    await connectDB();
    const dbUser = await User.findById(user._id);
    if (!dbUser) return fail("User not found", 404);

    if (dbUser.isEmailVerified) {
      return fail("Email is already verified", 400);
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`[Email Verification] Resent OTP for ${dbUser.email}: ${otp}`);

    dbUser.verificationOtp = otp;
    dbUser.verificationOtpExpires = otpExpires;
    await dbUser.save();

    // Send verification OTP email
    sendMail({
      to: dbUser.email,
      subject: `Verify your ${process.env.SMTP_FROM_NAME || "TUF Assignment Portal"} account`,
      html: verificationOtpEmail(dbUser.name, otp),
    }).catch((e) => console.error("[verification mail resend]", e));

    return ok({ sent: true });
  } catch (err) {
    return handleError(err);
  }
}
