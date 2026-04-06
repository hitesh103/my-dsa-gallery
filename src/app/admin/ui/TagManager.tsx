"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Tag = {
  id: number;
  name: string;
  type: "topic" | "pattern";
  createdAt: string;
};

type ApiTags = { tags: Tag[] } | { error: string };

export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState<"topic" | "pattern">("topic");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tags");
      const json = (await res.json()) as ApiTags;
      if ("error" in json) throw new Error(json.error);
      setTags(json.tags || []);
      setStatus(null);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: newTagType }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setNewTagName("");
      await fetchTags();
      setStatus("Tag added.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to add tag");
    }
  };

  const handleDeleteTag = async (id: number) => {
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await fetchTags();
      setStatus("Tag deleted.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to delete tag");
    }
  };

  const topics = tags.filter((t) => t.type === "topic");
  const patterns = tags.filter((t) => t.type === "pattern");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
            {status}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAddTag();
            }}
            placeholder="New tag name..."
            className="h-10 flex-1 min-w-[200px] rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <select
            value={newTagType}
            onChange={(e) => setNewTagType(e.target.value as "topic" | "pattern")}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="topic">Topic</option>
            <option value="pattern">Pattern</option>
          </select>
          <button
            type="button"
            onClick={() => void handleAddTag()}
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted min-h-[44px]"
          >
            Add Tag
          </button>
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Topics ({topics.length})</h4>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <Badge key={t.id} tone="blue" className="pr-1">
                    {t.name}
                    <button
                      type="button"
                      onClick={() => void handleDeleteTag(t.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      aria-label={`Delete ${t.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18,6 L6,18 M6,6 L18,18" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {topics.length === 0 && (
                  <span className="text-sm text-muted-foreground">No topics</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Patterns ({patterns.length})</h4>
              <div className="flex flex-wrap gap-2">
                {patterns.map((t) => (
                  <Badge key={t.id} tone="purple" className="pr-1">
                    {t.name}
                    <button
                      type="button"
                      onClick={() => void handleDeleteTag(t.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      aria-label={`Delete ${t.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18,6 L6,18 M6,6 L18,18" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {patterns.length === 0 && (
                  <span className="text-sm text-muted-foreground">No patterns</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
