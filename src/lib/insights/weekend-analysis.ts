import type { Insight, TransactionWithCategory } from "./types";
import { toNumber } from "@/lib/utils";

export function weekendAnalysis(
  transactions: TransactionWithCategory[]
): Insight[] {
  const expenses = transactions.filter((t) => t.transactionType === "EXPENSE");
  if (expenses.length < 5) return [];

  let weekendTotal = 0;
  const weekendDays = new Set<string>();
  let weekdayTotal = 0;
  const weekdayDays = new Set<string>();

  for (const t of expenses) {
    const day = t.date.getDay();
    const key = t.date.toISOString().slice(0, 10);
    const amount = toNumber(t.amount);
    if (day === 0 || day === 6) {
      weekendTotal += amount;
      weekendDays.add(key);
    } else {
      weekdayTotal += amount;
      weekdayDays.add(key);
    }
  }

  const weekendAvg =
    weekendDays.size > 0 ? weekendTotal / weekendDays.size : 0;
  const weekdayAvg =
    weekdayDays.size > 0 ? weekdayTotal / weekdayDays.size : 0;

  if (weekdayAvg === 0 || weekendAvg === 0) return [];

  const ratio = weekendAvg / weekdayAvg;
  if (ratio < 1.1) return [];

  const formatted = ratio.toFixed(1).replace(".0", "");

  return [
    {
      id: "weekend-analysis",
      type: "weekend_analysis",
      severity: ratio >= 2 ? "warning" : "info",
      title: "Analisis Akhir Pekan",
      message: `Pengeluaran akhir pekan ${formatted}x lebih tinggi dibanding hari kerja.`,
      metadata: { ratio, weekendAvg, weekdayAvg },
    },
  ];
}
