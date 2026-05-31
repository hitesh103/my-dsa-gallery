import { cookies } from "next/headers";

import { isAdminRequest, getSessionTokenFromCookieHeader } from "@/lib/adminSession";
import { listImages } from "@/lib/images";

import { UploadClient } from "./UploadClient";
import { ImageFigureClient } from "@/components/gallery/ImageFigureClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const isAdmin = await isAdminRequest(new Request("http://localhost", { headers: { cookie: cookieHeader } }));

  let images: Awaited<ReturnType<typeof listImages>> = [];
  let r2Error: string | null = null;
  
  if (isAdmin) {
    try {
      images = await listImages({ prefix: "gallery/" });
    } catch (e) {
      r2Error = e instanceof Error ? e.message : "R2 is not configured.";
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
      <section className="overflow-hidden rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-7">
        <p className="text-sm font-medium text-muted-foreground">Study visuals</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Gallery
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Masonry grid for screenshots and whiteboard photos tied to your revision sessions.
        </p>
      </section>

      {isAdmin ? (
        <div className="mt-6">
          <UploadClient />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <a href="/admin" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in as admin
          </a>{" "}
          to upload photos.
        </div>
      )}

      {r2Error ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">R2 not configured</div>
          <div className="mt-1">
            {r2Error} Set env vars from <code>.env.example</code> (copy to{" "}
            <code>.env.local</code>) to enable listing images.
          </div>
        </div>
      ) : images.length === 0 && isAdmin ? (
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          No photos uploaded till now.
        </div>
      ) : images.length > 0 ? (
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
      ) : null}
    </main>
  );
}
