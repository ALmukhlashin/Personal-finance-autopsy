import type { Insight } from "./types";

export function monthlyTrend(
  currentExpense: number,
  previousExpense: number
): Insight[] {
  if (previousExpense === 0 && currentExpense === 0) return [];
  if (previousExpense === 0) {
    return [
      {
        id: "monthly-trend",
        type: "monthly_trend",
        severity: "info",
        title: "Tren Bulanan",
        message:
          "Ini bulan pertamamu mencatat pengeluaran — terus catat untuk melihat tren.",
        metadata: { currentExpense, previousExpense },
      },
    ];
  }

  const change =
    ((currentExpense - previousExpense) / previousExpense) * 100;
  const absChange = Math.abs(Math.round(change));

  if (absChange < 5) {
    return [
      {
        id: "monthly-trend",
        type: "monthly_trend",
        severity: "info",
        title: "Tren Bulanan",
        message: "Pengeluaranmu stabil dibanding bulan lalu.",
        metadata: { change },
      },
    ];
  }

  const direction = change > 0 ? "naik" : "turun";

  return [
    {
      id: "monthly-trend",
      type: "monthly_trend",
      severity: change > 15 ? "warning" : "info",
      title: "Tren Bulanan",
      message: `Pengeluaran ${direction} ${absChange}% dibanding bulan lalu.`,
      metadata: { change, currentExpense, previousExpense },
    },
  ];
}
