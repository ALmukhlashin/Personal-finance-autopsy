import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  transactionType: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().max(500).optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
