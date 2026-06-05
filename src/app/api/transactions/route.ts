import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/categories";
import { jsonError, requireMutation, requireSession } from "@/lib/api";
import { transactionSchema } from "@/lib/validations/transaction";
import { toNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      ...(type === "INCOME" || type === "EXPENSE"
        ? { transactionType: type }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { notes: { contains: search, mode: "insensitive" } },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: toNumber(t.amount),
      transactionType: t.transactionType,
      date: t.date.toISOString(),
      notes: t.notes,
      categoryId: t.categoryId,
      category: {
        id: t.category.id,
        name: t.category.name,
        label: getCategoryLabel(t.category.name),
      },
    })),
  });
}

export async function POST(request: Request) {
  const csrf = await requireMutation(request);
  if (!csrf.ok) return csrf.response!;

  const { session, response } = await requireSession(request);
  if (!session) return response!;

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const { amount, transactionType, categoryId, date, notes } = parsed.data;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.userId },
    });
    if (!category) {
      return jsonError("Kategori tidak ditemukan", 400);
    }
    if (category.type !== transactionType) {
      return jsonError("Kategori tidak sesuai dengan tipe transaksi", 400);
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        categoryId,
        amount,
        transactionType,
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
        categoryId: transaction.categoryId,
        category: {
          id: transaction.category.id,
          name: transaction.category.name,
          label: getCategoryLabel(transaction.category.name),
        },
      },
    });
  } catch {
    return jsonError("Gagal menyimpan transaksi", 500);
  }
}
