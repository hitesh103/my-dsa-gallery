"use client";

import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import type { ProblemMeta } from "@/lib/problemDoc";
import { pickRandomProblem } from "@/lib/randomProblem";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { cn } from "@/lib/cn";

function formatUpdatedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function RandomProblemCard({
  problems,
  className,
  title = "Random revise",
}: {
  problems: ProblemMeta[];
  className?: string;
  title?: string;
}) {
  const initial = useMemo(() => pickRandomProblem(problems), [problems]);
  const [selected, setSelected] = useState<ProblemMeta | null>(initial);

  useEffect(() => {
    setSelected(pickRandomProblem(problems));
  }, [problems]);

  const shuffle = useCallback(() => {
    if (problems.length === 0) return;
    if (problems.length === 1) {
      setSelected(problems[0] ?? null);
      return;
    }
    let next = pickRandomProblem(problems);
    let guard = 0;
    while (next && selected && next.slug === selected.slug && guard < 8) {
      next = pickRandomProblem(problems);
      guard += 1;
    }
    setSelected(next);
  }, [problems, selected]);

  if (problems.length === 0) {
    return (
      <section
        className={cn(
          "rounded-[28px] border border-dashed border-slate-300/80 bg-muted/30 p-5 dark:border-slate-700",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">No problems available for random revise yet.</p>
      </section>
    );
  }

  if (!selected) return null;

  const updated = formatUpdatedAt(selected.updatedAt);

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="slate">{title}</Badge>
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7L11 12l-4.3-4.3A4.2 4.2 0 0 0 3.4 6H2" />
            <path d="M22 6h-1.4c-1.3 0-2.5.6-3.3 1.7L13 12l4.3 4.3A4.2 4.2 0 0 0 20.6 18H22" />
          </svg>
          Pick another
        </button>
      </div>

      <NextLink
        href={`/problems/${selected.slug}`}
        className="group block overflow-hidden rounded-[28px] border border-slate-200/80 bg-card p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700 sm:p-6"
      >
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground transition group-hover:underline sm:text-2xl">
            {selected.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Tap to open this problem — or use Pick another for a new random choice.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={toneForTopic(selected.topic)}>{selected.topic}</Badge>
            <Badge tone={toneForPattern(selected.pattern)}>{selected.pattern}</Badge>
            {selected.completenessScore != null ? (
              <Badge tone="emerald">{selected.completenessScore}% ready</Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{selected.slug}</span>
            {updated ? <span>Updated {updated}</span> : null}
          </div>
        </div>
      </NextLink>
    </section>
  );
}
