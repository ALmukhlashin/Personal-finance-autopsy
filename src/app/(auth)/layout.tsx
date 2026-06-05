export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen max-w-[100vw] flex-col items-center justify-center overflow-x-hidden bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary">
          Personal Finance Autopsy
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ketahui ke mana uangmu benar-benar pergi.
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
