import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = (process.env.JWT_SECRET || "fallback-dev-secret-please-change") as string;
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: "student" | "teacher" | "admin";
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
