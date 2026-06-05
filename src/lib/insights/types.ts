export type InsightType =
  | "spending_analysis"
  | "weekend_analysis"
  | "impulse_spending"
  | "monthly_trend"
  | "largest_expense"
  | "savings_opportunity";

export type InsightSeverity = "info" | "warning" | "critical";

export type Insight = {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type TransactionWithCategory = {
  id: string;
  amount: { toString(): string };
  transactionType: "INCOME" | "EXPENSE";
  date: Date;
  notes: string | null;
  category: { id: string; name: string; type: "INCOME" | "EXPENSE" };
};

export const IMPULSE_THRESHOLD = 50_000;
export const IMPULSE_WINDOW_MS = 2 * 60 * 60 * 1000;
export const IMPULSE_MIN_COUNT = 3;
