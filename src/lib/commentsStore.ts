import { getD1 } from "@/lib/d1";

export type Comment = {
  id: number;
  problemSlug: string;
  body: string;
  createdAt: string;
};

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function listComments(problemSlug: string, limit = 50): Promise<Comment[]> {
  if (!isValidSlug(problemSlug)) throw new Error("Invalid problem slug");
  const db = getD1();
  const capped = Math.max(1, Math.min(limit, 200));

  const out = await db
    .prepare(
      `SELECT id, problem_slug as problemSlug, body, created_at as createdAt
       FROM comments
       WHERE problem_slug = ?
       ORDER BY id DESC
       LIMIT ?`,
    )
    .bind(problemSlug, capped)
    .all<Comment>();
  return out.results;
}

export async function addComment(problemSlug: string, body: string): Promise<void> {
  if (!isValidSlug(problemSlug)) throw new Error("Invalid problem slug");
  const text = body.trim();
  if (!text) throw new Error("Comment is empty");
  if (text.length > 2000) throw new Error("Comment too long (max 2000 chars)");

  const db = getD1();
  await db
    .prepare("INSERT INTO comments (problem_slug, body) VALUES (?, ?)")
    .bind(problemSlug, text)
    .run();
}

