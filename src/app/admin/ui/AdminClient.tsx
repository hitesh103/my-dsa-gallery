"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AdminDashboardData } from "@/lib/adminDashboard";
import type { ProblemContent } from "@/lib/problemDoc";
import type { AdminProblemSummary } from "@/lib/problemStore";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { JsonProblemEditor } from "./JsonProblemEditor";
import { JsonContentEditor } from "./JsonContentEditor";
import { AdminSqlConsole } from "./AdminSqlConsole";
import { TagManager } from "./TagManager";

type Tag = {
  id: number;
  name: string;
  type: "topic" | "pattern";
  createdAt: string;
};

type ApiProblems = { problems: AdminProblemSummary[] } | { error: string };
type ApiTags = { tags: Tag[] } | { error: string };
type DashboardResponse = AdminDashboardData | { error: string };

type QuickCreateForm = {
  title: string;
  slug: string;
  topic: string;
  pattern: string;
  link: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    optimal: {
      intuitionMd: "",
      approachMd: "",
      visualization: null,
      codeJava: "",
      time: "",
      space: "",
      complexityExplanationMd: "",
    },
    quickRevision: { brute: [], optimal: [] },
  };
}

function buildProblemPayload(form: QuickCreateForm) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    topic: form.topic.trim(),
    pattern: form.pattern.trim(),
    link: form.link.trim(),
    content: emptyContent(),
  };
}

function formatDate(value: string | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function scoreTone(score: number) {
  if (score >= 100) return "emerald";
  if (score >= 67) return "amber";
  return "rose";
}

export function AdminClient() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [problems, setProblems] = useState<AdminProblemSummary[]>([]);
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [onlyNeedsWork, setOnlyNeedsWork] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [createForm, setCreateForm] = useState<QuickCreateForm>({
    title: "",
    slug: "",
    topic: "",
    pattern: "",
    link: "",
  });

  const [creatingNote, setCreatingNote] = useState(false);
  const [noteSlugTouched, setNoteSlugTouched] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    slug: "",
    summary: "",
    type: "note" as "note" | "article" | "blog",
    topic: "",
  });

  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const json = (await res.json()) as DashboardResponse;
      if (!res.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Failed to load dashboard");
      }
      setDashboard(json);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load dashboard");
      setDashboard(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadTags = async () => {
    try {
      const res = await fetch("/api/tags", { cache: "no-store" });
      const json = (await res.json()) as ApiTags;
      if (!res.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Failed to load tags");
      }
      setTags(json.tags);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load tags");
      setTags([]);
    }
  };

  const loadProblems = async ({
    q = query,
    topic = topicFilter,
    pattern = patternFilter,
  }: {
    q?: string;
    topic?: string;
    pattern?: string;
  } = {}) => {
    setIsLoadingProblems(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (topic !== "all") params.set("topic", topic);
      if (pattern !== "all") params.set("pattern", pattern);
      params.set("limit", "200");

      const res = await fetch(`/api/admin/problems?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ApiProblems;
      if (!res.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Failed to load problems");
      }
      setProblems(json.problems);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load problems");
      setProblems([]);
    } finally {
      setIsLoadingProblems(false);
    }
  };

  const runInitialLoad = useEffectEvent(async () => {
    await Promise.all([loadDashboard(), loadTags()]);
  });

  const runProblemSearch = useEffectEvent(
    async (q: string, topic: string, pattern: string) => {
      await loadProblems({ q, topic, pattern });
    },
  );

  useEffect(() => {
    void runInitialLoad();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      if (cancelled) return;
      await runProblemSearch(query, topicFilter, patternFilter);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query, topicFilter, patternFilter]);

  const refreshAll = async () => {
    await Promise.all([
      loadDashboard(),
      loadTags(),
      loadProblems({ q: query, topic: topicFilter, pattern: patternFilter }),
    ]);
  };

  const onSeed = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string; seeded?: number; message?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Seed failed");
      setStatus(json.message ?? `Seeded ${json.seeded ?? 0} sample problems.`);
      await refreshAll();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Seed failed");
    }
  };

  const onSeedStriver = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/seed-striver", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string; seeded?: number; message?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Seed failed");
      setStatus(json.message ?? `Seeded ${json.seeded ?? 0} Striver problems.`);
      await refreshAll();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Seed failed");
    }
  };

  const onDeleteProblem = async (slug: string) => {
    if (!confirm(`Delete problem "${slug}"?`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Delete failed");
      setStatus(`Deleted "${slug}".`);
      await refreshAll();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed");
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
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Logout failed");
    }
  };

  const onCreateNote = async () => {
    const payload = {
      slug: noteForm.slug.trim(),
      type: noteForm.type,
      title: noteForm.title.trim(),
      summary: noteForm.summary.trim() || undefined,
      topic: noteForm.topic.trim() || undefined,
      status: "draft",
      visibility: "public",
      tags: [],
      content: {
        format: "sections" as const,
        sections: [],
      },
      revisionJson: [],
      mistakesJson: [],
      visualsJson: [],
    };

    if (!payload.slug || !payload.title) {
      setStatus("Fill title and slug before creating a note.");
      return;
    }

    setCreatingNote(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Create failed");
      setStatus(`Created "${
        payload.slug
      }". Opening editor.`);
      await refreshAll();
      router.push(`/admin/notes/${payload.slug}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreatingNote(false);
    }
  };

  const onCreateProblem = async () => {
    const payload = buildProblemPayload(createForm);
    if (!payload.slug || !payload.title || !payload.topic || !payload.pattern || !payload.link) {
      setStatus("Fill title, slug, topic, pattern, and link before creating a problem.");
      return;
    }

    setCreating(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(payload.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Create failed");
      setStatus(`Created "${payload.slug}". Opening editor.`);
      await refreshAll();
      router.push(`/admin/problems/${payload.slug}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const filteredProblems = useMemo(() => {
    if (!onlyNeedsWork) return problems;
    return problems.filter((problem) => !problem.isRevisionReady);
  }, [onlyNeedsWork, problems]);

  const topics = useMemo(() => {
    const fromTags = tags.filter((tag) => tag.type === "topic").map((tag) => tag.name);
    const values = fromTags.length > 0 ? fromTags : problems.map((problem) => problem.topic);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [problems, tags]);

  const patterns = useMemo(() => {
    const fromTags = tags.filter((tag) => tag.type === "pattern").map((tag) => tag.name);
    const values = fromTags.length > 0 ? fromTags : problems.map((problem) => problem.pattern);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [problems, tags]);

  const statCards = dashboard
    ? [
        { label: "Problems", value: dashboard.stats.totalProblems.toString(), tone: "blue" as const },
        { label: "Revision Ready", value: dashboard.stats.revisionReady.toString(), tone: "emerald" as const },
        { label: "Needs Work", value: dashboard.stats.needsWork.toString(), tone: "amber" as const },
        { label: "Comments", value: dashboard.stats.totalComments.toString(), tone: "slate" as const },
        { label: "Open Tasks", value: dashboard.stats.openTodos.toString(), tone: "rose" as const },
        { label: "Tags", value: dashboard.stats.totalTags.toString(), tone: "purple" as const },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>Admin Workspace</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/problems/new"
                className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                Full Editor
              </Link>
              <button
                type="button"
                onClick={() => void refreshAll()}
                className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void onSeedStriver()}
                className="inline-flex items-center justify-center rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-2 text-xs font-medium hover:bg-blue-500/20"
              >
                Seed Striver
              </button>
              <button
                type="button"
                onClick={() => void onSeed()}
                className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                Seed Samples
              </button>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                Logout
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Cloudflare-first control panel for D1 content, search, deletes, and direct SQL work.
          </div>
          {status ? (
            <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground whitespace-pre-wrap">{status}</div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoadingDashboard
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="h-[96px] animate-pulse bg-muted/30" />
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{card.label}</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</div>
                  </div>
                  <Badge tone={card.tone}>{card.label}</Badge>
                </CardContent>
              </Card>
            ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>Question Explorer</span>
            <span className="text-xs font-normal text-muted-foreground">
              {filteredProblems.length} result{filteredProblems.length === 1 ? "" : "s"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="title, slug, topic, pattern"
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">All topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pattern</span>
              <select
                value={patternFilter}
                onChange={(e) => setPatternFilter(e.target.value)}
                className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">All patterns</option>
                {patterns.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {pattern}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyNeedsWork}
                onChange={(e) => setOnlyNeedsWork(e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              <span>Needs work only</span>
            </label>
          </div>

          {isLoadingProblems ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Loading questions…
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No questions match the current filters.
            </div>
          ) : (
            <ul className="divide-y">
              {filteredProblems.map((problem) => (
                <li key={problem.slug} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold">{problem.title}</div>
                        <Badge tone={scoreTone(problem.completenessScore)}>
                          {problem.completenessScore}% ready
                        </Badge>
                        {!problem.isRevisionReady ? (
                          <Badge tone="amber">{problem.missingParts.length} gaps</Badge>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">{problem.slug}</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={toneForTopic(problem.topic)}>{problem.topic}</Badge>
                        <Badge tone={toneForPattern(problem.pattern)}>{problem.pattern}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatDate(problem.updatedAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {problem.missingParts.length > 0
                          ? `Missing: ${problem.missingParts.join(", ")}`
                          : "Complete enough for fast revision."}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/admin/problems/${problem.slug}`}
                        className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDeleteProblem(problem.slug)}
                        disabled={deletingSlug === problem.slug}
                        className="inline-flex items-center justify-center rounded-lg border border-destructive/50 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        {deletingSlug === problem.slug ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Create</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Title</span>
                  <input
                    value={createForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCreateForm((current) => ({
                        ...current,
                        title,
                        slug: slugTouched ? current.slug : slugify(title),
                      }));
                    }}
                    placeholder="Example: Two Sum"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Slug</span>
                  <input
                    value={createForm.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setCreateForm((current) => ({ ...current, slug: slugify(e.target.value) }));
                    }}
                    placeholder="two-sum"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Topic</span>
                  <input
                    list="admin-topics"
                    value={createForm.topic}
                    onChange={(e) =>
                      setCreateForm((current) => ({ ...current, topic: e.target.value }))
                    }
                    placeholder="Arrays"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Pattern</span>
                  <input
                    list="admin-patterns"
                    value={createForm.pattern}
                    onChange={(e) =>
                      setCreateForm((current) => ({ ...current, pattern: e.target.value }))
                    }
                    placeholder="Hash Map"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Problem Link</span>
                  <input
                    value={createForm.link}
                    onChange={(e) =>
                      setCreateForm((current) => ({ ...current, link: e.target.value }))
                    }
                    placeholder="https://leetcode.com/problems/two-sum/"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
              </div>

              <datalist id="admin-topics">
                {topics.map((topic) => (
                  <option key={topic} value={topic} />
                ))}
              </datalist>
              <datalist id="admin-patterns">
                {patterns.map((pattern) => (
                  <option key={pattern} value={pattern} />
                ))}
              </datalist>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onCreateProblem()}
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create and Open"}
                </button>
                <Link
                  href="/admin/problems/new"
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Blank Editor
                </Link>
              </div>

              <div className="text-xs text-muted-foreground">
                Creates a minimal D1 record immediately, then opens the full editor for the write-up.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Revision Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.recentProblems?.length ? (
                <ul className="space-y-3">
                  {dashboard.recentProblems.map((problem) => (
                    <li key={problem.slug} className="rounded-xl border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{problem.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{problem.slug}</div>
                        </div>
                        <Badge tone={scoreTone(problem.completenessScore)}>
                          {problem.completenessScore}%
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone={toneForTopic(problem.topic)}>{problem.topic}</Badge>
                        <Badge tone={toneForPattern(problem.pattern)}>{problem.pattern}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/problems/${problem.slug}`}
                          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                        >
                          Open
                        </Link>
                        <Link
                          href={`/admin/problems/${problem.slug}`}
                          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                        >
                          Edit
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No recent questions yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Create Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Type</span>
                  <select
                    value={noteForm.type}
                    onChange={(e) =>
                      setNoteForm((current) => ({
                        ...current,
                        type: e.target.value as "note" | "article" | "blog",
                      }))
                    }
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="note">Note</option>
                    <option value="article">Article</option>
                    <option value="blog">Blog</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Title</span>
                  <input
                    value={noteForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNoteForm((current) => ({
                        ...current,
                        title,
                        slug: noteSlugTouched ? current.slug : slugify(title),
                      }));
                    }}
                    placeholder="Example: Binary Search Basics"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Slug</span>
                  <input
                    value={noteForm.slug}
                    onChange={(e) => {
                      setNoteSlugTouched(true);
                      setNoteForm((current) => ({ ...current, slug: slugify(e.target.value) }));
                    }}
                    placeholder="binary-search-basics"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Summary</span>
                  <input
                    value={noteForm.summary}
                    onChange={(e) =>
                      setNoteForm((current) => ({ ...current, summary: e.target.value }))
                    }
                    placeholder="Brief overview of the note"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Topic</span>
                  <input
                    list="admin-topics"
                    value={noteForm.topic}
                    onChange={(e) =>
                      setNoteForm((current) => ({ ...current, topic: e.target.value }))
                    }
                    placeholder="Arrays"
                    className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onCreateNote()}
                  disabled={creatingNote}
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {creatingNote ? "Creating…" : "Create and Open"}
                </button>
                <Link
                  href="/admin/notes/new"
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Blank Editor
                </Link>
              </div>

              <div className="text-xs text-muted-foreground">
                Creates a minimal D1 record immediately, then opens the full editor for the write-up.
              </div>
            </CardContent>
          </Card>

          <TagManager />
        </div>

        <div className="space-y-6">
          <AdminSqlConsole
            schemaTables={dashboard?.schemaTables ?? []}
            queryExamples={dashboard?.queryExamples ?? []}
            onChanged={async () => {
              await refreshAll();
            }}
            onStatus={(message) => setStatus(message)}
          />

          <Card>
            <CardHeader>
              <CardTitle>JSON Editor (Problems)</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonProblemEditor onStatus={(message) => setStatus(message)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JSON Editor (Notes)</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonContentEditor onStatus={(message) => setStatus(message)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
