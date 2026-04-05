import { ProblemsClient } from "./ProblemsClient";
import { listProblems } from "@/lib/problemStore";

export const dynamic = "force-dynamic";

export default async function ProblemsIndexPage() {
  try {
    const problems = await listProblems({ limit: 500 });

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground">
            Grouped by topic and pattern. Each write-up includes intuition,
            brute force, optimal solution, and quick revision.
          </p>
        </div>

        <ProblemsClient problems={problems} />
      </main>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground">
            This app is configured to use D1 for problems.
          </p>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">D1 not configured</div>
          <div className="mt-1">{message}</div>
          <div className="mt-3 text-xs">
            Bind your D1 database as <code>DB</code> and redeploy, then seed
            from <code>/admin</code>.
          </div>
        </div>
      </main>
    );
  }
}
