import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/layout/app-nav";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="border-b border-border p-6">
          <h1 className="text-lg font-bold text-primary">Finance Autopsy</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Ketahui ke mana uangmu benar-benar pergi.
          </p>
        </div>
        <AppNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden pb-20 md:pb-0">
        <div className="md:hidden border-b border-border bg-card p-4">
          <h1 className="text-lg font-bold text-primary">Finance Autopsy</h1>
          <p className="text-xs text-muted-foreground">
            Ketahui ke mana uangmu benar-benar pergi.
          </p>
        </div>
        <AppHeader userName={user.name} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
        </main>
        <AppNav />
      </div>
    </div>
  );
}
