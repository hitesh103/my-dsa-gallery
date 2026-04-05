import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { getD1 } from "@/lib/d1";
import { SEED_PROBLEMS } from "@/lib/seedProblems";
import { upsertProblem } from "@/lib/problemStore";

export async function POST(req: Request) {
  try {
    requireAdmin(req);

    const db = getD1();
    const row = await db.prepare("SELECT COUNT(*) as c FROM problems").bind().first<{ c: number }>();
    const count = row?.c ?? 0;
    if (count > 0) {
      return NextResponse.json({ ok: true, message: "Already seeded", count });
    }

    for (const p of SEED_PROBLEMS) {
      await upsertProblem(p);
    }

    return NextResponse.json({ ok: true, seeded: SEED_PROBLEMS.length });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}

