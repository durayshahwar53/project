import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    await connectDB();

    const url = new URL(req.url);
    const mine = url.searchParams.get("mine") === "1";
    const filter: Record<string, unknown> = { isPublished: true };

    if (user.role === "teacher" && mine) {
      filter.teacher = user._id;
      delete filter.isPublished;
    } else if (user.role === "teacher" && !mine) {
      filter.teacher = user._id;
      delete filter.isPublished;
    }
    // students see all published; admin sees everything
    if (user.role === "admin") delete filter.isPublished;

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .populate("teacher", "name email department")
      .lean();

    // Build student-submission map
    let submittedSet = new Set<string>();
    if (user.role === "student") {
      const subs = await Submission.find({
        student: user._id,
        assignment: { $in: assignments.map((a) => a._id) },
      })
        .select("assignment")
        .lean();
      submittedSet = new Set(subs.map((s) => String(s.assignment)));
    }

    // Build submission counts for teachers
    const submissionCounts: Record<string, number> = {};
    if (user.role === "teacher" || user.role === "admin") {
      const counts = await Submission.aggregate([
        { $match: { assignment: { $in: assignments.map((a) => a._id) } } },
        { $group: { _id: "$assignment", count: { $sum: 1 } } },
      ]);
      for (const c of counts) submissionCounts[String(c._id)] = c.count;
    }

    return ok(
      assignments.map((a) => ({
        ...a,
        _id: String(a._id),
        teacher: a.teacher,
        submitted: submittedSet.has(String(a._id)),
        submissionCount: submissionCounts[String(a._id)] || 0,
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["teacher", "admin"]);
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const deadlineStr = String(form.get("deadline") || "");
    const totalMarks = Number(form.get("totalMarks") || 100);
    const allowLateSubmission = form.get("allowLateSubmission") === "true";
    const latePenaltyMarks = Math.max(
      0,
      Number(form.get("latePenaltyMarks") || 0)
    );

    if (!title || title.length < 3) return fail("Title is too short", 400);
    if (!description) return fail("Description is required", 400);
    if (!deadlineStr) return fail("Deadline is required", 400);
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return fail("Invalid deadline", 400);

    const attachments = [];
    const files = form.getAll("attachments");
    for (const f of files) {
      if (f && typeof f === "object" && "arrayBuffer" in f) {
        const file = f as File;
        if (file.size === 0) continue;
        const buf = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadBufferToCloudinary(
          buf,
          file.name,
          "assignment_attachments"
        );
        attachments.push(uploaded);
      }
    }

    await connectDB();
    const teacher = await User.findById(user._id);
    const created = await Assignment.create({
      title,
      description,
      subject: subject || undefined,
      deadline,
      totalMarks,
      teacher: teacher!._id,
      attachments,
      allowLateSubmission,
      latePenaltyMarks: allowLateSubmission ? latePenaltyMarks : 0,
      isPublished: true,
    });
    return ok({ id: String(created._id) });
  } catch (err) {
    return handleError(err);
  }
}
