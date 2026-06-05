"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insight } from "@/lib/insights/types";

const iconMap: Record<string, React.ElementType> = {
  spending_analysis: TrendingUp,
  weekend_analysis: Calendar,
  impulse_spending: Zap,
  monthly_trend: TrendingUp,
  largest_expense: AlertTriangle,
  savings_opportunity: Lightbulb,
};

function severityVariant(
  severity: string
): "warning" | "destructive" | "secondary" {
  if (severity === "critical") return "destructive";
  if (severity === "warning") return "warning";
  return "secondary";
}

export function AutopsyView() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/autopsy/report")
      .then((r) => r.json())
      .then((d) => {
        setEmpty(d.empty);
        setMonthLabel(d.month?.label ?? "");
        setInsights(d.insights ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-28 p-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Autopsy Report</h2>
          <p className="text-sm text-muted-foreground">
            Analisis otomatis pola pengeluaranmu
          </p>
        </div>
        <EmptyState
          title="Autopsy belum tersedia"
          description="Mulai catat transaksi pertamamu untuk mendapatkan Autopsy Report."
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Autopsy Report</h2>
        <p className="text-sm text-muted-foreground">
          Analisis {monthLabel} — temukan ke mana uangmu benar-benar pergi
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => {
          const Icon = iconMap[insight.type] ?? Lightbulb;
          return (
            <Card key={insight.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <Badge variant={severityVariant(insight.severity)}>
                      {insight.severity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">
                  {insight.message}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
