import { getCategoryLabel } from "@/lib/categories";
import { toNumber } from "@/lib/utils";
import type { Insight, TransactionWithCategory } from "./types";

export function spendingAnalysis(
  transactions: TransactionWithCategory[]
): Insight[] {
  const expenses = transactions.filter((t) => t.transactionType === "EXPENSE");
  const total = expenses.reduce((sum, t) => sum + toNumber(t.amount), 0);
  if (total === 0) return [];

  const byCategory = new Map<string, number>();
  for (const t of expenses) {
    const current = byCategory.get(t.category.name) ?? 0;
    byCategory.set(t.category.name, current + toNumber(t.amount));
  }

  const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 3);

  return top.map(([name, amount], index) => {
    const pct = Math.round((amount / total) * 100);
    const label = getCategoryLabel(name);
    return {
      id: `spending-${name}`,
      type: "spending_analysis" as const,
      severity: pct >= 40 ? "warning" : index === 0 ? "info" : "info",
      title: "Analisis Pengeluaran",
      message: `Kamu menghabiskan ${pct}% uangmu untuk ${label.toLowerCase()} bulan ini.`,
      metadata: { category: name, percentage: pct, amount },
    };
  });
}
