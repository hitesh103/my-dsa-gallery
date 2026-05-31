import NextLink from "next/link";

import { DailyProblem } from "@/components/home/DailyProblem";
import { Heatmap } from "@/components/home/Heatmap";
import { TodoList } from "@/components/home/TodoList";
import { RandomProblemCard } from "@/components/problems/RandomProblemCard";
import { Badge } from "@/components/ui/Badge";
import { listProblems } from "@/lib/problemStore";
import { panelHeroClass, panelHeroInnerClass } from "@/lib/panelStyles";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function Home() {
  let problems: Awaited<ReturnType<typeof listProblems>> = [];
  let problemsError: string | null = null;

  try {
    problems = await listProblems({ limit: 500 });
  } catch (e) {
    problemsError = e instanceof Error ? e.message : "Could not load problems";
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 pb-24 sm:gap-10 sm:py-14 sm:pb-14">
      <section className={cn(panelHeroClass, panelHeroInnerClass)}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Badge tone="slate">Personal workspace</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              my dsa gallery
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Structured write-ups, study photos, and quick revision — with a daily problem pick and
              a clickable random card when you want variety.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <NextLink
                href="/problems"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 dark:border-slate-600"
              >
                Problems
              </NextLink>
              <NextLink
                href="/gallery"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Gallery
              </NextLink>
              <NextLink
                href="/admin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Admin
              </NextLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-xs lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-200/80 bg-muted/40 p-4 dark:border-slate-800">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ready problems</div>
              <div className="mt-2 text-3xl font-semibold">{problems.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-muted/40 p-4 dark:border-slate-800">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily pick</div>
              <div className="mt-2 text-sm font-medium text-foreground">Refreshes at midnight</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-muted/40 p-4 dark:border-slate-800 sm:col-span-1 lg:col-span-1">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Study flow</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Daily → deep dive → gallery notes
              </div>
            </div>
          </div>
        </div>
      </section>

      {problemsError ? (
        <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-muted/30 p-5 text-sm text-muted-foreground dark:border-slate-700">
          <div className="font-medium text-foreground">Problems unavailable</div>
          <p className="mt-1">{problemsError}</p>
        </div>
      ) : (
        <>
          <DailyProblem problems={problems} />
          {problems.length > 0 ? <RandomProblemCard problems={problems} /> : null}
        </>
      )}

      <section className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 flex flex-col gap-6">
          <div className="rounded-[24px] border border-slate-200/80 bg-card p-5 text-sm text-muted-foreground shadow-sm dark:border-slate-800">
            <span className="font-medium text-foreground">Tip:</span> Start from{" "}
            <NextLink href="/problems" className="text-foreground underline-offset-4 hover:underline">
              Problems
            </NextLink>
            , attach study photos in{" "}
            <NextLink href="/gallery" className="text-foreground underline-offset-4 hover:underline">
              Gallery
            </NextLink>
            , and leave comments on each problem for quick revisions.
          </div>

          <Heatmap years={3} />
        </div>

        <TodoList />
      </section>
    </main>
  );
}
