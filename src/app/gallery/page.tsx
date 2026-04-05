import { listImages } from "@/lib/images";

import { UploadClient } from "./UploadClient";
import { ImageFigureClient } from "@/components/gallery/ImageFigureClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let images: Awaited<ReturnType<typeof listImages>> = [];
  let r2Error: string | null = null;
  try {
    images = await listImages({ prefix: "gallery/" });
  } catch (e) {
    r2Error = e instanceof Error ? e.message : "R2 is not configured.";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Clean, minimalist masonry grid for study screenshots.
        </p>
      </div>

      <div className="mt-6">
        <UploadClient />
      </div>

      {r2Error ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">R2 not configured</div>
          <div className="mt-1">
            {r2Error} Set env vars from <code>.env.example</code> (copy to{" "}
            <code>.env.local</code>) to enable listing images.
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          No photos uploaded till now.
        </div>
      ) : null}

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img) => (
          <div
            key={img.key}
            className="mb-4 break-inside-avoid"
          >
            <ImageFigureClient
              url={img.url}
              alt={img.key}
              caption={img.key.replace(/^gallery\//, "")}
              imageKey={img.key}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
