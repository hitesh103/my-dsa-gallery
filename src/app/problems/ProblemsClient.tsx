"use client";

import NextLink from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problems";
import { toneForPattern, toneForTopic } from "@/lib/tags";

function uniqSorted(items: string[]) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

export function ProblemsClient({ problems }: { problems: ProblemMeta[] }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string>("all");
  const [pattern, setPattern] = useState<string>("all");

  const topics = useMemo(() => uniqSorted(problems.map((p) => p.topic)), [problems]);
  const patterns = useMemo(
    () => uniqSorted(problems.map((p) => p.pattern)),
    [problems],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return problems.filter((p) => {
      if (topic !== "all" && p.topic !== topic) return false;
      if (pattern !== "all" && p.pattern !== pattern) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.topic.toLowerCase().includes(query) ||
        p.pattern.toLowerCase().includes(query)
      );
    });
  }, [problems, q, topic, pattern]);

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

  const onClear = () => {
    setQ("");
    setTopic("all");
    setPattern("all");
  };

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Search</span>
            <span className="text-xs font-normal text-muted-foreground">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Query</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, topic, pattern…"
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
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
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
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
    </div>
  );
}

