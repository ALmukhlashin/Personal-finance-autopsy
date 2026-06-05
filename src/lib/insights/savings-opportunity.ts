import { getCategoryLabel } from "@/lib/categories";
import { formatCurrency, toNumber } from "@/lib/utils";
import type { Insight, TransactionWithCategory } from "./types";

const REDUCTION_RATE = 0.2;

export function savingsOpportunity(
  transactions: TransactionWithCategory[]
): Insight[] {
  const expenses = transactions.filter((t) => t.transactionType === "EXPENSE");
  if (expenses.length === 0) return [];

  const byCategory = new Map<string, number>();
  for (const t of expenses) {
    const current = byCategory.get(t.category.name) ?? 0;
    byCategory.set(t.category.name, current + toNumber(t.amount));
  }

  const [topName, topAmount] = [...byCategory.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const savings = Math.round(topAmount * REDUCTION_RATE);
  if (savings < 10_000) return [];

  const label = getCategoryLabel(topName).toLowerCase();

  return [
    {
      id: "savings-opportunity",
      type: "savings_opportunity",
      severity: "info",
      title: "Peluang Hemat",
      message: `Jika pengeluaran ${label} turun 20%, kamu dapat menghemat ${formatCurrency(savings)} per bulan.`,
      metadata: { category: topName, savings, reductionRate: REDUCTION_RATE },
    },
  ];
}
