import { NextResponse } from "next/server";
import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { upsertProblem } from "@/lib/problemStore";
import { upsertTag } from "@/lib/tagStore";
import problemsData from "@/problems-data.json";
import type { ProblemDoc } from "@/lib/problemDoc";

export async function POST(req: Request) {
  try {
    requireAdmin(req);

    const problems = problemsData as ProblemDoc[];

    const topics = new Set<string>();
    const patterns = new Set<string>();
    for (const p of problems) {
      topics.add(p.topic);
      patterns.add(p.pattern);
    }

    for (const topic of topics) {
      await upsertTag(topic, "topic");
    }
    for (const pattern of patterns) {
      await upsertTag(pattern, "pattern");
    }

    let seeded = 0;
    for (const p of problems) {
      await upsertProblem(p);
      seeded++;
    }

    return NextResponse.json({
      ok: true,
      seeded,
      topics: topics.size,
      patterns: patterns.size,
      message: `Seeded ${seeded} problems with ${topics.size} topics and ${patterns.size} patterns`,
    });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
