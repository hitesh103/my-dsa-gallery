import { getD1 } from "@/lib/d1";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export async function listTodos(limit = 50): Promise<Todo[]> {
  const db = getD1();
  const capped = Math.max(1, Math.min(limit, 200));

  const out = await db
    .prepare(
      `SELECT id, text, done, created_at as createdAt
       FROM todos
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(capped)
    .all<{ id: string; text: string; done: number; createdAt: string }>();

  return out.results.map((r) => ({
    id: r.id,
    text: r.text,
    done: Boolean(r.done),
    createdAt: r.createdAt,
  }));
}

export async function addTodo(text: string): Promise<Todo> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Todo text is empty");
  if (trimmed.length > 500) throw new Error("Todo too long (max 500 chars)");

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const db = getD1();

  const stmt = db.prepare("INSERT INTO todos (id, text, done) VALUES (?, ?, 0)");
  await stmt.bind(id, trimmed).run();

  return {
    id,
    text: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export async function toggleTodo(id: string): Promise<void> {
  const db = getD1();
  const stmt = db.prepare("UPDATE todos SET done = NOT done WHERE id = ?");
  await stmt.bind(id).run();
}

export async function deleteTodo(id: string): Promise<void> {
  const db = getD1();
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
  await stmt.bind(id).run();
}

export async function clearCompletedTodos(): Promise<void> {
  const db = getD1();
  const stmt = db.prepare("DELETE FROM todos WHERE done = 1");
  await stmt.bind().run();
}
