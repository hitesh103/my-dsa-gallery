import { UploadClient } from "@/components/gallery/UploadClient";
import { ImageFigureClient } from "@/components/gallery/ImageFigureClient";
import { listImages } from "@/lib/images";

export async function StudyImages({ slug }: { slug: string }) {
  const prefix = `problems/${slug}/`;

  let images: Awaited<ReturnType<typeof listImages>> = [];
  let r2Error: string | null = null;
  try {
    images = await listImages({ prefix });
  } catch (e) {
    r2Error = e instanceof Error ? e.message : "R2 is not configured.";
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">Study Photos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload screenshots/notes for this specific problem.
      </p>

      <div className="mt-4">
        <UploadClient prefix={prefix} />
      </div>

      {r2Error ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">R2 not configured</div>
          <div className="mt-1">
            {r2Error} Set env vars from <code>.env.example</code> (copy to{" "}
            <code>.env.local</code>) to enable uploads and listing.
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          No photos uploaded till now.
        </div>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2">
          {images.map((img) => (
            <div
              key={img.key}
              className="mb-4 break-inside-avoid"
            >
              <ImageFigureClient
                url={img.url}
                alt={img.key}
                caption={img.key.replace(prefix, "")}
                imageKey={img.key}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
