import { NextResponse } from "next/server";

import { getD1 } from "@/lib/d1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const requestedYear = Number(searchParams.get("year") ?? `${currentYear}`);
  const year = Number.isFinite(requestedYear) ? requestedYear : currentYear;
  const cappedYear = Math.max(currentYear - 4, Math.min(year, currentYear));

  try {
    const db = getD1();

    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM problems
      WHERE DATE(created_at) >= DATE(?)
        AND DATE(created_at) <= DATE(?)
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;

    const startDate = `${cappedYear}-01-01`;
    const endDate = `${cappedYear}-12-31`;

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
