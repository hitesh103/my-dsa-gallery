import { NextResponse } from "next/server";

import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const requestedYear = Number(searchParams.get("year") ?? `${currentYear}`);
  const year = Number.isFinite(requestedYear) ? requestedYear : currentYear;
  const cappedYear = Math.max(currentYear - 4, Math.min(year, currentYear));
  const requestedStart = searchParams.get("start");
  const requestedEnd = searchParams.get("end");

  try {
    const db = getD1();

    const sql = `
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as count
      FROM problems
      WHERE DATE(updated_at) >= DATE(?)
        AND DATE(updated_at) <= DATE(?)
      GROUP BY DATE(updated_at)
      ORDER BY date ASC;
    `;

    const startDate = requestedStart ?? `${cappedYear}-01-01`;
    const endDate = requestedEnd ?? `${cappedYear}-12-31`;

    const result = await db
      .prepare(sql)
      .bind(startDate, endDate)
      .all<{ date: string; count: number }>();

    return NextResponse.json({ data: result.results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
