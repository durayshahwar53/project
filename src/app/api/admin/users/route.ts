import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await connectDB();
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const search = url.searchParams.get("q") || "";

    const filter: Record<string, unknown> = {};
    if (role && ["student", "teacher", "admin"].includes(role)) filter.role = role;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];

    const users = await User.find(filter)
      .select("-passwordHash -resetTokenHash -resetTokenExpires")
      .sort({ createdAt: -1 })
      .lean();
    return ok(users.map((u) => ({ ...u, _id: String(u._id) })));
  } catch (err) {
    return handleError(err);
  }
}
