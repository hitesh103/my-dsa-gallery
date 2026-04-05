import { ProblemsClient } from "./ProblemsClient";
import { getProblemIndex } from "@/lib/problems";
import { listProblems } from "@/lib/problemStore";

export const dynamic = "force-dynamic";

export default async function ProblemsIndexPage() {
  let problems = getProblemIndex();
  try {
    const fromD1 = await listProblems({ limit: 500 });
    if (fromD1.length) {
      problems = fromD1.map((p) => ({
        slug: p.slug,
        title: p.title,
        topic: p.topic,
        pattern: p.pattern,
        link: p.link,
      }));
    }
  } catch {
    // D1 not configured or unavailable; keep file-backed index.
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="text-sm text-muted-foreground">
          Grouped by topic and pattern. Each write-up includes intuition, brute
          force, optimal solution, and quick revision.
        </p>
      </div>

      <ProblemsClient problems={problems} />
    </main>
  );
}
