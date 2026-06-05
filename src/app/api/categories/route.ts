import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/categories";
import { requireSession } from "@/lib/api";

export async function GET(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const categories = await prisma.category.findMany({
    where: {
      userId: session.userId,
      ...(type === "INCOME" || type === "EXPENSE" ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      ...c,
      label: getCategoryLabel(c.name),
    })),
  });
}
