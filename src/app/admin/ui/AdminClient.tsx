"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problemDoc";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { JsonProblemEditor } from "./JsonProblemEditor";
import { TagManager } from "./TagManager";

type ApiProblems = { problems: ProblemMeta[] } | { error: string };

export function AdminClient() {
  const [status, setStatus] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

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

  const onSeedStriver = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/seed-striver", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string; seeded?: number; message?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Seed failed");
      setStatus(json.message ?? `Seeded ${json.seeded ?? 0} Striver problems.`);
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  const onDeleteProblem = async (slug: string) => {
    if (!confirm(`Delete problem "${slug}"?`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Delete failed");
      setStatus(`Deleted "${slug}".`);
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    } finally {
      setDeletingSlug(null);
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onSeedStriver}
                className="inline-flex items-center justify-center rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-2.5 text-sm font-medium hover:bg-blue-500/20 min-h-[44px]"
              >
                Seed Striver A2Z (368 problems)
              </button>
              <button
                type="button"
                onClick={onSeed}
                className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted min-h-[44px]"
              >
                Seed sample problems
              </button>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted min-h-[44px]"
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
              Seed problems, manage tags, and create/edit content.
            </div>
          </CardContent>
        </Card>

        <TagManager />

        <Card>
          <CardHeader>
            <CardTitle>JSON Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonProblemEditor onStatus={(m) => setStatus(m)} />
          </CardContent>
        </Card>
      </div>

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
              No problems found in D1 yet. Click "Seed" to add problems.
            </div>
          ) : (
            <ul className="divide-y max-h-[800px] overflow-y-auto">
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
                    <Link
                      href={`/admin/problems/${p.slug}`}
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void onDeleteProblem(p.slug)}
                      disabled={deletingSlug === p.slug}
                      className="inline-flex items-center justify-center rounded-lg border border-destructive/50 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deletingSlug === p.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
