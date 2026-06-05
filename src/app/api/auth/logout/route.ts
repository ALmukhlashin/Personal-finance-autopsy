import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { requireMutation } from "@/lib/api";

export async function POST(request: Request) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
