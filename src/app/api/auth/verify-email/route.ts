import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { sendMail, welcomeEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);

    await connectDB();
    const dbUser = await User.findById(user._id);
    if (!dbUser) return fail("User not found", 404);

    if (dbUser.isEmailVerified) {
      return ok({ verified: true, message: "Email is already verified." });
    }

    const { otp } = await req.json();
    const cleanOtp = String(otp || "").trim();

    console.log(
      `[Email Verification DEBUG] userId: ${dbUser._id}, email: ${dbUser.email}, cleanOtp: "${cleanOtp}", dbOtp: "${dbUser.verificationOtp}", isExpired: ${dbUser.verificationOtpExpires ? (new Date() > dbUser.verificationOtpExpires) : true}`
    );

    if (!cleanOtp) {
      return fail("Please enter the verification code", 400);
    }

    if (
      dbUser.verificationOtp !== cleanOtp ||
      !dbUser.verificationOtpExpires ||
      new Date() > dbUser.verificationOtpExpires
    ) {
      return fail("Invalid or expired verification code", 400);
    }

    dbUser.isEmailVerified = true;
    dbUser.verificationOtp = undefined;
    dbUser.verificationOtpExpires = undefined;
    await dbUser.save();

    // Now send the welcome email
    sendMail({
      to: dbUser.email,
      subject: `Welcome to ${process.env.SMTP_FROM_NAME || "TUF Assignment Portal"}`,
      html: welcomeEmail(dbUser.name, dbUser.role, `${getAppUrl()}/login`),
    }).catch((e) => console.error("[welcome mail]", e));

    return ok({ verified: true });
  } catch (err) {
    return handleError(err);
  }
}
