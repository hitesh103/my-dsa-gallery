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

function formatUpdatedAt(value?: string) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function readinessTone(score?: number) {
  if ((score ?? 0) >= 80) return "emerald" as const;
  return "blue" as const;
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
    return problems.map((problem) => ({
      ...problem,
      isComplete: Boolean(problem.title && problem.topic && problem.pattern),
    }));
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

  const topics = useMemo(() => uniqSorted(problemsWithComplete.map((problem) => problem.topic)), [problemsWithComplete]);
  const patterns = useMemo(
    () => uniqSorted(problemsWithComplete.map((problem) => problem.pattern)),
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
        const json = (await res.json()) as { problems: ProblemMeta[] } | { error: string };
        if (!res.ok || "error" in json) throw new Error();
        if (!cancelled) setRemote(json.problems);
      } catch {
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
    return baseList.filter((problem) => {
      if (topic !== "all" && problem.topic !== topic) return false;
      if (pattern !== "all" && problem.pattern !== pattern) return false;
      if (!showIncomplete && problem.isComplete === false) return false;
      if (!query) return true;
      return (
        problem.title.toLowerCase().includes(query) ||
        problem.slug.toLowerCase().includes(query) ||
        problem.topic.toLowerCase().includes(query) ||
        problem.pattern.toLowerCase().includes(query)
      );
    });
  }, [baseList, q, topic, pattern, showIncomplete]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProblemMeta[]>();
    for (const problem of filtered) {
      const list = map.get(problem.topic) ?? [];
      list.push(problem);
      map.set(problem.topic, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }, [filtered]);

  const stats = useMemo(() => {
    const strongCoverage = filtered.filter((problem) => (problem.completenessScore ?? 0) >= 80).length;
    const topicCount = new Set(filtered.map((problem) => problem.topic)).size;
    const patternCount = new Set(filtered.map((problem) => problem.pattern)).size;
    return { strongCoverage, topicCount, patternCount };
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
    <div className="mt-8 space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.95))] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(2,6,23,0.98))] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <Badge tone="blue">Curated public problem set</Badge>
            <div className="space-y-2">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Practice from problems that are ready enough to actually learn from.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300 sm:text-base">
                Entries with less than half of the important fields filled stay in admin only. This page now shows the cleaner, study-ready catalog.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="border-white/50 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-slate-950/40 dark:shadow-none">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visible Problems</div>
                <div className="mt-2 text-3xl font-semibold">{filtered.length}</div>
              </CardContent>
            </Card>
            <Card className="border-white/50 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-slate-950/40 dark:shadow-none">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Strong Coverage</div>
                <div className="mt-2 text-3xl font-semibold">{stats.strongCoverage}</div>
              </CardContent>
            </Card>
            <Card className="border-white/50 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-slate-950/40 dark:shadow-none">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Topics / Patterns</div>
                <div className="mt-2 text-3xl font-semibold">
                  {stats.topicCount} / {stats.patternCount}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="rounded-[28px] border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg">Find a problem fast</div>
              <div className="mt-1 text-sm font-normal text-muted-foreground">
                Search by title, topic, or pattern and jump directly into a random ready problem when you want quick revision.
              </div>
            </div>
            <button
              type="button"
              onClick={onRandomProblem}
              disabled={filtered.length === 0}
              className="rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              Random Revise
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                View:
                <button
                  type="button"
                  onClick={() => setView("grouped")}
                  className={`rounded-full border px-3 py-1.5 font-medium transition hover:bg-muted ${view === "grouped" ? "bg-muted text-foreground" : ""}`}
                >
                  Grouped
                </button>
                <button
                  type="button"
                  onClick={() => setView("board")}
                  className={`rounded-full border px-3 py-1.5 font-medium transition hover:bg-muted ${view === "board" ? "bg-muted text-foreground" : ""}`}
                >
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`rounded-full border px-3 py-1.5 font-medium transition hover:bg-muted ${view === "list" ? "bg-muted text-foreground" : ""}`}
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
                <span className="text-muted-foreground">Show incomplete metadata</span>
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} result{filtered.length === 1 ? "" : "s"} in the public catalog
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Query</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, topic, pattern…"
                className="min-h-[44px] h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[44px] h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">All topics</option>
                {topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pattern</span>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="min-h-[44px] h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">All patterns</option>
                {patterns.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {topic !== "all" ? <Badge tone={toneForTopic(topic)}>{topic}</Badge> : null}
            {pattern !== "all" ? <Badge tone={toneForPattern(pattern)}>{pattern}</Badge> : null}
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

      {filtered.length === 0 ? (
        <Card className="rounded-[28px] border-dashed border-slate-300/80 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/30">
          <CardContent className="flex flex-col items-start gap-3 p-8">
            <Badge tone="amber">No matching problems</Badge>
            <div>
              <div className="text-lg font-semibold">Nothing matches the current filters.</div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Try a different topic or pattern, or clear the filters to go back to the public-ready catalog.
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Reset filters
            </button>
          </CardContent>
        </Card>
      ) : view === "grouped" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {grouped.map(([groupTopic, list]) => (
            <Card key={groupTopic} className="rounded-[24px] border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{groupTopic}</span>
                  <Badge tone={toneForTopic(groupTopic)}>{list.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {list.map((problem) => (
                    <li
                      key={problem.slug}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <NextLink
                              href={`/problems/${problem.slug}`}
                              className="text-base font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                            >
                              {problem.title}
                            </NextLink>
                            <div className="mt-1 text-xs text-muted-foreground">{problem.slug}</div>
                          </div>
                          <Badge tone={readinessTone(problem.completenessScore)}>
                            {problem.completenessScore ?? 0}% ready
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={toneForTopic(problem.topic)}>{problem.topic}</Badge>
                          <Badge tone={toneForPattern(problem.pattern)}>{problem.pattern}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Updated {formatUpdatedAt(problem.updatedAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : view === "board" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((problem) => (
            <Card
              key={problem.slug}
              className="group rounded-[24px] border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.96))]"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={toneForTopic(problem.topic)}>{problem.topic}</Badge>
                  <Badge tone={readinessTone(problem.completenessScore)}>
                    {problem.completenessScore ?? 0}% ready
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-7">
                  <NextLink
                    href={`/problems/${problem.slug}`}
                    className="text-slate-950 transition group-hover:text-sky-700 dark:text-slate-50 dark:group-hover:text-sky-300"
                  >
                    {problem.title}
                  </NextLink>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={toneForPattern(problem.pattern)}>{problem.pattern}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{problem.slug}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {formatUpdatedAt(problem.updatedAt)}</span>
                  <NextLink
                    href={`/problems/${problem.slug}`}
                    className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
                  >
                    Open problem
                  </NextLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[28px] border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>All Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {ordered.map((problem) => (
                <li key={problem.slug} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <NextLink
                        href={`/problems/${problem.slug}`}
                        className="text-base font-semibold text-slate-900 hover:underline dark:text-slate-50"
                      >
                        {problem.title}
                      </NextLink>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={toneForTopic(problem.topic)}>{problem.topic}</Badge>
                        <Badge tone={toneForPattern(problem.pattern)}>{problem.pattern}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{problem.slug}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={readinessTone(problem.completenessScore)}>
                        {problem.completenessScore ?? 0}% ready
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatUpdatedAt(problem.updatedAt)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
