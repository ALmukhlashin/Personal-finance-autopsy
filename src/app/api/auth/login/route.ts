import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { jsonError, requireMutation } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("Email atau password salah", 401);
    }

    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return jsonError(
      process.env.NODE_ENV === "development"
        ? "Database belum siap. Jalankan: npx prisma migrate dev"
        : "Terjadi kesalahan saat masuk",
      500
    );
  }
}
