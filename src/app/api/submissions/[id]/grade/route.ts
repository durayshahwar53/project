import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Submission } from "@/models/Submission";
import { Assignment } from "@/models/Assignment";
import { requireRole } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["teacher", "admin"]);
    const { id } = await ctx.params;
    const body = await req.json();
    const grade = Number(body.grade);
    const feedback = String(body.feedback || "").trim();
    if (Number.isNaN(grade) || grade < 0) return fail("Invalid grade", 400);

    await connectDB();
    const s = await Submission.findById(id);
    if (!s) return fail("Submission not found", 404);

    // Marks are final once set — no re-grading allowed.
    if (s.status === "graded") {
      return fail(
        "This submission has already been graded. Marks are final and cannot be changed.",
        409
      );
    }

    const a = await Assignment.findById(s.assignment);
    if (!a) return fail("Assignment not found", 404);
    if (user.role !== "admin" && String(a.teacher) !== String(user._id))
      return fail("Forbidden", 403);
    if (grade > a.totalMarks)
      return fail(`Grade cannot exceed ${a.totalMarks}`, 400);

    // Apply the late penalty configured on the assignment.
    const penalty =
      s.isLate && a.latePenaltyMarks > 0 ? a.latePenaltyMarks : 0;
    const finalGrade = Math.max(0, grade - penalty);

    s.gradeRaw = grade;
    s.latePenaltyApplied = penalty;
    s.grade = finalGrade;
    s.feedback = feedback || undefined;
    s.gradedAt = new Date();
    s.gradedBy = user._id;
    s.status = "graded";
    await s.save();
    return ok({
      graded: true,
      gradeRaw: grade,
      latePenaltyApplied: penalty,
      grade: finalGrade,
    });
  } catch (err) {
    return handleError(err);
  }
}
