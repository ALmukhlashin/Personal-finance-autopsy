"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

type Category = { id: string; name: string; label: string; type: string };

export type TransactionItem = {
  id: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  date: string;
  notes: string | null;
  categoryId: string;
  category: { name: string; label: string };
};

type TransactionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: TransactionItem | null;
  onSuccess: () => void;
};

export function TransactionForm({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (editing) {
      setType(editing.transactionType);
      setCategoryId(editing.categoryId);
    } else {
      setType("EXPENSE");
      setCategoryId("");
    }
  }, [editing, open]);

  useEffect(() => {
    fetch(`/api/categories?type=${type}`)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, [type]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      amount: form.get("amount"),
      transactionType: type,
      categoryId: categoryId || form.get("categoryId"),
      date: form.get("date"),
      notes: form.get("notes") || null,
    };

    try {
      const url = editing
        ? `/api/transactions/${editing.id}`
        : "/api/transactions";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Transaksi diperbarui" : "Transaksi ditambahkan");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const defaultDate = editing
    ? format(new Date(editing.date), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Transaksi" : "Tambah Transaksi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as "INCOME" | "EXPENSE");
                setCategoryId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              required
              defaultValue={editing?.amount}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input
              id="notes"
              name="notes"
              defaultValue={editing?.notes ?? ""}
              placeholder="Opsional"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !categoryId}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
