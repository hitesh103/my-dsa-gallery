import { NextResponse } from "next/server";
import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { upsertProblem } from "@/lib/problemStore";
import { upsertTag } from "@/lib/tagStore";
import type { ProblemDoc, ProblemContent } from "@/lib/problemDoc";
import fs from "fs";
import path from "path";

function emptyContent(): ProblemContent {
  return {
    statementMd: "",
    inputMd: "",
    outputMd: "",
    exampleMd: "",
    exampleExplanationMd: "",
    brute: {
      intuitionMd: "",
      approachMd: "",
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    optimal: {
      intuitionMd: "",
      approachMd: "",
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    quickRevision: { brute: [], optimal: [] },
  };
}

function convertCode(code: string): string {
  // Convert C++ code to Java-like pseudocode
  // Keep it as is for now, but we could do some conversion
  return code;
}

export async function POST(req: Request) {
  try {
    requireAdmin(req);

    const dataPath = path.join(process.cwd(), "problems-data.json");
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: "problems-data.json not found" }, { status: 404 });
    }

    const problemsData = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as Array<{
      slug: string;
      title: string;
      topic: string;
      pattern: string;
      statement: string;
      approach: string;
      code: string;
      time: string;
      space: string;
    }>;

    // First, upsert all tags
    const topics = new Set<string>();
    const patterns = new Set<string>();
    for (const p of problemsData) {
      topics.add(p.topic);
      patterns.add(p.pattern);
    }

    for (const topic of topics) {
      await upsertTag(topic, "topic");
    }
    for (const pattern of patterns) {
      await upsertTag(pattern, "pattern");
    }

    // Now upsert all problems
    let seeded = 0;
    for (const p of problemsData) {
      const content = emptyContent();
      content.statementMd = p.statement || "";
      content.brute.approachMd = p.approach || "";
      content.brute.codeJava = convertCode(p.code) || "";
      content.brute.time = p.time || "";
      content.brute.space = p.space || "";

      const problem: ProblemDoc = {
        slug: p.slug,
        title: p.title,
        topic: p.topic,
        pattern: p.pattern,
        link: "",
        content,
      };

      await upsertProblem(problem);
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
