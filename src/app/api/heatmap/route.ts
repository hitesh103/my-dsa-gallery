import { NextResponse } from "next/server";

import { getD1 } from "@/lib/d1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const years = Number(searchParams.get("years") ?? "1");
  const cappedYears = Math.max(1, Math.min(years, 5));

  try {
    const db = getD1();

    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM problems
      WHERE created_at >= date('now', '-' || ? || ' years')
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;

    const result = await db
      .prepare(sql)
      .bind(cappedYears)
      .all<{ date: string; count: number }>();

    return NextResponse.json({ data: result.results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}