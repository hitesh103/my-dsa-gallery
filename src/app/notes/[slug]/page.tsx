import { notFound } from "next/navigation";
import { getContentItem } from "@/lib/contentStore";
import { ContentItemView } from "@/components/dsa/ContentItemView";
import { AppShell } from "@/components/ui/AppShell";
import { Prose } from "@/components/ui/Prose";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getContentItem(slug);

  if (!doc || doc.type !== "note") notFound();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        <div className="mb-6">
          <a href="/notes" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            ← Back to all notes
          </a>
        </div>
        <Prose>
          <ContentItemView doc={doc} />
        </Prose>
      </main>
    </AppShell>
  );
}
