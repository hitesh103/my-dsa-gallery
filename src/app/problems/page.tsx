import NextLink from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { groupProblems } from "@/lib/problems";

export const runtime = "edge";

export default function ProblemsIndexPage() {
  const grouped = groupProblems();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="text-sm text-muted-foreground">
          Grouped by topic and pattern. Each write-up includes intuition, brute
          force, optimal solution, and quick revision.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {grouped.map(([topic, problems]) => (
          <Card key={topic}>
            <CardHeader>
              <CardTitle>{topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {problems.map((p) => (
                  <li key={p.slug} className="flex items-baseline justify-between gap-3">
                    <NextLink
                      href={`/problems/${p.slug}`}
                      className="font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-800 dark:decoration-zinc-700 dark:hover:decoration-zinc-200"
                    >
                      {p.title}
                    </NextLink>
                    <span className="text-xs text-muted-foreground">{p.pattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

