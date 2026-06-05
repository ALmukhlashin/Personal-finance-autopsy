import { NextResponse } from "next/server";
import { parseMonthParam, getMonthRange } from "@/lib/date-utils";
import { generateInsights, getTransactionCount } from "@/lib/insights";
import { requireSession } from "@/lib/api";

export async function GET(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response!;

  const { searchParams } = new URL(request.url);
  const month = parseMonthParam(searchParams.get("month"));
  const { label, key } = getMonthRange(month);

  const transactionCount = await getTransactionCount(session.userId);

  if (transactionCount === 0) {
    return NextResponse.json({
      empty: true,
      transactionCount: 0,
      month: { label, key },
      insights: [],
    });
  }

  const insights = await generateInsights(session.userId, month);

  return NextResponse.json({
    empty: false,
    transactionCount,
    month: { label, key },
    insights,
  });
}
