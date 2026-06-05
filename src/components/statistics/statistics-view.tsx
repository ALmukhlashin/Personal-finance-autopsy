"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = [
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#99f6e4",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

type StatsData = {
  empty: boolean;
  month: { label: string };
  expenseByCategory: {
    name: string;
    label: string;
    value: number;
    percentage: number;
  }[];
  monthlyTrend: { label: string; expense: number }[];
  incomeVsExpense: { label: string; income: number; expense: number }[];
  topCategories: {
    name: string;
    label: string;
    value: number;
    percentage: number;
  }[];
};

export function StatisticsView() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Memuat statistik...</div>;
  }

  if (!data || data.empty) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-sm text-muted-foreground">
            Visualisasi pola keuanganmu
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const pieData = data.expenseByCategory.map((c) => ({
    name: c.label,
    value: c.value,
  }));

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-sm text-muted-foreground">{data.month.label}</p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribusi pengeluaran bulan ini
            </p>
          </CardHeader>
          <CardContent className="h-72 w-full max-w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label={false}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Tren Pengeluaran Bulanan</CardTitle>
            <p className="text-xs text-muted-foreground">
              6 bulan terakhir
            </p>
          </CardHeader>
          <CardContent className="h-72 w-full max-w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `${(v / 1000000).toFixed(0)}jt`
                  }
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pemasukan vs Pengeluaran</CardTitle>
            <p className="text-xs text-muted-foreground">
              Perbandingan 6 bulan terakhir
            </p>
          </CardHeader>
          <CardContent className="h-80 w-full max-w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `${(v / 1000000).toFixed(0)}jt`
                  }
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Kategori Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.topCategories.map((cat, i) => (
              <li
                key={cat.name}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.percentage}% dari total pengeluaran
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold sm:text-base">
                  {formatCurrency(cat.value)}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
