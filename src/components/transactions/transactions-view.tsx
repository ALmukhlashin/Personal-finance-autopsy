"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TransactionForm,
  type TransactionItem,
} from "@/components/transactions/transaction-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function TransactionsView() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);

    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus");
      return;
    }
    toast.success("Transaksi dihapus");
    load();
  }

  function renderMobileList() {
    if (loading) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>
      );
    }
    if (transactions.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada transaksi
        </p>
      );
    }
    return (
      <ul className="divide-y divide-border">
        {transactions.map((t) => (
          <li key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.category.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(t.date)}
                </p>
                {t.notes ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {t.notes}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{formatCurrency(t.amount)}</p>
                <Badge
                  variant={
                    t.transactionType === "INCOME" ? "success" : "secondary"
                  }
                  className="mt-1"
                >
                  {t.transactionType === "INCOME" ? "Masuk" : "Keluar"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(t);
                  setFormOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Catat dan kelola transaksimu
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Cari catatan atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:flex-1"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="INCOME">Pemasukan</SelectItem>
              <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="md:hidden">
        <CardContent className="p-0">{renderMobileList()}</CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium">Jumlah</th>
                  <th className="px-4 py-3 text-left font-medium">Tipe</th>
                  <th className="px-4 py-3 text-left font-medium">Catatan</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Memuat...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border">
                      <td className="px-4 py-3">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">{t.category.label}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.transactionType === "INCOME"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {t.transactionType === "INCOME"
                            ? "Pemasukan"
                            : "Pengeluaran"}
                        </Badge>
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-3 text-muted-foreground">
                        {t.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(t);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSuccess={load}
      />
    </div>
  );
}
