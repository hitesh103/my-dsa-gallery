"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemMeta } from "@/lib/problemDoc";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/adminToken";
import { toneForPattern, toneForTopic } from "@/lib/tags";

type ApiProblems = { problems: ProblemMeta[] } | { error: string };

export function AdminClient() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemMeta[]>([]);

  const authHeader = useMemo(() => {
    const t = token.trim();
    const headers: Record<string, string> = {};
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  }, [token]);

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
    const t = getAdminToken();
    if (t) setToken(t);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveToken = () => {
    const t = token.trim();
    if (!t) {
      clearAdminToken();
      setStatus("Cleared token.");
      return;
    }
    setAdminToken(t);
    setStatus("Saved token in this browser.");
  };

  const onSeed = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST", headers: authHeader });
      const json = (await res.json()) as { ok?: boolean; error?: string; seeded?: number; message?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Seed failed");
      setStatus(json.message ?? `Seeded ${json.seeded ?? 0} problems.`);
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Admin token</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Set ADMIN_TOKEN in Cloudflare env"
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveToken}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Save token
            </button>
            <button
              type="button"
              onClick={onSeed}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Seed initial problems
            </button>
            <Link
              href="/admin/problems/new"
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              New problem
            </Link>
            <button
              type="button"
              onClick={refresh}
              className="ml-auto inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Refresh
            </button>
          </div>

          {status ? (
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">{status}</div>
          ) : null}

          <div className="text-xs text-muted-foreground">
            Notes:
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                Create a D1 database and bind it as <code>DB</code>.
              </li>
              <li>
                Set <code>ADMIN_TOKEN</code> as a secret in Cloudflare Pages/Workers env.
              </li>
            </ul>
          </div>
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
                      href={`/admin/problems/${p.slug}`}
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                    >
                      Edit
                    </Link>
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
  );
}
