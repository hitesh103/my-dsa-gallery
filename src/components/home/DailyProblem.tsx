import NextLink from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problemDoc";
import { dailySeed, pickDailyProblem } from "@/lib/randomProblem";
import { toneForPattern, toneForTopic } from "@/lib/tags";

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
        className="overflow-hidden rounded-[28px] border border-dashed border-slate-300/80 bg-slate-50/60 p-6 dark:border-slate-700 dark:bg-slate-900/30"
      >
        <Badge tone="amber">Daily revise</Badge>
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
    <section
      aria-label="Daily problem"
      className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.92))] p-5 shadow-sm transition duration-200 hover:shadow-md dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.2),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(2,6,23,0.98))] sm:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">Daily revise</Badge>
            <span className="text-xs text-muted-foreground">{formatDailyLabel(today)}</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {daily.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              One problem per day — same pick until midnight. Refreshes from your public catalog (
              {problems.length} ready).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={toneForTopic(daily.topic)}>{daily.topic}</Badge>
            <Badge tone={toneForPattern(daily.pattern)}>{daily.pattern}</Badge>
            {daily.completenessScore != null ? (
              <Badge tone="emerald">{daily.completenessScore}% ready</Badge>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <NextLink
            href={`/problems/${daily.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            Open today&apos;s problem
          </NextLink>
          <NextLink
            href="/problems"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Browse all problems
          </NextLink>
        </div>
      </div>

      <Card className="mt-5 border-white/50 bg-white/70 shadow-none backdrop-blur dark:border-white/10 dark:bg-slate-950/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs text-muted-foreground">
          <span className="font-mono text-foreground/80">{daily.slug}</span>
          <span title="Stable daily seed">Seed: {dailySeed(today)}</span>
        </CardContent>
      </Card>
    </section>
  );
}
