"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problemDoc";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { JsonProblemEditor } from "./JsonProblemEditor";

type ApiProblems = { problems: ProblemMeta[] } | { error: string };

export function AdminClient() {
  const [status, setStatus] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemMeta[]>([]);

  const refresh = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/problems", { cache: "no-store" });
      const json = (await res.json()) as ApiProblems;
      if (!res.ok || "error" in json) throw new Error("error" in json ? json.error : "Failed");
      setProblems(json.problems);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
      setProblems([]);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSeed = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string; seeded?: number; message?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Seed failed");
      setStatus(json.message ?? `Seeded ${json.seeded ?? 0} problems.`);
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  const onLogout = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/auth", { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Logout failed");
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSeed}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted min-h-[44px]"
            >
              Seed initial problems
            </button>
            <button
              type="button"
              onClick={refresh}
              className="ml-auto inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted min-h-[44px]"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted min-h-[44px]"
            >
              Logout
            </button>
          </div>

          {status ? (
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">{status}</div>
          ) : null}

          <div className="text-xs text-muted-foreground">
            Create/update problems from JSON, seed initial problems, and manage uploads.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>JSON Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonProblemEditor onStatus={(m) => setStatus(m)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Problems</span>
              <span className="text-xs font-normal text-muted-foreground">
                {problems.length} item{problems.length === 1 ? "" : "s"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {problems.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No problems found in D1 yet. Click “Seed initial problems”.
              </div>
            ) : (
              <ul className="divide-y">
                {problems.map((p) => (
                  <li key={p.slug} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={toneForTopic(p.topic)}>{p.topic}</Badge>
                      <Badge tone={toneForPattern(p.pattern)}>{p.pattern}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/problems/${p.slug}`}
                        className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
