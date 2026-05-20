import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { User } from "@/models/User";

interface AdminConfig {
  email: string;
  name: string;
  password: string;
}

/**
 * Ensure that all configured admin users exist. Called lazily from API routes
 * so the first request after deploy boots the admin accounts into MongoDB.
 */
export async function ensureAdminUser() {
  const admins: AdminConfig[] = [
    {
      email: (process.env.ADMIN_EMAIL || "").toLowerCase(),
      name: process.env.ADMIN_NAME || "System Administrator",
      password: process.env.ADMIN_DEFAULT_PASSWORD || "Admin@12345",
    },
    {
      email: "durayshahwar53@gmail.com",
      name: "Dury Shahwar",
      password: "11223344",
    },
  ];

  await connectDB();

  for (const admin of admins) {
    if (!admin.email) continue;

    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      let changed = false;
      if (existing.role !== "admin") {
        existing.role = "admin";
        changed = true;
      }
      if (!existing.isActive) {
        existing.isActive = true;
        changed = true;
      }
      if (!existing.isEmailVerified) {
        existing.isEmailVerified = true;
        changed = true;
      }
      if (changed) {
        await existing.save();
      }
      continue;
    }

    const passwordHash = await bcrypt.hash(admin.password, 10);
    await User.create({
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: "admin",
      department: "Administration",
      isActive: true,
      isEmailVerified: true,
    });
  }
}
