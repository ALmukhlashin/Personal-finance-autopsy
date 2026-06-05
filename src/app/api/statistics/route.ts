import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/categories";
import { parseMonthParam, getMonthRange } from "@/lib/date-utils";
import { getTransactionCount } from "@/lib/insights";
import { requireSession } from "@/lib/api";
import { toNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { searchParams } = new URL(request.url);
  const month = parseMonthParam(searchParams.get("month"));
  const { start, end, label, key } = getMonthRange(month);

  const transactionCount = await getTransactionCount(session.userId);

  if (transactionCount === 0) {
    return NextResponse.json({
      empty: true,
      transactionCount: 0,
      month: { label, key },
    });
  }

  const monthExpenses = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      transactionType: TransactionType.EXPENSE,
      date: { gte: start, lte: end },
    },
    include: { category: true },
  });

  const categoryTotals = new Map<string, number>();
  for (const t of monthExpenses) {
    const name = t.category.name;
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + toNumber(t.amount));
  }

  const totalExpense = [...categoryTotals.values()].reduce((a, b) => a + b, 0);

  const expenseByCategory = [...categoryTotals.entries()]
    .map(([name, value]) => ({
      name,
      label: getCategoryLabel(name),
      value,
      percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const topCategories = expenseByCategory.slice(0, 5);

  const monthsBack = 6;
  const monthlyTrend: { month: string; label: string; expense: number }[] = [];
  const incomeVsExpense: {
    month: string;
    label: string;
    income: number;
    expense: number;
  }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const ref = subMonths(month, i);
    const mStart = startOfMonth(ref);
    const mEnd = endOfMonth(ref);
    const mKey = format(ref, "yyyy-MM");
    const mLabel = format(ref, "MMM yyyy");

    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: session.userId,
          transactionType: TransactionType.INCOME,
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.userId,
          transactionType: TransactionType.EXPENSE,
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const expense = toNumber(exp._sum.amount ?? 0);
    const income = toNumber(inc._sum.amount ?? 0);

    monthlyTrend.push({ month: mKey, label: mLabel, expense });
    incomeVsExpense.push({ month: mKey, label: mLabel, income, expense });
  }

  return NextResponse.json({
    empty: false,
    transactionCount,
    month: { label, key },
    expenseByCategory,
    monthlyTrend,
    incomeVsExpense,
    topCategories,
  });
}
