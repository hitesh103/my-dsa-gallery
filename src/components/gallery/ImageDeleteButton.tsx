"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAdminToken } from "@/lib/adminToken";
import { cn } from "@/lib/cn";

export function ImageDeleteButton({
  imageKey,
  className,
}: {
  imageKey: string;
  className?: string;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToken(getAdminToken());
  }, []);

  if (!token) return null;

  const onDelete = async () => {
    if (busy) return;
    const ok = window.confirm("Delete this image?");
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/images?key=${encodeURIComponent(imageKey)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900",
        className,
      )}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

