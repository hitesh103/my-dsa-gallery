"use client";

import { useEffect } from "react";

import { cn } from "@/lib/cn";

export function ImageLightbox({
  open,
  src,
  alt,
  caption,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-xs text-zinc-200">{caption ?? alt}</div>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium",
                "border-white/20 bg-white/10 text-white hover:bg-white/15",
              )}
            >
              Open
            </a>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium",
                "border-white/20 bg-white/10 text-white hover:bg-white/15",
              )}
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] w-full object-contain"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

