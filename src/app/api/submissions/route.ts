import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { sendMail, submissionConfirmationEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    await connectDB();

    const filter: Record<string, unknown> =
      user.role === "student" ? { student: user._id } : {};
    const subs = await Submission.find(filter)
      .populate({
        path: "assignment",
        select: "title deadline totalMarks teacher",
        populate: { path: "teacher", select: "name" },
      })
      .populate("student", "name email rollNumber")
      .sort({ submittedAt: -1 })
      .lean();

    return ok(
      subs.map((s) => ({
        ...s,
        _id: String(s._id),
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["student"]);
    const form = await req.formData();
    const assignmentId = String(form.get("assignmentId") || "");
    const note = String(form.get("note") || "").trim();
    const file = form.get("file") as File | null;
    if (!assignmentId) return fail("assignmentId is required", 400);
    if (!file || typeof file !== "object" || !("arrayBuffer" in file))
      return fail("Please attach a file to submit", 400);

    const maxMB = Number(process.env.MAX_FILE_SIZE_MB || 25);
    if (file.size > maxMB * 1024 * 1024)
      return fail(`File too large. Maximum size is ${maxMB} MB.`, 400);

    await connectDB();
    const a = await Assignment.findById(assignmentId);
    if (!a) return fail("Assignment not found", 404);
    const isLate = Date.now() > new Date(a.deadline).getTime();
    if (isLate && !a.allowLateSubmission)
      return fail("Late submissions are not allowed for this assignment", 400);

    // If the student already has a submission, enforce the locking rules
    // BEFORE uploading anything to Cloudinary — otherwise we'd waste an upload
    // and create an orphan file when the request gets rejected.
    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: user._id,
    });
    if (existing && existing.status === "graded") {
      return fail(
        "This submission has already been graded by your teacher and can no longer be changed.",
        409
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadBufferToCloudinary(
      buf,
      file.name,
      `submissions/${assignmentId}`
    );

    if (existing) {
      await deleteFromCloudinary(existing.file.publicId, existing.file.resourceType);
      existing.file = uploaded;
      existing.note = note || undefined;
      existing.isLate = isLate;
      existing.status = isLate ? "late" : "submitted";
      existing.submittedAt = new Date();
      // wipe any previous grading state since the file changed
      existing.grade = undefined;
      existing.gradeRaw = undefined;
      existing.latePenaltyApplied = 0;
      existing.feedback = undefined;
      existing.gradedAt = undefined;
      existing.gradedBy = undefined;
      await existing.save();
    } else {
      await Submission.create({
        assignment: assignmentId,
        student: user._id,
        file: uploaded,
        note: note || undefined,
        isLate,
        status: isLate ? "late" : "submitted",
        submittedAt: new Date(),
      });
    }

    // Confirmation email
    sendMail({
      to: user.email,
      subject: `Submission received — ${a.title}`,
      html: submissionConfirmationEmail({
        studentName: user.name,
        assignmentTitle: a.title,
        submittedAt: new Date(),
        isLate,
        dashboardUrl: `${getAppUrl()}/student/submissions`,
      }),
    }).catch((e) => console.error("[submission mail]", e));

    return ok({ submitted: true, isLate });
  } catch (err) {
    return handleError(err);
  }
}
