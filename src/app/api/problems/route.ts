import { NextResponse } from "next/server";

import { listProblems } from "@/lib/problemStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
  const pattern = searchParams.get("pattern") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "200") || 200;

  try {
    const problems = await listProblems({ q, topic, pattern, limit });
    return NextResponse.json({ problems });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

