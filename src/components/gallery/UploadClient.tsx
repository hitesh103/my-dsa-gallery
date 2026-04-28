"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

export function UploadClient({
  prefix = "gallery/",
  className,
}: {
  prefix?: string;
  className?: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const disabled = useMemo(() => status === "uploading" || !file, [status, file]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    }
  }, []);

  const onUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError(null);

    try {
      const presignRes = await fetch("/api/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, prefix }),
      });
      if (!presignRes.ok) throw new Error("Failed to create upload URL");
      const { url, headers } = (await presignRes.json()) as {
        url: string;
        headers: Record<string, string>;
      };

      const put = await fetch(url, { method: "PUT", headers, body: file });
      if (!put.ok) throw new Error("Upload failed");

      setStatus("done");
      setFile(null);
      router.refresh();
      window.setTimeout(() => setStatus("idle"), 1200);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-4 text-card-foreground",
        isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onUpload}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium",
            "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50",
            "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
          )}
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
        <div className="text-xs text-muted-foreground">
          {status === "done" ? "Uploaded" : "Drag & drop or click to select"}
        </div>
      </div>
      {file && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-blue-600 dark:text-blue-400">Selected:</span>
          <span className="font-medium">{file.name}</span>
        </div>
      )}
      {error ? <div className="text-xs text-red-600 dark:text-red-400">{error}</div> : null}
      <div className="mt-2 text-xs text-muted-foreground">
        Drop an image anywhere in this box to upload.
      </div>
    </div>
  );
}

