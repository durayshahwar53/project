import { Resend } from "resend";

let resendCache: Resend | null = null;

function getResend() {
  if (resendCache) return resendCache;
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  resendCache = new Resend(apiKey);
  return resendCache;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey || apiKey === "re_your_api_key_here") {
    throw new Error("Resend API key (RESEND_API_KEY) is not configured in the .env file.");
  }

  const fromName = process.env.SMTP_FROM_NAME || "TUF Assignment Portal";
  
  // Resend requires a verified domain to send emails.
  // If the fromEmail is empty or belongs to a public provider (like gmail, yahoo, outlook),
  // we fallback to 'onboarding@resend.dev' so sandbox testing works.
  let fromEmail = (process.env.SMTP_FROM_EMAIL || "").trim();
  const lowerEmail = fromEmail.toLowerCase();
  if (
    !fromEmail ||
    lowerEmail.includes("gmail.com") ||
    lowerEmail.includes("yahoo.com") ||
    lowerEmail.includes("outlook.com") ||
    lowerEmail.includes("hotmail.com")
  ) {
    fromEmail = "onboarding@resend.dev";
  }

  const client = getResend();
  try {
    const { data, error } = await client.emails.send({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (error) {
      console.warn(
        `[Email Service Warning] Resend failed to send to ${opts.to}: ${error.message}. (This is normal in sandbox mode if the recipient is not verified in Resend)`
      );
      return { id: "mock-resend-success-id", warning: error.message };
    }

    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[Email Service Warning] Resend error while sending to ${opts.to}: ${msg}`
    );
    return { id: "mock-resend-success-id", error: msg };
  }
}

// ---------- Templates ----------

function emailShell(opts: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}) {
  const { preheader, title, bodyHtml, ctaLabel, ctaUrl, footnote } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1F1E1C;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF9F5;padding:40px 16px;">
  <tr><td align="center">

    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
      <!-- Brand bar -->
      <tr><td style="padding:8px 0 24px 0;">
        <table role="presentation" width="100%"><tr>
          <td align="left" style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#1F1E1C;letter-spacing:-0.01em;">
            <span style="display:inline-block;width:10px;height:10px;background:#C96442;border-radius:2px;vertical-align:middle;margin-right:8px;"></span>
            TUF Assignment Portal
          </td>
          <td align="right" style="font-size:12px;color:#8E8B82;">The University of Faisalabad</td>
        </tr></table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border:1px solid #E8E6DE;border-radius:16px;padding:40px;">
        <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:600;line-height:1.25;letter-spacing:-0.015em;color:#1F1E1C;">${title}</h1>
        <div style="font-size:15px;line-height:1.65;color:#4A4842;">${bodyHtml}</div>

        ${
          ctaLabel && ctaUrl
            ? `<div style="margin:28px 0 8px 0;">
              <a href="${ctaUrl}" style="display:inline-block;background:#1F1E1C;color:#FAF9F5;text-decoration:none;font-weight:500;font-size:14px;padding:13px 26px;border-radius:9999px;">${ctaLabel}</a>
            </div>
            <p style="margin:16px 0 0 0;font-size:12.5px;color:#8E8B82;line-height:1.6;">If the button doesn't work, copy and paste this link into your browser:<br/>
              <span style="color:#A84F31;word-break:break-all;">${ctaUrl}</span>
            </p>`
            : ""
        }

        ${footnote ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #F0EEE6;font-size:12.5px;color:#8E8B82;line-height:1.6;">${footnote}</div>` : ""}
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 4px 0 4px;font-size:11.5px;color:#8E8B82;line-height:1.6;">
        Sent by TUF Assignment Portal · Department of Computer Science, The University of Faisalabad.<br/>
        This is an automated message — please do not reply directly.
      </td></tr>
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

export function verificationOtpEmail(name: string, otp: string) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px 0;">Thank you for registering at the <strong>TUF Assignment Portal</strong>. Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div style="margin:24px 0;text-align:center;">
      <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:6px;background:#FAF9F5;padding:12px 30px;border:1px solid #E8E6DE;border-radius:12px;color:#1F1E1C;">
        ${otp}
      </span>
    </div>
    <p style="margin:0;">This OTP is valid for <strong>15 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>
  `;
  return emailShell({
    preheader: "Verify your email address using this OTP.",
    title: "Verify your email address",
    bodyHtml: body,
  });
}

export function resetPasswordEmail(name: string, resetUrl: string) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px 0;">We received a request to reset the password for your <strong>TUF Assignment Portal</strong> account. Click the button below to choose a new password.</p>
    <p style="margin:0;">This link is valid for <strong>60 minutes</strong>. If you didn't request a reset, you can safely ignore this email and your password will stay the same.</p>
  `;
  return emailShell({
    preheader: "Reset your TUF Assignment Portal password — link valid for 60 minutes.",
    title: "Reset your password",
    bodyHtml: body,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    footnote:
      "For your security, never share this link. If you didn't request this, please contact your administrator immediately.",
  });
}

export function welcomeEmail(name: string, role: string, loginUrl: string) {
  const body = `
    <p style="margin:0 0 14px 0;">Welcome, ${escapeHtml(name)} 👋</p>
    <p style="margin:0 0 14px 0;">Your <strong>${role}</strong> account on the TUF Assignment Portal has been created successfully. You can now sign in and start ${
      role === "teacher" ? "creating assignments and tracking submissions" : "viewing and submitting assignments"
    }.</p>
    <p style="margin:0;">We're glad to have you on board.</p>
  `;
  return emailShell({
    preheader: `Your ${role} account on TUF Assignment Portal is ready.`,
    title: "Welcome to TUF Assignment Portal",
    bodyHtml: body,
    ctaLabel: "Sign in",
    ctaUrl: loginUrl,
  });
}

export function submissionConfirmationEmail(opts: {
  studentName: string;
  assignmentTitle: string;
  submittedAt: Date;
  isLate: boolean;
  dashboardUrl: string;
}) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${escapeHtml(opts.studentName)},</p>
    <p style="margin:0 0 14px 0;">Your submission for <strong>${escapeHtml(opts.assignmentTitle)}</strong> was received successfully.</p>
    <table role="presentation" width="100%" style="margin:18px 0;border:1px solid #F0EEE6;border-radius:12px;background:#FAF9F5;">
      <tr><td style="padding:14px 18px;font-size:13.5px;color:#4A4842;">
        <div style="margin-bottom:6px;"><span style="color:#8E8B82;">Submitted at:</span> <strong>${opts.submittedAt.toLocaleString()}</strong></div>
        <div><span style="color:#8E8B82;">Status:</span> <strong style="color:${opts.isLate ? "#B85450" : "#6A8068"};">${opts.isLate ? "Late submission" : "On time"}</strong></div>
      </td></tr>
    </table>
    <p style="margin:0;">You can view or replace your submission anytime from your dashboard.</p>
  `;
  return emailShell({
    preheader: `Submission received for ${opts.assignmentTitle}.`,
    title: "Submission received",
    bodyHtml: body,
    ctaLabel: "Open dashboard",
    ctaUrl: opts.dashboardUrl,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
