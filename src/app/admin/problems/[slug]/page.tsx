import { notFound } from "next/navigation";

import { ProblemEditorClient } from "./ui/ProblemEditorClient";
import { AdminLogin } from "@/app/admin/ui/AdminLogin";
import { isAdminPageRequest } from "@/lib/adminPageGuard";

export const dynamic = "force-dynamic";

export default async function AdminProblemEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const ok = await isAdminPageRequest();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {ok ? <ProblemEditorClient slug={slug} /> : <AdminLogin />}
    </main>
  );
}
