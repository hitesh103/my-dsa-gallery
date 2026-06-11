import { getD1 } from "@/lib/d1";
import type { ContentItemDoc, ContentItemMeta } from "./contentDoc";

type ContentItemRow = {
  slug: string;
  type: string;
  title: string;
  summary: string | null;
  status: string;
  visibility: string;
  source: string | null;
  source_url: string | null;
  difficulty: string | null;
  topic: string | null;
  pattern: string | null;
  tags_json: string;
  content_json: string;
  revision_json: string;
  mistakes_json: string;
  visuals_json: string;
  search_text: string;
  created_at: string;
  updated_at: string;
};

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToDoc(row: ContentItemRow): ContentItemDoc {
  return {
    slug: row.slug,
    type: row.type as any,
    title: row.title,
    summary: row.summary ?? undefined,
    status: row.status as any,
    visibility: row.visibility as any,
    source: row.source ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    difficulty: row.difficulty as any,
    topic: row.topic ?? undefined,
    pattern: row.pattern ?? undefined,
    tags: safeJsonParse(row.tags_json, []),
    content: safeJsonParse(row.content_json, { format: "sections", sections: [] }),
    revisionJson: safeJsonParse(row.revision_json, []),
    mistakesJson: safeJsonParse(row.mistakes_json, []),
    visualsJson: safeJsonParse(row.visuals_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function computeContentSearchText(doc: ContentItemDoc): string {
  const parts = [
    doc.slug,
    doc.title,
    doc.summary ?? "",
    doc.topic ?? "",
    doc.pattern ?? "",
    ...(doc.tags ?? []),
    ...doc.content.sections.flatMap(s => [
      s.title ?? "",
      s.bodyMd ?? "",
      ...(s.codeBlocks?.map(cb => cb.code) ?? [])
    ])
  ];
  return parts.filter(Boolean).join("\n").slice(0, 50_000);
}

export async function listContentItems({
  type,
  status = "published",
  limit = 100
}: {
  type?: string;
  status?: string;
  limit?: number;
}): Promise<ContentItemMeta[]> {
  const db = getD1();
  const where: string[] = [];
  const binds: any[] = [];

  if (type) {
    where.push("type = ?");
    binds.push(type);
  }
  if (status) {
    where.push("status = ?");
    binds.push(status);
  }
  where.push("visibility = 'public'");

  const sql = `
    SELECT slug, type, title, summary, status, visibility, topic, difficulty, updated_at
    FROM content_items
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY updated_at DESC
    LIMIT ?
  `;
  
  const out = await db.prepare(sql).bind(...binds, limit).all<ContentItemRow>();
  return out.results.map(row => ({
    slug: row.slug,
    type: row.type,
    title: row.title,
    summary: row.summary ?? undefined,
    status: row.status,
    visibility: row.visibility,
    topic: row.topic ?? undefined,
    difficulty: row.difficulty ?? undefined,
    updatedAt: row.updated_at
  }));
}

export async function getContentItem(slug: string): Promise<ContentItemDoc | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT * FROM content_items WHERE slug = ?")
    .bind(slug)
    .first<ContentItemRow>();
  
  if (!row) return null;
  return rowToDoc(row);
}

export async function upsertContentItem(doc: ContentItemDoc): Promise<void> {
  const db = getD1();
  const now = new Date().toISOString();
  const searchText = computeContentSearchText(doc);

  await db.prepare(`
    INSERT INTO content_items (
      slug, type, title, summary, status, visibility,
      source, source_url, difficulty, topic, pattern,
      tags_json, content_json, revision_json, mistakes_json, visuals_json,
      search_text, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      type = excluded.type,
      title = excluded.title,
      summary = excluded.summary,
      status = excluded.status,
      visibility = excluded.visibility,
      source = excluded.source,
      source_url = excluded.source_url,
      difficulty = excluded.difficulty,
      topic = excluded.topic,
      pattern = excluded.pattern,
      tags_json = excluded.tags_json,
      content_json = excluded.content_json,
      revision_json = excluded.revision_json,
      mistakes_json = excluded.mistakes_json,
      visuals_json = excluded.visuals_json,
      search_text = excluded.search_text,
      updated_at = excluded.updated_at
  `).bind(
    doc.slug, doc.type, doc.title, doc.summary ?? null, doc.status, doc.visibility,
    doc.source ?? null, doc.sourceUrl ?? null, doc.difficulty ?? null, doc.topic ?? null, doc.pattern ?? null,
    JSON.stringify(doc.tags), JSON.stringify(doc.content), JSON.stringify(doc.revisionJson), 
    JSON.stringify(doc.mistakesJson), JSON.stringify(doc.visualsJson),
    searchText, doc.createdAt ?? now, now
  ).run();
}
