import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function POST() {
  const store = await cookies();
  store.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return ok({ loggedOut: true });
}
