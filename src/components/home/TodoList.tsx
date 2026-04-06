"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export function TodoList({ className }: { className?: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTodos(json.todos || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load todos");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos().finally(() => setIsLoading(false));
  }, [fetchTodos]);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  const onAdd = async () => {
    const t = text.trim();
    if (!t) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", text: t }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTodos((prev) => [json.todo, ...prev]);
      setText("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add todo");
    }
  };

  const onToggle = async (todoId: string) => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: todoId }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t))
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle todo");
    }
  };

  const onDelete = async (todoId: string) => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: todoId }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete todo");
    }
  };

  const onClearDone = async () => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearCompleted" }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTodos((prev) => prev.filter((t) => !t.done));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear todos");
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") void onAdd();
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-semibold">Quick Tasks</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {remaining} remaining
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add a quick revision task…"
            className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 min-h-[44px]"
          />
          <button
            type="button"
            onClick={() => void onAdd()}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 min-h-[44px]"
          >
            Add
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading…</div>
        ) : todos.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No tasks yet. Add one above!
          </div>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {todos.slice(0, 10).map((t) => (
              <li
                key={t.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-all",
                  t.done ? "bg-muted/50 opacity-60" : "bg-card hover:bg-muted/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => void onToggle(t.id)}
                  className={cn(
                    "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    t.done
                      ? "bg-green-500 border-green-500"
                      : "border-muted-foreground hover:border-green-500"
                  )}
                  aria-label={t.done ? "Mark not done" : "Mark done"}
                >
                  {t.done && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    t.done ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => void onDelete(t.id)}
                  className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3,6 h18" />
                    <path d="M19,6 v14c0,1 -1,2 -2,2 H7c-1,0 -2,-1 -2,-2 V6" />
                    <path d="M8,6 V4c0,-1 1,-2 2,-2h4c1,0 2,1 2,2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.some((t) => t.done) && (
          <button
            type="button"
            onClick={() => void onClearDone()}
            className="w-full rounded-lg border border-dashed p-2 text-xs font-medium text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
          >
            Clear completed ({todos.filter((t) => t.done).length})
          </button>
        )}
      </CardContent>
    </Card>
  );
}
