import { getD1 } from "@/lib/d1";

export type Tag = {
  id: number;
  name: string;
  type: "topic" | "pattern";
  createdAt: string;
};

export async function listTags(type?: "topic" | "pattern"): Promise<Tag[]> {
  const db = getD1();
  const sql = type
    ? "SELECT id, name, type, created_at as createdAt FROM tags WHERE type = ? ORDER BY name"
    : "SELECT id, name, type, created_at as createdAt FROM tags ORDER BY type, name";
  const stmt = type ? db.prepare(sql).bind(type) : db.prepare(sql);
  const out = type
    ? await (db.prepare(sql).bind(type) as unknown as { all: <T>() => Promise<{ results: T[] }> }).all<Tag>()
    : await (db.prepare(sql) as unknown as { all: <T>() => Promise<{ results: T[] }> }).all<Tag>();
  return out.results;
}

export async function getTag(name: string, type: "topic" | "pattern"): Promise<Tag | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT id, name, type, created_at as createdAt FROM tags WHERE name = ? AND type = ?")
    .bind(name, type)
    .first<Tag>();
  return row ?? null;
}

export async function createTag(name: string, type: "topic" | "pattern"): Promise<Tag> {
  const db = getD1();
  const stmt = db.prepare("INSERT INTO tags (name, type) VALUES (?, ?) RETURNING id, name, type, created_at as createdAt");
  const result = await stmt.bind(name, type).first<Tag>();
  if (!result) throw new Error("Failed to create tag");
  return result;
}

export async function upsertTag(name: string, type: "topic" | "pattern"): Promise<Tag> {
  const existing = await getTag(name, type);
  if (existing) return existing;
  return createTag(name, type);
}

export async function deleteTag(id: number): Promise<void> {
  const db = getD1();
  await db.prepare("DELETE FROM tags WHERE id = ?").bind(id).run();
}
