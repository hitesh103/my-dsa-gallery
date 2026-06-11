"use client";

import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { ContentEditor } from "@/app/admin/ui/ContentEditor";
import { AppShell } from "@/components/ui/AppShell";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ContentItemDoc } from "@/lib/contentDoc";

export default function EditNotePage() {
  const { slug } = useParams();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [doc, setDoc] = useState<ContentItemDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/admin/content?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          setDoc(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (authLoading || loading) return null;
  if (!isAdmin) return <div className="p-10 text-center">Unauthorized</div>;
  if (!doc) return <div className="p-10 text-center">Note not found</div>;

  const handleSave = async (updatedDoc: ContentItemDoc) => {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDoc),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save");
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Edit Note</h1>
        <ContentEditor initialDoc={doc} onSave={handleSave} />
      </main>
    </AppShell>
  );
}
