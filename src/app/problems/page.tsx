import { ProblemsClient } from "./ProblemsClient";
import { listProblems } from "@/lib/problemStore";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DSA Problems Gallery",
  description: "Collection of Data Structures and Algorithms problems with detailed solutions, brute force and optimal approaches, complexity analysis, and quick revision notes.",
  keywords: ["DSA", "algorithms", "data structures", "coding problems", "LeetCode", "GeeksforGeeks", "practice"],
  openGraph: {
    title: "DSA Problems Gallery",
    description: "Collection of algorithm problems with detailed solutions.",
    type: "website",
  },
};

export default async function ProblemsIndexPage() {
  let problems = null;
  let message: string | null = null;

  try {
    problems = await listProblems({ limit: 500 });
  } catch (e) {
    message = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Problem library</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          DSA Problems
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Browse the public catalog, filter by topic or pattern, or hit random for a fresh revision
          problem each time.
        </p>
      </div>

      {problems ? (
        <ProblemsClient problems={problems} />
      ) : (
        <div className="mt-6 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">D1 not configured</div>
          <div className="mt-1">{message}</div>
          <div className="mt-3 text-xs">
            Bind your D1 database as <code>DB</code> and redeploy, then seed
            from <code>/admin</code>.
          </div>
        </div>
      )}
    </main>
  );
}
