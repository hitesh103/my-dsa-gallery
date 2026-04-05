import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { getProblemBySlug } from "@/lib/problems";
import { githubEditUrl } from "@/lib/site";
import { toneForPattern, toneForTopic } from "@/lib/tags";
import { StudyImages } from "./StudyImages";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  const { meta, Content } = problem;
  const editUrl = githubEditUrl(`src/content/${meta.slug}.mdx`);

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
      <Content />
      <StudyImages slug={slug} />
    </main>
  );
}
