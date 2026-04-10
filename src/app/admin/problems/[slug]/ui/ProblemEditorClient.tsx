"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProblemContent, ProblemDoc, Visualization } from "@/lib/problemDoc";

type ApiGet = { problem: ProblemDoc } | { error: string };

function emptyContent(): ProblemContent {
  return {
    statementMd: "",
    statementVisualization: null,
    inputMd: "",
    inputVisualization: null,
    outputMd: "",
    outputVisualization: null,
    exampleMd: "",
    exampleVisualization: null,
    exampleExplanationMd: "",
    exampleExplanationVisualization: null,
    brute: {
      intuitionMd: "",
      intuitionVisualization: null,
      approachMd: "",
      approachVisualization: null,
      dryRun: "",
      dryRunVisualization: null,
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
      complexityVisualization: null,
    },
    optimal: {
      intuitionMd: "",
      intuitionVisualization: null,
      approachMd: "",
      approachVisualization: null,
      dryRun: "",
      dryRunVisualization: null,
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
      complexityVisualization: null,
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
  const [bruteVizText, setBruteVizText] = useState("");
  const [optimalVizText, setOptimalVizText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [doc, setDoc] = useState<ProblemDoc>({
    slug,
    title: "",
    topic: "",
    pattern: "",
    link: "",
    content: emptyContent(),
  });

  const syncDerivedEditors = useCallback((nextDoc: ProblemDoc) => {
    setBruteVizText(
      nextDoc.content.brute.visualization
        ? JSON.stringify(nextDoc.content.brute.visualization, null, 2)
        : "",
    );
    setOptimalVizText(
      nextDoc.content.optimal.visualization
        ? JSON.stringify(nextDoc.content.optimal.visualization, null, 2)
        : "",
    );
    setJsonText(JSON.stringify(nextDoc, null, 2));
  }, []);

  const loadDocIntoEditor = useCallback((nextDoc: ProblemDoc) => {
    setDoc(nextDoc);
    syncDerivedEditors(nextDoc);
  }, [syncDerivedEditors]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setStatus(null);
      try {
        if (slug === "new") {
          loadDocIntoEditor({
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
          loadDocIntoEditor({
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
        loadDocIntoEditor(json.problem);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setStatus(msg);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [loadDocIntoEditor, slug]);

  const saveProblem = async (problem: ProblemDoc, successMessage = "Saved.") => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const targetSlug = problem.slug.trim() || slug;
    if (!/^[a-z0-9-]+$/.test(targetSlug)) {
      throw new Error("Slug must be lowercase a-z, 0-9, and hyphen only.");
    }

    const payload = { ...problem, slug: targetSlug };
    const res = await fetch(`/api/problems/${encodeURIComponent(targetSlug)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || json.error) throw new Error(json.error ?? "Save failed");
    loadDocIntoEditor(payload);
    setStatus(successMessage);
  };

  const onSave = async () => {
    setStatus(null);
    try {
      await saveProblem(doc);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatus(msg);
    }
  };

  const onSyncJsonFromForm = () => {
    const payload = { ...doc, slug: doc.slug.trim() || slug };
    setJsonText(JSON.stringify(payload, null, 2));
    setStatus("JSON payload synced from form.");
  };

  const onApplyJsonToForm = () => {
    setStatus(null);
    try {
      const parsed = JSON.parse(jsonText) as ProblemDoc;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON payload.");
      }
      if (!parsed.slug || !/^[a-z0-9-]+$/.test(parsed.slug)) {
        throw new Error("Payload must include a valid lowercase slug.");
      }
      if (!parsed.content) {
        throw new Error("Payload must include content.");
      }
      loadDocIntoEditor(parsed);
      setStatus("JSON applied to editor fields.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON payload.";
      setStatus(msg);
    }
  };

  const onSaveJson = async () => {
    setStatus(null);
    try {
      const parsed = JSON.parse(jsonText) as ProblemDoc;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON payload.");
      }
      await saveProblem(parsed, "Saved from JSON payload.");
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

      <Card>
        <CardHeader>
          <CardTitle>JSON Payload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSyncJsonFromForm}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Sync From Form
            </button>
            <button
              type="button"
              onClick={onApplyJsonToForm}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Apply JSON To Form
            </button>
            <button
              type="button"
              onClick={() => void onSaveJson()}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Save JSON
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full rounded-xl border bg-background px-3 py-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30"
          />

          <div className="text-xs text-muted-foreground">
            Paste the full problem payload here to update this record directly, or sync the current
            form state into JSON before editing.
          </div>
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
          <div className="space-y-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Problem statement (MD)</span>
              <textarea
                value={doc.content.statementMd}
                onChange={(e) => updateContent({ statementMd: e.target.value })}
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Statement Visualization (JSON)</span>
              <textarea
                value={doc.content.statementVisualization ? JSON.stringify(doc.content.statementVisualization) : ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (!val) {
                    updateContent({ statementVisualization: null });
                    return;
                  }
                  try {
                    updateContent({ statementVisualization: JSON.parse(val) });
                  } catch {}
                }}
                rows={4}
                placeholder='{"engine":"mermaid","code":"..."}'
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Input (MD)</span>
                <textarea
                  value={doc.content.inputMd}
                  onChange={(e) => updateContent({ inputMd: e.target.value })}
                  rows={3}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Input Visualization</span>
                <textarea
                  value={doc.content.inputVisualization ? JSON.stringify(doc.content.inputVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ inputVisualization: null }); return; }
                    try { updateContent({ inputVisualization: JSON.parse(val) }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Output (MD)</span>
                <textarea
                  value={doc.content.outputMd}
                  onChange={(e) => updateContent({ outputMd: e.target.value })}
                  rows={3}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Output Visualization</span>
                <textarea
                  value={doc.content.outputVisualization ? JSON.stringify(doc.content.outputVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ outputVisualization: null }); return; }
                    try { updateContent({ outputVisualization: JSON.parse(val) }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Example (MD)</span>
              <textarea
                value={doc.content.exampleMd}
                onChange={(e) => updateContent({ exampleMd: e.target.value })}
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Example Visualization</span>
              <textarea
                value={doc.content.exampleVisualization ? JSON.stringify(doc.content.exampleVisualization) : ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (!val) { updateContent({ exampleVisualization: null }); return; }
                  try { updateContent({ exampleVisualization: JSON.parse(val) }); } catch {}
                }}
                rows={4}
                placeholder='{"engine":"mermaid","code":"..."}'
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Example explanation (MD)</span>
              <textarea
                value={doc.content.exampleExplanationMd}
                onChange={(e) => updateContent({ exampleExplanationMd: e.target.value })}
                rows={6}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Explanation Visualization</span>
              <textarea
                value={doc.content.exampleExplanationVisualization ? JSON.stringify(doc.content.exampleExplanationVisualization) : ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (!val) { updateContent({ exampleExplanationVisualization: null }); return; }
                  try { updateContent({ exampleExplanationVisualization: JSON.parse(val) }); } catch {}
                }}
                rows={4}
                placeholder='{"engine":"mermaid","code":"..."}'
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brute Force</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Intuition (MD)</span>
                <textarea
                  value={doc.content.brute.intuitionMd}
                  onChange={(e) =>
                    updateContent({ brute: { ...doc.content.brute, intuitionMd: e.target.value } })
                  }
                  rows={4}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Intuition Visualization</span>
                <textarea
                  value={doc.content.brute.intuitionVisualization ? JSON.stringify(doc.content.brute.intuitionVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ brute: { ...doc.content.brute, intuitionVisualization: null } }); return; }
                    try { updateContent({ brute: { ...doc.content.brute, intuitionVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Approach (MD)</span>
                <textarea
                  value={doc.content.brute.approachMd}
                  onChange={(e) =>
                    updateContent({ brute: { ...doc.content.brute, approachMd: e.target.value } })
                  }
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Approach Visualization</span>
                <textarea
                  value={doc.content.brute.approachVisualization ? JSON.stringify(doc.content.brute.approachVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ brute: { ...doc.content.brute, approachVisualization: null } }); return; }
                    try { updateContent({ brute: { ...doc.content.brute, approachVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","steps":[...]}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Dry run (MD)</span>
                <textarea
                  value={doc.content.brute.dryRun ?? ""}
                  onChange={(e) =>
                    updateContent({ brute: { ...doc.content.brute, dryRun: e.target.value } })
                  }
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Dry Run Visualization</span>
                <textarea
                  value={doc.content.brute.dryRunVisualization ? JSON.stringify(doc.content.brute.dryRunVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ brute: { ...doc.content.brute, dryRunVisualization: null } }); return; }
                    try { updateContent({ brute: { ...doc.content.brute, dryRunVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
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
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Complexity Visualization</span>
                <textarea
                  value={doc.content.brute.complexityVisualization ? JSON.stringify(doc.content.brute.complexityVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ brute: { ...doc.content.brute, complexityVisualization: null } }); return; }
                    try { updateContent({ brute: { ...doc.content.brute, complexityVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Intuition (MD)</span>
                <textarea
                  value={doc.content.optimal.intuitionMd}
                  onChange={(e) =>
                    updateContent({
                      optimal: { ...doc.content.optimal, intuitionMd: e.target.value },
                    })
                  }
                  rows={4}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Intuition Visualization</span>
                <textarea
                  value={doc.content.optimal.intuitionVisualization ? JSON.stringify(doc.content.optimal.intuitionVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ optimal: { ...doc.content.optimal, intuitionVisualization: null } }); return; }
                    try { updateContent({ optimal: { ...doc.content.optimal, intuitionVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Approach (MD)</span>
                <textarea
                  value={doc.content.optimal.approachMd}
                  onChange={(e) =>
                    updateContent({
                      optimal: { ...doc.content.optimal, approachMd: e.target.value },
                    })
                  }
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Approach Visualization</span>
                <textarea
                  value={doc.content.optimal.approachVisualization ? JSON.stringify(doc.content.optimal.approachVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ optimal: { ...doc.content.optimal, approachVisualization: null } }); return; }
                    try { updateContent({ optimal: { ...doc.content.optimal, approachVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","steps":[...]}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Dry run (MD)</span>
                <textarea
                  value={doc.content.optimal.dryRun ?? ""}
                  onChange={(e) =>
                    updateContent({ optimal: { ...doc.content.optimal, dryRun: e.target.value } })
                  }
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Dry Run Visualization</span>
                <textarea
                  value={doc.content.optimal.dryRunVisualization ? JSON.stringify(doc.content.optimal.dryRunVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ optimal: { ...doc.content.optimal, dryRunVisualization: null } }); return; }
                    try { updateContent({ optimal: { ...doc.content.optimal, dryRunVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Visualization - Engine
              </span>
              <select
                value={(doc.content.optimal.visualization as { engine?: string })?.engine || "reactflow"}
                onChange={(e) => {
                  const engine = e.target.value as "reactflow" | "mermaid" | "ascii";
                  if (engine === "reactflow") {
                    updateContent({ optimal: { ...doc.content.optimal, visualization: { engine: "reactflow", nodes: [], edges: [] } } });
                  } else if (engine === "mermaid") {
                    updateContent({ optimal: { ...doc.content.optimal, visualization: { engine: "mermaid", code: "", steps: [] } } });
                  } else {
                    updateContent({ optimal: { ...doc.content.optimal, visualization: { engine: "ascii", lines: [], steps: [] } } });
                  }
                }}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="reactflow">React Flow</option>
                <option value="mermaid">Mermaid</option>
                <option value="ascii">ASCII</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Visualization (JSON/Mermaid/ASCII based on engine)
              </span>
              <textarea
                value={optimalVizText}
                onChange={(e) => setOptimalVizText(e.target.value)}
                onBlur={() => {
                  const raw = optimalVizText.trim();
                  if (!raw) {
                    updateContent({ optimal: { ...doc.content.optimal, visualization: null } });
                    return;
                  }
                  try {
                    const parsed = JSON.parse(raw) as Visualization;
                    updateContent({ optimal: { ...doc.content.optimal, visualization: parsed } });
                    setStatus("Visualization updated.");
                  } catch {
                    setStatus("Optimal visualization JSON is invalid (not saved).");
                  }
                }}
                rows={10}
                spellCheck={false}
                className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                placeholder={'React Flow: {"engine":"reactflow","nodes":[],"edges":[]}\nMermaid: {"engine":"mermaid","code":"graph TD;A-->B","steps":[]}\nASCII: {"engine":"ascii","lines":["  A  "," /|\\ "], "steps":[]}'}
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
            <div className="space-y-2">
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
                  rows={5}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Complexity Visualization</span>
                <textarea
                  value={doc.content.optimal.complexityVisualization ? JSON.stringify(doc.content.optimal.complexityVisualization) : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) { updateContent({ optimal: { ...doc.content.optimal, complexityVisualization: null } }); return; }
                    try { updateContent({ optimal: { ...doc.content.optimal, complexityVisualization: JSON.parse(val) } }); } catch {}
                  }}
                  rows={3}
                  placeholder='{"engine":"mermaid","code":"..."}'
                  className="font-mono rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
