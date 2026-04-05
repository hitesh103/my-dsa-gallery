"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { cn } from "@/lib/cn";

export function CommentBox({ slug, className }: { slug: string; className?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const { loggedIn } = useAdminAuth();

  const onPost = async () => {
    if (!loggedIn) {
      window.alert("Login at /admin to add comments.");
      return;
    }
    const body = text.trim();
    if (!body) return;

    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug, body }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to add comment");
      setText("");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      window.alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a short revision note…"
        rows={4}
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Stored in D1. {loggedIn ? "Admin enabled." : "Login required."}
        </div>
        <button
          type="button"
          onClick={onPost}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
        >
          {busy ? "Posting…" : "Add comment"}
        </button>
      </div>
    </div>
  );
}
