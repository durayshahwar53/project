import { cookies } from "next/headers";
import { connectDB } from "./db";
import { verifyToken, JWTPayload } from "./jwt";
import { User, IUser } from "@/models/User";
import { AUTH_COOKIE } from "./session-cookie";

export { AUTH_COOKIE };

export async function getSessionPayload(): Promise<JWTPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<IUser | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  await connectDB();
  const user = await User.findById(payload.sub).lean<IUser>();
  if (!user || !user.isActive) return null;
  return user;
}

export async function requireRole(
  roles: Array<"student" | "teacher" | "admin">
): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED", 401);
  if (!user.isEmailVerified) throw new AuthError("EMAIL_UNVERIFIED", 403);
  if (!roles.includes(user.role)) throw new AuthError("FORBIDDEN", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
