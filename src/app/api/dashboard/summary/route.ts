import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseMonthParam, getMonthRange } from "@/lib/date-utils";
import { calculateHealthScore } from "@/lib/health-score";
import {
  generateInsights,
  getQuickInsights,
  getTransactionCount,
} from "@/lib/insights";
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

  const [incomeAgg, expenseAgg, monthTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: session.userId,
        transactionType: TransactionType.INCOME,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: session.userId,
        transactionType: TransactionType.EXPENSE,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.userId,
        date: { gte: start, lte: end },
      },
      include: { category: true },
    }),
  ]);

  const totalIncome = toNumber(incomeAgg._sum.amount ?? 0);
  const totalExpense = toNumber(expenseAgg._sum.amount ?? 0);
  const remainingBalance = totalIncome - totalExpense;

  const expenses = monthTransactions.filter(
    (t) => t.transactionType === TransactionType.EXPENSE
  );

  const health = calculateHealthScore(totalIncome, totalExpense, expenses);

  const insights = await generateInsights(session.userId, month);
  const quickInsights = getQuickInsights(insights, 3);

  return NextResponse.json({
    empty: false,
    transactionCount,
    month: { label, key },
    summary: {
      totalIncome,
      totalExpense,
      remainingBalance,
    },
    health,
    quickInsights,
  });
}
