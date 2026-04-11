"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problemDoc";
import { toneForPattern, toneForTopic } from "@/lib/tags";

type ProblemWithComplete = ProblemMeta & {
  isComplete?: boolean;
};

function uniqSorted(items: string[]) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function ProblemsClient({ problems }: { problems: ProblemMeta[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string>("all");
  const [pattern, setPattern] = useState<string>("all");
  const [view, setView] = useState<"grouped" | "board" | "list">("grouped");
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [remote, setRemote] = useState<ProblemWithComplete[] | null>(null);

  const problemsWithComplete = useMemo(() => {
    return problems.map((p) => {
      const isComplete = Boolean(p.title && p.topic && p.pattern);
      return { ...p, isComplete };
    });
  }, [problems]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("problemsView");
      if (stored === "grouped" || stored === "board" || stored === "list") {
        setView(stored);
      }
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("problemsView", view);
    } catch {
      // no-op
    }
  }, [view]);

  const topics = useMemo(() => uniqSorted(problemsWithComplete.map((p) => p.topic)), [problemsWithComplete]);
  const patterns = useMemo(
    () => uniqSorted(problemsWithComplete.map((p) => p.pattern)),
    [problemsWithComplete],
  );

  const dq = useDebouncedValue(q, 250);
  const dTopic = useDebouncedValue(topic, 250);
  const dPattern = useDebouncedValue(pattern, 250);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const query = dq.trim();
      const hasFilters = query || dTopic !== "all" || dPattern !== "all";
      // If nothing is filtered, keep local list (fast and works without D1).
      if (!hasFilters) {
        setRemote(null);
        return;
      }

      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (dTopic !== "all") params.set("topic", dTopic);
      if (dPattern !== "all") params.set("pattern", dPattern);
      params.set("limit", "500");

      try {
        const res = await fetch(`/api/problems?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as
          | { problems: ProblemMeta[] }
          | { error: string };
        if (!res.ok || "error" in json) throw new Error();
        if (!cancelled) setRemote(json.problems);
      } catch {
        // D1 not configured or API unavailable; fall back to local filtering.
        if (!cancelled) setRemote(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [dq, dTopic, dPattern]);

  const baseList = remote ?? problemsWithComplete;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return baseList.filter((p) => {
      if (topic !== "all" && p.topic !== topic) return false;
      if (pattern !== "all" && p.pattern !== pattern) return false;
      if (!showIncomplete && p.isComplete === false) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.topic.toLowerCase().includes(query) ||
        p.pattern.toLowerCase().includes(query)
      );
    });
  }, [baseList, q, topic, pattern, showIncomplete]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProblemMeta[]>();
    for (const p of filtered) {
      const list = map.get(p.topic) ?? [];
      list.push(p);
      map.set(p.topic, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }, [filtered]);

  const onClear = () => {
    setQ("");
    setTopic("all");
    setPattern("all");
  };

  const onRandomProblem = () => {
    if (filtered.length === 0) return;
    const selected = filtered[Math.floor(Math.random() * filtered.length)];
    if (!selected) return;
    router.push(`/problems/${selected.slug}`);
  };

  return (
    <div className="mt-6">
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Search</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRandomProblem}
                  disabled={filtered.length === 0}
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Random Revise
                </button>
                <span className="text-xs font-normal text-muted-foreground">
                  {filtered.length} result{filtered.length === 1 ? "" : "s"}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  View:
                  <button
                    type="button"
                    onClick={() => setView("grouped")}
                    className={`rounded-md border px-2 py-1 font-medium hover:bg-muted ${view === "grouped" ? "bg-muted text-foreground" : ""}`}
                  >
                    Grouped
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("board")}
                    className={`rounded-md border px-2 py-1 font-medium hover:bg-muted ${view === "board" ? "bg-muted text-foreground" : ""}`}
                  >
                    Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`rounded-md border px-2 py-1 font-medium hover:bg-muted ${view === "list" ? "bg-muted text-foreground" : ""}`}
                  >
                    List
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={showIncomplete}
                    onChange={(e) => setShowIncomplete(e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  <span className="text-muted-foreground">Show incomplete</span>
                </label>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Query</span>
                <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, topic, pattern…"
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 min-h-[44px]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 min-h-[44px]"
              >
                <option value="all">All topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pattern</span>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 min-h-[44px]"
              >
                <option value="all">All patterns</option>
                {patterns.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {topic !== "all" ? <Badge tone={toneForTopic(topic)}>{topic}</Badge> : null}
            {pattern !== "all" ? (
              <Badge tone={toneForPattern(pattern)}>{pattern}</Badge>
            ) : null}
            {(q.trim() || topic !== "all" || pattern !== "all") ? (
              <button
                type="button"
                onClick={onClear}
                className="ml-auto text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear
              </button>
            ) : null}
          </div>
          </CardContent>
        </Card>

      {view === "grouped" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {grouped.map(([t, list]) => (
            <Card key={t}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{t}</span>
                  <Badge tone={toneForTopic(t)}>{list.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {list.map((p) => (
                    <li key={p.slug} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <NextLink
                          href={`/problems/${p.slug}`}
                          className="font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-800 dark:decoration-zinc-700 dark:hover:decoration-zinc-200"
                        >
                          {p.title}
                        </NextLink>
                        <span className="text-xs text-muted-foreground">{p.slug}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={toneForTopic(p.topic)}>{p.topic}</Badge>
                        <Badge tone={toneForPattern(p.pattern)}>{p.pattern}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : view === "board" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((p) => (
            <Card key={p.slug} className="hover:bg-muted/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">
                  <NextLink
                    href={`/problems/${p.slug}`}
                    className="underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-800 dark:decoration-zinc-700 dark:hover:decoration-zinc-200"
                  >
                    {p.title}
                  </NextLink>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={toneForTopic(p.topic)}>{p.topic}</Badge>
                  <Badge tone={toneForPattern(p.pattern)}>{p.pattern}</Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">{p.slug}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {ordered.map((p) => (
                  <li key={p.slug} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <NextLink
                        href={`/problems/${p.slug}`}
                        className="font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-800 dark:decoration-zinc-700 dark:hover:decoration-zinc-200"
                      >
                        {p.title}
                      </NextLink>
                      <span className="text-xs text-muted-foreground">{p.slug}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={toneForTopic(p.topic)}>{p.topic}</Badge>
                      <Badge tone={toneForPattern(p.pattern)}>{p.pattern}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
