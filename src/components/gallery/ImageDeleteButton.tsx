"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { cn } from "@/lib/cn";

export function ImageDeleteButton({
  imageKey,
  className,
}: {
  imageKey: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { loggedIn } = useAdminAuth();

  if (!loggedIn) return null;

  const onDelete = async () => {
    if (busy) return;
    const ok = window.confirm("Delete this image?");
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/images?key=${encodeURIComponent(imageKey)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Delete failed");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      window.alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-1 text-[11px] font-medium",
        "border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50",
        className,
      )}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
