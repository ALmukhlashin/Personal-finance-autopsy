import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/categories";
import { jsonError, requireMutation, requireSession } from "@/lib/api";
import { transactionSchema } from "@/lib/validations/transaction";
import { toNumber } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { id } = await context.params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return jsonError("Transaksi tidak ditemukan", 404);

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const { amount, transactionType, categoryId, date, notes } = parsed.data;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.userId },
    });
    if (!category) return jsonError("Kategori tidak ditemukan", 400);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        transactionType,
        categoryId,
        date: new Date(date),
        notes: notes ?? null,
      },
      include: { category: true },
    });

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        amount: toNumber(transaction.amount),
        transactionType: transaction.transactionType,
        date: transaction.date.toISOString(),
        notes: transaction.notes,
        category: {
          name: transaction.category.name,
          label: getCategoryLabel(transaction.category.name),
        },
      },
    });
  } catch {
    return jsonError("Gagal memperbarui transaksi", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { id } = await context.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return jsonError("Transaksi tidak ditemukan", 404);

  await prisma.transaction.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
