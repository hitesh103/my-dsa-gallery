import { notFound } from "next/navigation";
import { getContentItem } from "@/lib/contentStore";
import { ContentItemView } from "@/components/dsa/ContentItemView";
import { Prose } from "@/components/ui/Prose";
import { isAdminPageRequest } from "@/lib/adminPageGuard";
import Link from "next/link";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getContentItem(slug);
  const isAdmin = await isAdminPageRequest();

  if (!doc) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/notes" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          ← Back to all notes
        </Link>
        {isAdmin && (
          <Link
            href={`/admin/notes/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Edit Note
          </Link>
        )}
      </div>
      <Prose>
        <ContentItemView doc={doc} />
      </Prose>
    </main>
  );
}
