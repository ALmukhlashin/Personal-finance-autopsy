import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createToken,
  hashPassword,
  seedUserCategories,
  setAuthCookie,
} from "@/lib/auth";
import { jsonError, requireMutation } from "@/lib/api";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Email sudah terdaftar", 400);
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    await seedUserCategories(user.id);

    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return jsonError(
      process.env.NODE_ENV === "development"
        ? "Database belum siap. Jalankan: npx prisma migrate dev"
        : "Terjadi kesalahan saat mendaftar",
      500
    );
  }
}
