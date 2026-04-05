import { ProblemsClient } from "./ProblemsClient";
import { getProblemIndex } from "@/lib/problems";

export default function ProblemsIndexPage() {
  const problems = getProblemIndex();

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
