import { notFound } from "next/navigation";

import { ProblemDocView } from "@/components/dsa/ProblemDocView";
import { Badge } from "@/components/ui/Badge";
import { Prose } from "@/components/ui/Prose";
import { getProblem as getD1Problem } from "@/lib/problemStore";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { Comments } from "./Comments";
import { StudyImages } from "./StudyImages";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let d1Problem: Awaited<ReturnType<typeof getD1Problem>> = null;
  try {
    d1Problem = await getD1Problem(slug);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">D1 not configured</div>
          <div className="mt-1">{message}</div>
          <div className="mt-3 text-xs">
            Bind your D1 database as <code>DB</code> and redeploy, then seed
            from <code>/admin</code>.
          </div>
        </div>
      </main>
    );
  }
  if (!d1Problem) notFound();

  const meta = {
    slug: d1Problem.slug,
    title: d1Problem.title,
    topic: d1Problem.topic,
    pattern: d1Problem.pattern,
    link: d1Problem.link,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={toneForTopic(meta.topic)}>{meta.topic}</Badge>
          <Badge tone={toneForPattern(meta.pattern)}>{meta.pattern}</Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={meta.link}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border px-3 py-2.5 text-xs font-medium hover:bg-muted min-h-[44px]"
          >
            Open Problem
          </a>
          <a
            href={`/admin/problems/${slug}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border px-3 py-2.5 text-xs font-medium hover:bg-muted min-h-[44px]"
          >
            Edit
          </a>
        </div>
      </div>
      <Prose>
        <ProblemDocView problem={d1Problem} />
      </Prose>
      <StudyImages slug={slug} />
      <Comments slug={slug} />
    </main>
  );
}
