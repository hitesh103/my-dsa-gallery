import type { ProblemDoc, ProblemMeta } from "@/lib/problemDoc";
import { getD1 } from "@/lib/d1";

type ProblemRow = {
  slug: string;
  title: string;
  topic: string;
  pattern: string;
  link: string;
  content_json: string;
  created_at: string;
  updated_at: string;
};

function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function computeSearchText(problem: ProblemDoc) {
  const parts = [
    problem.slug,
    problem.title,
    problem.topic,
    problem.pattern,
    problem.content.statementMd,
    problem.content.inputMd,
    problem.content.outputMd,
    problem.content.exampleMd,
    problem.content.exampleExplanationMd,
    problem.content.brute.intuitionMd,
    problem.content.brute.approachMd,
    problem.content.brute.mermaid ?? "",
    problem.content.brute.complexityExplanationMd,
    problem.content.optimal.intuitionMd,
    problem.content.optimal.approachMd,
    problem.content.optimal.mermaid ?? "",
    problem.content.optimal.complexityExplanationMd,
    ...(problem.content.quickRevision.brute ?? []),
    ...(problem.content.quickRevision.optimal ?? []),
  ]
    .filter(Boolean)
    .join("\n");
  return parts.slice(0, 50_000);
}

function ftsQuery(q: string) {
  const terms = q
    .trim()
    .split(/\s+/g)
    .map((t) => t.replace(/["*:^~()]/g, ""))
    .filter(Boolean)
    .slice(0, 8);
  if (terms.length === 0) return null;
  return terms.map((t) => `"${t}"`).join(" AND ");
}

export async function listProblems({
  q,
  topic,
  pattern,
  limit = 200,
}: {
  q?: string;
  topic?: string;
  pattern?: string;
  limit?: number;
}): Promise<ProblemMeta[]> {
  const db = getD1();
  const capped = Math.max(1, Math.min(limit, 500));

  const where: string[] = [];
  const binds: unknown[] = [];

  if (topic && topic !== "all") {
    where.push("p.topic = ?");
    binds.push(topic);
  }
  if (pattern && pattern !== "all") {
    where.push("p.pattern = ?");
    binds.push(pattern);
  }

  const query = (q ?? "").trim();
  const match = query ? ftsQuery(query) : null;

  if (match) {
    const sql = `
      SELECT p.slug, p.title, p.topic, p.pattern, p.link, p.updated_at as updatedAt
      FROM problems p
      JOIN problems_fts f ON f.slug = p.slug
      WHERE problems_fts MATCH ?
      ${where.length ? `AND ${where.join(" AND ")}` : ""}
      ORDER BY p.updated_at DESC
      LIMIT ?;
    `;
    const out = await db
      .prepare(sql)
      .bind(match, ...binds, capped)
      .all<ProblemMeta>();
    return out.results;
  }

  // Fallback: no search (or empty query) => plain indexed scan.
  const sql = `
    SELECT p.slug, p.title, p.topic, p.pattern, p.link, p.updated_at as updatedAt
    FROM problems p
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.updated_at DESC
    LIMIT ?;
  `;
  const out = await db.prepare(sql).bind(...binds, capped).all<ProblemMeta>();
  return out.results;
}

export async function getProblem(slug: string): Promise<ProblemDoc | null> {
  const db = getD1();
  const row = await db
    .prepare(
      "SELECT slug, title, topic, pattern, link, content_json, created_at, updated_at FROM problems WHERE slug = ?",
    )
    .bind(slug)
    .first<ProblemRow>();

  if (!row) return null;

  const content = safeJsonParse<ProblemDoc["content"]>(row.content_json);
  return {
    slug: row.slug,
    title: row.title,
    topic: row.topic,
    pattern: row.pattern,
    link: row.link,
    content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertProblem(problem: ProblemDoc): Promise<void> {
  const db = getD1();
  const now = new Date().toISOString();
  const contentJson = JSON.stringify(problem.content);
  const searchText = computeSearchText(problem);

  await db
    .prepare(
      `
      INSERT INTO problems (slug, title, topic, pattern, link, content_json, search_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM problems WHERE slug = ?), ?), ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        topic = excluded.topic,
        pattern = excluded.pattern,
        link = excluded.link,
        content_json = excluded.content_json,
        search_text = excluded.search_text,
        updated_at = excluded.updated_at;
    `,
    )
    .bind(
      problem.slug,
      problem.title,
      problem.topic,
      problem.pattern,
      problem.link,
      contentJson,
      searchText,
      problem.slug,
      now,
      now,
    )
    .run();
}
