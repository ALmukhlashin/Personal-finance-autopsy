import { NextResponse } from "next/server";
import { getSessionFromRequest, validateCsrfOrigin } from "@/lib/auth";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return { session: null, response: jsonError("Unauthorized", 401) };
  }
  return { session, response: null };
}

export async function requireMutation(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return { ok: false, response: jsonError("Invalid request origin", 403) };
  }
  return { ok: true, response: null };
}
