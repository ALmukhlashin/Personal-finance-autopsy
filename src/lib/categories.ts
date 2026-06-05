export const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Other",
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Education",
  "Bills",
  "Health",
  "Other",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  Salary: "Gaji",
  Freelance: "Freelance",
  Business: "Bisnis",
  Food: "Makanan",
  Transportation: "Transportasi",
  Shopping: "Belanja",
  Entertainment: "Hiburan",
  Education: "Pendidikan",
  Bills: "Tagihan",
  Health: "Kesehatan",
  Other: "Lainnya",
};

export function getCategoryLabel(name: string): string {
  return CATEGORY_LABELS[name] ?? name;
}
