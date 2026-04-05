import { notFound } from "next/navigation";

import { ProblemEditorClient } from "./ui/ProblemEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminProblemEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProblemEditorClient slug={slug} />
    </main>
  );
}

