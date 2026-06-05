import { getCategoryLabel } from "@/lib/categories";
import { toNumber } from "@/lib/utils";
import type { Insight, TransactionWithCategory } from "./types";

export function largestExpense(
  transactions: TransactionWithCategory[]
): Insight[] {
  const expenses = transactions.filter((t) => t.transactionType === "EXPENSE");
  if (expenses.length === 0) return [];

  const byCategory = new Map<string, number>();
  for (const t of expenses) {
    const current = byCategory.get(t.category.name) ?? 0;
    byCategory.set(t.category.name, current + toNumber(t.amount));
  }

  const [topName] = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  const label = getCategoryLabel(topName);

  return [
    {
      id: "largest-expense",
      type: "largest_expense",
      severity: "info",
      title: "Pengeluaran Terbesar",
      message: `Kategori terbesar bulan ini adalah ${label}.`,
      metadata: { category: topName },
    },
  ];
}
