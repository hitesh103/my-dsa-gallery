"use client";

import { useState } from "react";
import type { ContentItemDoc } from "@/lib/contentDoc";

function defaultPayload(): ContentItemDoc {
  return {
    slug: "my-new-note",
    type: "note",
    title: "My New Note",
    summary: "A brief overview of this note.",
    status: "draft",
    visibility: "public",
    tags: ["arrays", "two-pointer"],
    content: {
      format: "sections",
      sections: [
        {
          id: "sec1",
          kind: "markdown",
          title: "Introduction",
          bodyMd: "Write your introduction here.\n\nUse **markdown** for formatting.",
        },
        {
          id: "sec2",
          kind: "example",
          title: "Example",
          bodyMd: "```txt\nInput: nums = [1, 2, 3]\nOutput: 6\n```",
        },
        {
          id: "sec3",
          kind: "callout",
          title: "Key Takeaway",
          bodyMd: "> This is an important insight worth remembering.",
        },
      ],
    },
    revisionJson: ["Key revision point 1", "Key revision point 2"],
    mistakesJson: ["Common mistake to avoid"],
    visualsJson: [],
  };
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export function JsonContentEditor({
  onStatus,
}: {
  onStatus: (msg: string) => void;
}) {
  const [slug, setSlug] = useState("");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(defaultPayload(), null, 2));
  const [busy, setBusy] = useState(false);

  const onTemplate = () => {
    setJsonText(JSON.stringify(defaultPayload(), null, 2));
    onStatus("Loaded template payload.");
  };

  const onLoad = async () => {
    const s = slug.trim();
    if (!s) {
      onStatus("Enter a slug to load.");
      return;
    }
    if (!isValidSlug(s)) {
      onStatus("Invalid slug. Use lowercase a-z, 0-9, and hyphen only.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content?slug=${encodeURIComponent(s)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Load failed");
      setJsonText(JSON.stringify(json, null, 2));
      onStatus(`Loaded ${s}.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      onStatus(msg);
    } finally {
      setBusy(false);
    }
  };

  const onUpsert = async () => {
    let payload: ContentItemDoc;
    try {
      payload = JSON.parse(jsonText) as ContentItemDoc;
    } catch {
      onStatus("Invalid JSON.");
      return;
    }

    const targetSlug = (payload.slug ?? "").trim();
    if (!targetSlug || !isValidSlug(targetSlug)) {
      onStatus("Payload must include a valid `slug` (lowercase a-z, 0-9, hyphen).");
      return;
    }
    if (!payload.title || !payload.type || !payload.content) {
      onStatus("Payload missing required fields: slug, title, type, content.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Save failed");
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
          placeholder="slug to load (e.g. my-new-note)"
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
        Paste a full JSON payload, then click "Upsert from JSON". The payload's <code>slug</code>{" "}
        decides which record is created/updated. Supports notes, articles, and blogs.
      </div>
    </div>
  );
}
