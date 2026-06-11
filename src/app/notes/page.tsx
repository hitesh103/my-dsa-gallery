import { AppShell } from "@/components/ui/AppShell";
import { listContentItems } from "@/lib/contentStore";
import type { ContentItemMeta } from "@/lib/contentDoc";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotesIndexPage() {
  let notes: ContentItemMeta[] = [];
  try {
    notes = await listContentItems({ type: "note" });
  } catch (e) {
    // Silently fail for now
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-2 mb-10">
          <p className="text-sm font-medium text-muted-foreground">Learning Resources</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Notes & Articles
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Deep dives into specific algorithms, data structures, and architectural patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link 
              key={note.slug} 
              href={`/notes/${note.slug}`}
              className="group flex flex-col p-6 rounded-xl border bg-card hover:border-primary transition-colors"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {note.title}
              </h3>
              {note.summary && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {note.summary}
                </p>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{note.topic || "General"}</span>
                <span>{new Date(note.updatedAt!).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}

          {notes.length === 0 && (
            <div className="col-span-full py-20 text-center border rounded-xl bg-muted/30">
              <p className="text-muted-foreground">No notes available yet.</p>
              <Link href="/admin/notes/new" className="mt-4 inline-block text-primary hover:underline font-medium">
                Create the first one
              </Link>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
