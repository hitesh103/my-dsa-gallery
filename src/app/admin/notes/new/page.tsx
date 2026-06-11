"use client";

import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { ContentEditor } from "@/app/admin/ui/ContentEditor";
import { AppShell } from "@/components/ui/AppShell";

export default function NewNotePage() {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) return null;
  if (!isAdmin) return <div className="p-10 text-center">Unauthorized</div>;

  const handleSave = async (doc: any) => {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save");
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Create New Note</h1>
        <ContentEditor 
          initialDoc={{ type: "note", status: "published" }} 
          onSave={handleSave} 
        />
      </main>
    </AppShell>
  );
}
