import { notFound } from "next/navigation";

import { ProblemDocView } from "@/components/dsa/ProblemDocView";
import { Badge } from "@/components/ui/Badge";
import { Prose } from "@/components/ui/Prose";
import { getProblemBySlug } from "@/lib/problems";
import { getProblem as getD1Problem } from "@/lib/problemStore";
import { githubEditUrl } from "@/lib/site";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { StudyImages } from "./StudyImages";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let d1Problem = null as Awaited<ReturnType<typeof getD1Problem>>;
  try {
    d1Problem = await getD1Problem(slug);
  } catch {
    // D1 not configured or unavailable; fall back to MDX.
  }

  const problem = d1Problem ? null : await getProblemBySlug(slug);
  if (!d1Problem && !problem) notFound();

  const meta = d1Problem
    ? {
        slug: d1Problem.slug,
        title: d1Problem.title,
        topic: d1Problem.topic,
        pattern: d1Problem.pattern,
        link: d1Problem.link,
      }
    : problem!.meta;

  const editUrl = githubEditUrl(`src/content/${meta.slug}.mdx`);
  const Content = problem?.Content;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={toneForTopic(meta.topic)}>{meta.topic}</Badge>
          <Badge tone={toneForPattern(meta.pattern)}>{meta.pattern}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={meta.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Open Problem
          </a>
          <a
            href={`/admin/problems/${slug}`}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Edit in App
          </a>
          {editUrl ? (
            <a
              href={editUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Edit Content
            </a>
          ) : null}
        </div>
      </div>
      {d1Problem ? (
        <Prose>
          <ProblemDocView problem={d1Problem} />
        </Prose>
      ) : (
        Content ? <Content /> : null
      )}
      <StudyImages slug={slug} />
    </main>
  );
}
