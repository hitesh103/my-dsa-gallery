import { ProblemEditorClient } from "../[slug]/ui/ProblemEditorClient";
import { AdminLogin } from "@/app/admin/ui/AdminLogin";
import { isAdminPageRequest } from "@/lib/adminPageGuard";

export const dynamic = "force-dynamic";

export default async function NewProblemPage() {
  // Uses the same editor, but with "new" slug; the client will switch to create mode.
  const ok = await isAdminPageRequest();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 pb-24 sm:pb-10">
      {ok ? <ProblemEditorClient slug="new" /> : <AdminLogin />}
    </main>
  );
}
