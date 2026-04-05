import { RevisionCard } from "@/components/dsa/RevisionCard";

export function QuickRevision({
  brute,
  optimal,
}: {
  brute: string[];
  optimal: string[];
}) {
  return (
    <div className="not-prose mt-8 grid gap-4 md:grid-cols-2">
      <RevisionCard title="Quick Revision (Brute Force)" items={brute} />
      <RevisionCard title="Quick Revision (Optimal)" items={optimal} />
    </div>
  );
}

