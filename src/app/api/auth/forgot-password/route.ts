import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { handleError, ok } from "@/lib/api";
import { isValidEmail, getAppUrl } from "@/lib/utils";
import { resetPasswordEmail, sendMail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();

    // Always return success to avoid email enumeration.
    if (!isValidEmail(email)) {
      return ok({ sent: true });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetTokenHash = hash;
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
      await user.save();

      const resetUrl = `${getAppUrl()}/reset-password/${rawToken}`;
      try {
        await sendMail({
          to: user.email,
          subject: "Reset your TUF Assignment Portal password",
          html: resetPasswordEmail(user.name, resetUrl),
        });
      } catch (e) {
        console.error("[forgot mail send]", e);
      }
    }
    return ok({ sent: true });
  } catch (err) {
    return handleError(err);
  }
}
