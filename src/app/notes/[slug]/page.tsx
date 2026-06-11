import { notFound } from "next/navigation";
import { getContentItem } from "@/lib/contentStore";
import { ContentItemView } from "@/components/dsa/ContentItemView";
import { Prose } from "@/components/ui/Prose";
import Link from "next/link";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getContentItem(slug);

  if (!doc) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <Link href="/notes" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          ← Back to all notes
        </Link>
      </div>
      <Prose>
        <ContentItemView doc={doc} />
      </Prose>
    </main>
  );
}
