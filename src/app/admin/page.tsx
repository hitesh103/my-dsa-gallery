import { AdminClient } from "./ui/AdminClient";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Seed problems into D1 and edit write-ups (stored in D1).
        </p>
      </div>

      <div className="mt-6">
        <AdminClient />
      </div>
    </main>
  );
}

