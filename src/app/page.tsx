import NextLink from "next/link";


export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-14">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Minimalist DSA & Study Gallery
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Clean write-ups (intuition → brute force → optimal) with Java-first
          code blocks, plus a masonry image gallery backed by Cloudflare R2.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <NextLink
            href="/problems"
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Browse Problems
          </NextLink>
          <NextLink
            href="/gallery"
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Open Gallery
          </NextLink>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm font-medium">Shadcn-style UI</div>
          <div className="mt-1 text-sm text-muted-foreground">
            High-contrast zinc palette, no neon/glow.
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm font-medium">Java Highlighting</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Prism-powered highlighting for all code blocks.
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm font-medium">Cloudflare R2</div>
          <div className="mt-1 text-sm text-muted-foreground">
            List objects + presigned uploads via `@aws-sdk/client-s3`.
          </div>
        </div>
      </section>
    </main>
  );
}
