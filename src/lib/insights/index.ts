import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getMonthRange, getPreviousMonth } from "@/lib/date-utils";
import { toNumber } from "@/lib/utils";
import { impulseSpending } from "./impulse-spending";
import { largestExpense } from "./largest-expense";
import { monthlyTrend } from "./monthly-trend";
import { savingsOpportunity } from "./savings-opportunity";
import { spendingAnalysis } from "./spending-analysis";
import type { Insight, TransactionWithCategory } from "./types";
import { weekendAnalysis } from "./weekend-analysis";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

async function fetchMonthTransactions(userId: string, month: Date) {
  const { start, end } = getMonthRange(month);
  return prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });
}

async function sumExpenses(userId: string, month: Date) {
  const { start, end } = getMonthRange(month);
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      transactionType: "EXPENSE",
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return toNumber(result._sum.amount ?? 0);
}

export async function generateInsights(
  userId: string,
  month: Date
): Promise<Insight[]> {
  const current = await fetchMonthTransactions(userId, month);
  const prevMonth = getPreviousMonth(month);
  const prevExpense = await sumExpenses(userId, prevMonth);
  const currentExpense = current
    .filter((t) => t.transactionType === "EXPENSE")
    .reduce((s, t) => s + toNumber(t.amount), 0);

  const tx = current as TransactionWithCategory[];

  const insights: Insight[] = [
    ...spendingAnalysis(tx).slice(0, 1),
    ...weekendAnalysis(tx),
    ...impulseSpending(tx),
    ...monthlyTrend(currentExpense, prevExpense),
    ...largestExpense(tx),
    ...savingsOpportunity(tx),
    ...spendingAnalysis(tx).slice(1),
  ];

  const seen = new Set<string>();
  const unique = insights.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });

  return unique.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}

export function getQuickInsights(insights: Insight[], limit = 3): Insight[] {
  const priority: Insight["type"][] = [
    "monthly_trend",
    "largest_expense",
    "spending_analysis",
    "weekend_analysis",
    "impulse_spending",
    "savings_opportunity",
  ];

  const picked: Insight[] = [];
  for (const type of priority) {
    const found = insights.find((i) => i.type === type);
    if (found && !picked.some((p) => p.id === found.id)) {
      picked.push(found);
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

export async function getTransactionCount(userId: string): Promise<number> {
  return prisma.transaction.count({ where: { userId } });
}

export { startOfMonth, endOfMonth };
