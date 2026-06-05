import { toNumber } from "@/lib/utils";
import {
  IMPULSE_MIN_COUNT,
  IMPULSE_THRESHOLD,
  IMPULSE_WINDOW_MS,
} from "@/lib/insights/types";
import type { TransactionWithCategory } from "@/lib/insights/types";

export type HealthStatus =
  | "Excellent"
  | "Good"
  | "Needs Improvement"
  | "Critical";

export type HealthScoreResult = {
  score: number;
  status: HealthStatus;
  breakdown: {
    savingsRatio: number;
    consistency: number;
    impulseControl: number;
  };
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function savingsComponent(income: number, expense: number): number {
  if (income <= 0) return expense === 0 ? 50 : 0;
  const ratio = (income - expense) / income;
  if (ratio >= 0.3) return 100;
  if (ratio >= 0.1) return 75;
  if (ratio >= 0) return 50;
  if (ratio >= -0.1) return 25;
  return 0;
}

function consistencyComponent(expenses: TransactionWithCategory[]): number {
  const daily = new Map<string, number>();
  for (const t of expenses) {
    const key = t.date.toISOString().slice(0, 10);
    daily.set(key, (daily.get(key) ?? 0) + toNumber(t.amount));
  }
  const values = [...daily.values()];
  if (values.length < 3) return 70;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 100;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const cv = Math.sqrt(variance) / mean;
  if (cv <= 0.3) return 100;
  if (cv <= 0.6) return 75;
  if (cv <= 1) return 50;
  return 25;
}

function impulseComponent(expenses: TransactionWithCategory[]): number {
  const total = expenses.reduce((s, t) => s + toNumber(t.amount), 0);
  if (total === 0) return 100;

  const small = expenses
    .filter((t) => toNumber(t.amount) < IMPULSE_THRESHOLD)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let impulseTotal = 0;
  let i = 0;
  while (i < small.length) {
    let j = i + 1;
    let clusterTotal = toNumber(small[i].amount);
    let clusterCount = 1;
    while (
      j < small.length &&
      small[j].date.getTime() - small[i].date.getTime() <= IMPULSE_WINDOW_MS
    ) {
      clusterTotal += toNumber(small[j].amount);
      clusterCount++;
      j++;
    }
    if (clusterCount >= IMPULSE_MIN_COUNT) {
      impulseTotal += clusterTotal;
    }
    i = j > i + 1 ? j : i + 1;
  }

  const ratio = impulseTotal / total;
  if (ratio <= 0.1) return 100;
  if (ratio <= 0.2) return 75;
  if (ratio <= 0.35) return 50;
  return 25;
}

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Improvement";
  return "Critical";
}

export function calculateHealthScore(
  income: number,
  expense: number,
  monthExpenses: TransactionWithCategory[]
): HealthScoreResult {
  const savingsRatio = savingsComponent(income, expense);
  const consistency = consistencyComponent(monthExpenses);
  const impulseControl = impulseComponent(monthExpenses);

  const score = Math.round(
    savingsRatio * 0.4 + consistency * 0.3 + impulseControl * 0.3
  );

  return {
    score: clamp(score),
    status: getHealthStatus(clamp(score)),
    breakdown: { savingsRatio, consistency, impulseControl },
  };
}
