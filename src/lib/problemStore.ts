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

export type AdminProblemSummary = ProblemMeta & {
  completenessScore: number;
  isRevisionReady: boolean;
  missingParts: string[];
};

export const PUBLIC_PROBLEM_MIN_COMPLETENESS = 50;

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
    problem.content.brute.dryRun ?? "",
    problem.content.brute.visualization ? JSON.stringify(problem.content.brute.visualization) : "",
    problem.content.brute.complexityExplanationMd,
    problem.content.optimal.intuitionMd,
    problem.content.optimal.approachMd,
    problem.content.optimal.dryRun ?? "",
    problem.content.optimal.visualization ? JSON.stringify(problem.content.optimal.visualization) : "",
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

function rowToProblem(row: ProblemRow): ProblemDoc {
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

function nonEmpty(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getProblemCompleteness(problem: ProblemDoc) {
  const checks = [
    { label: "link", ok: nonEmpty(problem.link) },
    { label: "statement", ok: nonEmpty(problem.content.statementMd) },
    { label: "example", ok: nonEmpty(problem.content.exampleMd) },
    {
      label: "brute solution",
      ok:
        nonEmpty(problem.content.brute.approachMd) &&
        nonEmpty(problem.content.brute.codeJava),
    },
    {
      label: "optimal solution",
      ok:
        nonEmpty(problem.content.optimal.approachMd) &&
        nonEmpty(problem.content.optimal.codeJava),
    },
    {
      label: "quick revision",
      ok:
        (problem.content.quickRevision.brute?.length ?? 0) > 0 ||
        (problem.content.quickRevision.optimal?.length ?? 0) > 0,
    },
  ];

  const completedChecks = checks.filter((check) => check.ok).length;
  const completenessScore = Math.round((completedChecks / checks.length) * 100);
  const missingParts = checks.filter((check) => !check.ok).map((check) => check.label);

  return { completenessScore, missingParts };
}

export function toAdminProblemSummary(problem: ProblemDoc): AdminProblemSummary {
  const { completenessScore, missingParts } = getProblemCompleteness(problem);

  return {
    slug: problem.slug,
    title: problem.title,
    topic: problem.topic,
    pattern: problem.pattern,
    link: problem.link,
    updatedAt: problem.updatedAt,
    completenessScore,
    isRevisionReady: missingParts.length === 0,
    missingParts,
  };
}

function toProblemMeta(problem: ProblemDoc): ProblemMeta {
  const { completenessScore } = getProblemCompleteness(problem);
  return {
    slug: problem.slug,
    title: problem.title,
    topic: problem.topic,
    pattern: problem.pattern,
    link: problem.link,
    updatedAt: problem.updatedAt,
    isRevisionReady: completenessScore >= PUBLIC_PROBLEM_MIN_COMPLETENESS,
    completenessScore,
  };
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
      SELECT
        p.slug,
        p.title,
        p.topic,
        p.pattern,
        p.link,
        p.content_json,
        p.created_at,
        p.updated_at
      FROM problems p
      JOIN problems_fts f ON f.slug = p.slug
      WHERE problems_fts MATCH ?
      ${where.length ? `AND ${where.join(" AND ")}` : ""}
      ORDER BY p.created_at DESC
      LIMIT ?;
    `;
    const out = await db
      .prepare(sql)
      .bind(match, ...binds, capped)
      .all<ProblemRow>();
    return out.results
      .map((row) => rowToProblem(row))
      .map((problem) => toProblemMeta(problem))
      .filter((problem) => (problem.completenessScore ?? 0) >= PUBLIC_PROBLEM_MIN_COMPLETENESS);
  }

  // Fallback: no search (or empty query) => plain indexed scan.
  const sql = `
    SELECT
      p.slug,
      p.title,
      p.topic,
      p.pattern,
      p.link,
      p.content_json,
      p.created_at,
      p.updated_at
    FROM problems p
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.created_at DESC
    LIMIT ?;
  `;
  const out = await db.prepare(sql).bind(...binds, capped).all<ProblemRow>();
  return out.results
    .map((row) => rowToProblem(row))
    .map((problem) => toProblemMeta(problem))
    .filter((problem) => (problem.completenessScore ?? 0) >= PUBLIC_PROBLEM_MIN_COMPLETENESS);
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
  return rowToProblem(row);
}

export async function listAdminProblems({
  q,
  topic,
  pattern,
  limit = 200,
}: {
  q?: string;
  topic?: string;
  pattern?: string;
  limit?: number;
}): Promise<AdminProblemSummary[]> {
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
      SELECT
        p.slug,
        p.title,
        p.topic,
        p.pattern,
        p.link,
        p.content_json,
        p.created_at,
        p.updated_at
      FROM problems p
      JOIN problems_fts f ON f.slug = p.slug
      WHERE problems_fts MATCH ?
      ${where.length ? `AND ${where.join(" AND ")}` : ""}
      ORDER BY p.created_at DESC
      LIMIT ?;
    `;

    const out = await db
      .prepare(sql)
      .bind(match, ...binds, capped)
      .all<ProblemRow>();
    return out.results.map((row) => toAdminProblemSummary(rowToProblem(row)));
  }

  const sql = `
    SELECT
      p.slug,
      p.title,
      p.topic,
      p.pattern,
      p.link,
      p.content_json,
      p.created_at,
      p.updated_at
    FROM problems p
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.created_at DESC
    LIMIT ?;
  `;
  const out = await db.prepare(sql).bind(...binds, capped).all<ProblemRow>();
  return out.results.map((row) => toAdminProblemSummary(rowToProblem(row)));
}

export async function upsertProblem(problem: ProblemDoc): Promise<void> {
  const db = getD1();
  const now = new Date().toISOString();
  const contentJson = JSON.stringify(problem.content);
  const searchText = computeSearchText(problem);
  const isRevisionReady = isProblemRevisionReady(problem) ? 1 : 0;

  await db
    .prepare(
      `
      INSERT INTO problems (slug, title, topic, pattern, link, content_json, search_text, is_revision_ready, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT is_revision_ready FROM problems WHERE slug = ?), ?), COALESCE((SELECT created_at FROM problems WHERE slug = ?), ?), ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        topic = excluded.topic,
        pattern = excluded.pattern,
        link = excluded.link,
        content_json = excluded.content_json,
        search_text = excluded.search_text,
        is_revision_ready = excluded.is_revision_ready,
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
      isRevisionReady,
      problem.slug,
      now,
      now,
    )
    .run();
}

function isProblemRevisionReady(problem: ProblemDoc): boolean {
  const { content } = problem;
  if (!content) return false;
  const missingParts: string[] = [];
  if (!content.statementMd) missingParts.push("statementMd");
  if (!content.inputMd) missingParts.push("inputMd");
  if (!content.outputMd) missingParts.push("outputMd");
  if (!content.exampleMd) missingParts.push("exampleMd");
  if (!content.brute?.intuitionMd) missingParts.push("brute.intuitionMd");
  if (!content.brute?.approachMd) missingParts.push("brute.approachMd");
  if (!content.brute?.codeJava) missingParts.push("brute.codeJava");
  if (!content.brute?.time) missingParts.push("brute.time");
  if (!content.brute?.space) missingParts.push("brute.space");
  if (!content.optimal?.intuitionMd) missingParts.push("optimal.intuitionMd");
  if (!content.optimal?.approachMd) missingParts.push("optimal.approachMd");
  if (!content.optimal?.codeJava) missingParts.push("optimal.codeJava");
  if (!content.optimal?.time) missingParts.push("optimal.time");
  if (!content.optimal?.space) missingParts.push("optimal.space");
  return missingParts.length === 0;
}

export async function deleteProblem(slug: string): Promise<void> {
  const db = getD1();
  await db.prepare("DELETE FROM problems WHERE slug = ?").bind(slug).run();
}
