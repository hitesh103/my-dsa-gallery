"use client";

import { useMemo, useState } from "react";

import type { ProblemDoc } from "@/lib/problemDoc";

type LoadResult = { problem: ProblemDoc } | { error: string };

function defaultPayload(): ProblemDoc {
  return {
    slug: "two-sum",
    title: "Two Sum",
    topic: "Arrays",
    pattern: "Hash Map",
    link: "https://leetcode.com/problems/two-sum/",
    content: {
      statementMd: "Write the problem statement here.",
      inputMd: "- Describe input",
      outputMd: "- Describe output",
      exampleMd: "```txt\ninput = ...\noutput = ...\n```",
      exampleExplanationMd: "Explain why the output is correct.",
      brute: {
        intuitionMd: "Intuition for brute force.",
        approachMd: "Approach steps for brute force.",
        visualization: {
          nodes: [
            { id: "A", position: { x: 0, y: 0 }, data: { label: "Start" } },
            { id: "B", position: { x: 180, y: 0 }, data: { label: "Brute" } },
            { id: "C", position: { x: 360, y: 0 }, data: { label: "Answer" } }
          ],
          edges: [
            { id: "eAB", source: "A", target: "B" },
            { id: "eBC", source: "B", target: "C" }
          ]
        },
        codeJava: "public class Solution {\n}\n",
        time: "O(?)",
        space: "O(?)",
        complexityExplanationMd: "- Explain time\n- Explain space",
      },
      optimal: {
        intuitionMd: "Intuition for optimal.",
        approachMd: "Approach steps for optimal.",
        visualization: {
          nodes: [
            { id: "A", position: { x: 0, y: 0 }, data: { label: "Start" } },
            { id: "B", position: { x: 180, y: 0 }, data: { label: "Optimal" } },
            { id: "C", position: { x: 360, y: 0 }, data: { label: "Answer" } }
          ],
          edges: [
            { id: "eAB", source: "A", target: "B" },
            { id: "eBC", source: "B", target: "C" }
          ]
        },
        codeJava: "public class Solution {\n}\n",
        time: "O(?)",
        space: "O(?)",
        complexityExplanationMd: "- Explain time\n- Explain space",
      },
      quickRevision: {
        brute: ["Bullet 1", "Bullet 2"],
        optimal: ["Bullet 1", "Bullet 2"],
      },
    },
  };
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export function JsonProblemEditor({
  onStatus,
}: {
  onStatus: (msg: string) => void;
}) {
  const [slug, setSlug] = useState("");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(defaultPayload(), null, 2));
  const [busy, setBusy] = useState(false);

  const authHeader = useMemo(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    return headers;
  }, []);

  const onTemplate = () => {
    setJsonText(JSON.stringify(defaultPayload(), null, 2));
    onStatus("Loaded template payload.");
  };

  const onLoad = async () => {
    const s = slug.trim();
    if (!s) {
      onStatus("Select a slug to load.");
      return;
    }
    if (!isValidSlug(s)) {
      onStatus("Invalid slug. Use lowercase a-z, 0-9, and hyphen only.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(s)}`, { cache: "no-store" });
      const json = (await res.json()) as LoadResult;
      if (!res.ok || "error" in json) throw new Error("error" in json ? json.error : "Load failed");
      setJsonText(JSON.stringify(json.problem, null, 2));
      onStatus(`Loaded ${s}.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      onStatus(msg);
    } finally {
      setBusy(false);
    }
  };

  const onUpsert = async () => {
    let payload: ProblemDoc;
    try {
      payload = JSON.parse(jsonText) as ProblemDoc;
    } catch {
      onStatus("Invalid JSON.");
      return;
    }

    const targetSlug = (payload.slug ?? "").trim();
    if (!targetSlug || !isValidSlug(targetSlug)) {
      onStatus("Payload must include a valid `slug` (lowercase a-z, 0-9, hyphen).");
      return;
    }
    if (!payload.title || !payload.topic || !payload.pattern || !payload.link || !payload.content) {
      onStatus("Payload missing required fields: title/topic/pattern/link/content.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Save failed");
      setSlug(targetSlug);
      onStatus(`Saved ${targetSlug}.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      onStatus(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug to load (e.g. jump-game-ii)"
          className="h-11 w-full sm:max-w-[200px] rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 min-h-[44px]"
        />
        <button
          type="button"
          onClick={onLoad}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 min-h-[44px]"
        >
          Load JSON
        </button>
        <button
          type="button"
          onClick={onTemplate}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 min-h-[44px]"
        >
          Template
        </button>
        <button
          type="button"
          onClick={onUpsert}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 min-h-[44px]"
        >
          {busy ? "Saving…" : "Upsert"}
        </button>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={16}
        spellCheck={false}
        className="w-full rounded-xl border bg-background px-3 py-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30"
      />

      <div className="text-xs text-muted-foreground">
        Paste a full JSON payload, then click “Upsert from JSON”. The payload’s <code>slug</code>{" "}
        decides which record is created/updated.
      </div>
    </div>
  );
}
