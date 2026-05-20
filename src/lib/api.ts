import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return fail(err.message, err.status);
  }
  if (err instanceof Error) {
    console.error("[api error]", err);
    return fail(err.message || "Server error", 500);
  }
  console.error("[api unknown error]", err);
  return fail("Unknown server error", 500);
}
