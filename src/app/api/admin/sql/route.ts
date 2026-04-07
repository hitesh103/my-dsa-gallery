import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { executeAdminSql, type AdminSqlMode } from "@/lib/adminSql";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const body = (await req.json()) as { sql?: string; mode?: AdminSqlMode };
    const sql = body.sql ?? "";
    const mode = body.mode === "write" ? "write" : "read";

    const result = await executeAdminSql(sql, mode);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
