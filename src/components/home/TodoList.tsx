"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const KEY = "homeTodosV1";

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.id === "string" && typeof t.text === "string")
      .map((t) => ({
        id: t.id,
        text: t.text,
        done: Boolean(t.done),
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
  } catch {
    // no-op
  }
}

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TodoList({ className }: { className?: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  const onAdd = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: id(), text: t, done: false, createdAt: Date.now() }, ...prev]);
    setText("");
  };

  const onToggle = (todoId: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
    );
  };

  const onDelete = (todoId: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const onClearDone = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onAdd();
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Today</span>
          <span className="text-xs font-normal text-muted-foreground">
            {remaining} left
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add a quick revision task…"
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="mt-4 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
            No tasks yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {todos.slice(0, 12).map((t) => (
              <li key={t.id} className="flex items-start gap-2 rounded-xl border bg-card p-3">
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
                  className={cn(
                    "mt-0.5 h-4 w-4 rounded border",
                    t.done ? "bg-foreground border-foreground" : "bg-background",
                  )}
                  aria-label={t.done ? "Mark not done" : "Mark done"}
                />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm", t.done ? "line-through text-muted-foreground" : "")}>
                    {t.text}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.some((t) => t.done) ? (
          <button
            type="button"
            onClick={onClearDone}
            className="mt-4 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear completed
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

