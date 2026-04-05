"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { ImageDeleteButton } from "@/components/gallery/ImageDeleteButton";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";

export function ImageFigureClient({
  url,
  alt,
  caption,
  imageKey,
  showDelete = true,
  className,
}: {
  url: string;
  alt: string;
  caption: string;
  imageKey?: string;
  showDelete?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <figure className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label="Open image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="h-auto w-full" loading="lazy" />
      </button>

      <figcaption className="flex items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">{caption}</span>
        {showDelete && imageKey ? <ImageDeleteButton imageKey={imageKey} /> : null}
      </figcaption>

      <ImageLightbox
        open={open}
        src={url}
        alt={alt}
        caption={caption}
        onClose={() => setOpen(false)}
      />
    </figure>
  );
}

