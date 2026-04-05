import { ProblemEditorClient } from "../[slug]/ui/ProblemEditorClient";

export const dynamic = "force-dynamic";

export default function NewProblemPage() {
  // Uses the same editor, but with "new" slug; the client will switch to create mode.
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProblemEditorClient slug="new" />
    </main>
  );
}

