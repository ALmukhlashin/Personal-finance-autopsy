import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "Belum ada data",
  description = "Mulai catat transaksi pertamamu untuk mendapatkan Autopsy Report.",
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <FileSearch className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        <Button asChild className="mt-6">
          <Link href="/transactions">Catat Transaksi</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
