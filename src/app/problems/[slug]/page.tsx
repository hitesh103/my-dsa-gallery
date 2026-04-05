import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { getProblemBySlug } from "@/lib/problems";
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge>Topic: {meta.topic}</Badge>
        <Badge>Pattern: {meta.pattern}</Badge>
      </div>
      <Content />
      <StudyImages slug={slug} />
    </main>
  );
}
