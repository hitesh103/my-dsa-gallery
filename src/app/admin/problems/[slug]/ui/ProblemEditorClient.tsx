"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemContent, ProblemDoc } from "@/lib/problemDoc";

type ApiGet = { problem: ProblemDoc } | { error: string };

function emptyContent(): ProblemContent {
  return {
    statementMd: "",
    inputMd: "",
    outputMd: "",
    exampleMd: "",
    exampleExplanationMd: "",
    brute: {
      intuitionMd: "",
      approachMd: "",
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    optimal: {
      intuitionMd: "",
      approachMd: "",
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    quickRevision: { brute: [], optimal: [] },
  };
}

function lines(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProblemEditorClient({ slug }: { slug: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<ProblemDoc>({
    slug,
    title: "",
    topic: "",
    pattern: "",
    link: "",
    content: emptyContent(),
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setStatus(null);
      try {
        if (slug === "new") {
          setDoc({
            slug: "",
            title: "",
            topic: "",
            pattern: "",
            link: "",
            content: emptyContent(),
          });
          setStatus("Create mode: fill fields and Save.");
          return;
        }

        const res = await fetch(`/api/problems/${slug}`, { cache: "no-store" });
        if (res.status === 404) {
          setDoc({
            slug,
            title: "",
            topic: "",
            pattern: "",
            link: "",
            content: emptyContent(),
          });
          setStatus("Not found in D1. You can create it by filling fields and Save.");
          return;
        }
        const json = (await res.json()) as ApiGet;
        if (!res.ok || "error" in json) throw new Error("error" in json ? json.error : "Failed");
        setDoc(json.problem);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setStatus(msg);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug]);

  const onSave = async () => {
    setStatus(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const targetSlug = doc.slug.trim() || slug;
      if (!/^[a-z0-9-]+$/.test(targetSlug)) {
        throw new Error("Slug must be lowercase a-z, 0-9, and hyphen only.");
      }

      const res = await fetch(`/api/problems/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...doc, slug: targetSlug }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Save failed");
      setStatus("Saved.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  const update = (patch: Partial<ProblemDoc>) => setDoc((d) => ({ ...d, ...patch }));
  const updateContent = (patch: Partial<ProblemContent>) =>
    setDoc((d) => ({ ...d, content: { ...d.content, ...patch } }));

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {slug === "new" ? "Create new problem" : `Edit: ${slug}`}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            Stored in D1. Use Markdown for text fields.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={doc.slug ? `/problems/${doc.slug}` : "/problems"}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            View
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Save
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {status ? (
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">
              {status}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Slug</span>
            <input
              value={doc.slug}
              onChange={(e) => update({ slug: e.target.value })}
              placeholder="e.g. two-sum"
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Title</span>
            <input
              value={doc.title}
                onChange={(e) => update({ title: e.target.value })}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <input
                value={doc.topic}
                onChange={(e) => update({ topic: e.target.value })}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pattern</span>
              <input
                value={doc.pattern}
                onChange={(e) => update({ pattern: e.target.value })}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Problem link</span>
              <input
                value={doc.link}
                onChange={(e) => update({ link: e.target.value })}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Revision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Brute (one bullet per line)
              </span>
              <textarea
                value={(doc.content.quickRevision.brute ?? []).join("\n")}
                onChange={(e) =>
                  updateContent({
                    quickRevision: { ...doc.content.quickRevision, brute: lines(e.target.value) },
                  })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Optimal (one bullet per line)
              </span>
              <textarea
                value={(doc.content.quickRevision.optimal ?? []).join("\n")}
                onChange={(e) =>
                  updateContent({
                    quickRevision: {
                      ...doc.content.quickRevision,
                      optimal: lines(e.target.value),
                    },
                  })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Problem statement (MD)</span>
            <textarea
              value={doc.content.statementMd}
              onChange={(e) => updateContent({ statementMd: e.target.value })}
              rows={8}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <div className="grid gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Input (MD)</span>
              <textarea
                value={doc.content.inputMd}
                onChange={(e) => updateContent({ inputMd: e.target.value })}
                rows={4}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Output (MD)</span>
              <textarea
                value={doc.content.outputMd}
                onChange={(e) => updateContent({ outputMd: e.target.value })}
                rows={4}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Example (MD)</span>
            <textarea
              value={doc.content.exampleMd}
              onChange={(e) => updateContent({ exampleMd: e.target.value })}
              rows={8}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Example explanation (MD)</span>
            <textarea
              value={doc.content.exampleExplanationMd}
              onChange={(e) => updateContent({ exampleExplanationMd: e.target.value })}
              rows={8}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brute Force</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Intuition (MD)</span>
              <textarea
                value={doc.content.brute.intuitionMd}
                onChange={(e) =>
                  updateContent({ brute: { ...doc.content.brute, intuitionMd: e.target.value } })
                }
                rows={5}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Approach (MD)</span>
              <textarea
                value={doc.content.brute.approachMd}
                onChange={(e) =>
                  updateContent({ brute: { ...doc.content.brute, approachMd: e.target.value } })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Java code</span>
              <textarea
                value={doc.content.brute.codeJava}
                onChange={(e) =>
                  updateContent({ brute: { ...doc.content.brute, codeJava: e.target.value } })
                }
                rows={14}
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Time</span>
                <input
                  value={doc.content.brute.time}
                  onChange={(e) =>
                    updateContent({ brute: { ...doc.content.brute, time: e.target.value } })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Space</span>
                <input
                  value={doc.content.brute.space}
                  onChange={(e) =>
                    updateContent({ brute: { ...doc.content.brute, space: e.target.value } })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Complexity explanation (MD)
              </span>
              <textarea
                value={doc.content.brute.complexityExplanationMd}
                onChange={(e) =>
                  updateContent({
                    brute: { ...doc.content.brute, complexityExplanationMd: e.target.value },
                  })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Intuition (MD)</span>
              <textarea
                value={doc.content.optimal.intuitionMd}
                onChange={(e) =>
                  updateContent({
                    optimal: { ...doc.content.optimal, intuitionMd: e.target.value },
                  })
                }
                rows={5}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Approach (MD)</span>
              <textarea
                value={doc.content.optimal.approachMd}
                onChange={(e) =>
                  updateContent({
                    optimal: { ...doc.content.optimal, approachMd: e.target.value },
                  })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Java code</span>
              <textarea
                value={doc.content.optimal.codeJava}
                onChange={(e) =>
                  updateContent({ optimal: { ...doc.content.optimal, codeJava: e.target.value } })
                }
                rows={14}
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Time</span>
                <input
                  value={doc.content.optimal.time}
                  onChange={(e) =>
                    updateContent({ optimal: { ...doc.content.optimal, time: e.target.value } })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Space</span>
                <input
                  value={doc.content.optimal.space}
                  onChange={(e) =>
                    updateContent({ optimal: { ...doc.content.optimal, space: e.target.value } })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Complexity explanation (MD)
              </span>
              <textarea
                value={doc.content.optimal.complexityExplanationMd}
                onChange={(e) =>
                  updateContent({
                    optimal: { ...doc.content.optimal, complexityExplanationMd: e.target.value },
                  })
                }
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
