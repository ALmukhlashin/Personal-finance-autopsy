"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  HeartPulse,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Insight } from "@/lib/insights/types";

type DashboardData = {
  empty: boolean;
  transactionCount: number;
  month: { label: string; key: string };
  summary?: {
    totalIncome: number;
    totalExpense: number;
    remainingBalance: number;
  };
  health?: {
    score: number;
    status: string;
  };
  quickInsights?: Insight[];
};

function healthBadgeVariant(
  status: string
): "success" | "warning" | "destructive" | "secondary" {
  if (status === "Excellent" || status === "Good") return "success";
  if (status === "Needs Improvement") return "warning";
  return "destructive";
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 p-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.empty) {
    return <EmptyState />;
  }

  const { summary, health, quickInsights } = data;

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">{data.month.label}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary!.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary!.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sisa Saldo
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary!.remainingBalance)}
            </p>
            <p className="text-xs text-muted-foreground">Bulan berjalan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial Health
            </CardTitle>
            <HeartPulse className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{health!.score}</p>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <Badge
              variant={healthBadgeVariant(health!.status)}
              className="mt-2"
            >
              {health!.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Quick Insights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {quickInsights?.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-primary">
                  {insight.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
