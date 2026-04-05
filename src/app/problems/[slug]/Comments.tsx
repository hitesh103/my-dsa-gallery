import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CommentBox } from "@/components/comments/CommentBox";
import { listComments } from "@/lib/commentsStore";

export async function Comments({ slug }: { slug: string }) {
  let comments: Awaited<ReturnType<typeof listComments>> = [];
  let error: string | null = null;
  try {
    comments = await listComments(slug, 80);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load comments";
  }

  return (
    <section className="mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentBox slug={slug} />

          {error ? (
            <div className="mt-4 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div className="mt-4 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              No comments yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl border bg-card p-3">
                  <div className="whitespace-pre-wrap text-sm">{c.body}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{c.createdAt}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

