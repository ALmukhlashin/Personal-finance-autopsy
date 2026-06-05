import { formatCurrency, toNumber } from "@/lib/utils";
import type { Insight, TransactionWithCategory } from "./types";
import {
  IMPULSE_MIN_COUNT,
  IMPULSE_THRESHOLD,
  IMPULSE_WINDOW_MS,
} from "./types";

type Cluster = { count: number; total: number; start: Date };

export function impulseSpending(
  transactions: TransactionWithCategory[]
): Insight[] {
  const smallExpenses = transactions
    .filter(
      (t) =>
        t.transactionType === "EXPENSE" &&
        toNumber(t.amount) < IMPULSE_THRESHOLD
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (smallExpenses.length < IMPULSE_MIN_COUNT) return [];

  const clusters: Cluster[] = [];
  let current: Cluster | null = null;

  for (const t of smallExpenses) {
    const amount = toNumber(t.amount);
    if (
      !current ||
      t.date.getTime() - current.start.getTime() > IMPULSE_WINDOW_MS
    ) {
      if (current && current.count >= IMPULSE_MIN_COUNT) {
        clusters.push(current);
      }
      current = { count: 1, total: amount, start: t.date };
    } else {
      current.count += 1;
      current.total += amount;
    }
  }
  if (current && current.count >= IMPULSE_MIN_COUNT) {
    clusters.push(current);
  }

  if (clusters.length === 0) return [];

  const best = clusters.sort((a, b) => b.total - a.total)[0];

  return [
    {
      id: "impulse-spending",
      type: "impulse_spending",
      severity: best.total >= 300_000 ? "warning" : "info",
      title: "Pengeluaran Impulsif",
      message: `${best.count} transaksi kecil menghabiskan total ${formatCurrency(best.total)}.`,
      metadata: {
        count: best.count,
        total: best.total,
      },
    },
  ];
}
