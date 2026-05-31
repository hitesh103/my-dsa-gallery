import NextLink from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { ProblemMeta } from "@/lib/problemDoc";
import { panelHeroClass } from "@/lib/panelStyles";
import { dailySeed, pickDailyProblem } from "@/lib/randomProblem";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { cn } from "@/lib/cn";

function formatDailyLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function DailyProblem({
  problems,
}: {
  problems: ProblemMeta[];
}) {
  const today = new Date();
  const daily = pickDailyProblem(problems, today);

  if (!daily) {
    return (
      <section
        aria-label="Daily problem"
        className="rounded-[28px] border border-dashed border-border bg-muted/30 p-6"
      >
        <Badge tone="slate">Daily revise</Badge>
        <p className="mt-3 text-sm text-muted-foreground">
          No public-ready problems yet. Seed D1 from{" "}
          <NextLink href="/admin" className="font-medium text-foreground underline-offset-4 hover:underline">
            Admin
          </NextLink>{" "}
          to unlock the daily pick.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Daily problem" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="slate">Daily revise</Badge>
        <span className="text-xs text-muted-foreground">{formatDailyLabel(today)}</span>
      </div>

      <NextLink
        href={`/problems/${daily.slug}`}
        className={cn(
          panelHeroClass,
          "group block p-5 transition hover:border-foreground/20 hover:shadow-md sm:p-7",
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground transition group-hover:underline sm:text-2xl">
              {daily.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Today&apos;s pick — same until midnight. Tap anywhere on this card to open (
              {problems.length} in catalog).
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone={toneForTopic(daily.topic)}>{daily.topic}</Badge>
              <Badge tone={toneForPattern(daily.pattern)}>{daily.pattern}</Badge>
              {daily.completenessScore != null ? (
                <Badge tone="emerald">{daily.completenessScore}% ready</Badge>
              ) : null}
            </div>
          </div>
          <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-border bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition group-hover:opacity-90">
            Open problem
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="font-mono text-foreground/80">{daily.slug}</span>
          <span title="Stable daily seed">Seed: {dailySeed(today)}</span>
        </div>
      </NextLink>

      <div className="flex justify-end">
        <NextLink
          href="/problems"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Browse all problems
        </NextLink>
      </div>
    </section>
  );
}
