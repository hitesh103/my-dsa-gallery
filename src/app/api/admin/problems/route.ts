import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { listAdminProblems } from "@/lib/problemStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
  const pattern = searchParams.get("pattern") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "200") || 200;

  try {
    await requireAdmin(req);
    const problems = await listAdminProblems({ q, topic, pattern, limit });
    return NextResponse.json({ problems });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
