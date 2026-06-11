"use client";

import { useState, useEffect } from "react";
import { Markdown } from "@/components/dsa/Markdown";
import { ContentItemView } from "@/components/dsa/ContentItemView";
import type { ContentItemDoc, ContentItemSection } from "@/lib/contentDoc";

interface ContentEditorProps {
  initialDoc?: Partial<ContentItemDoc>;
  onSave: (doc: ContentItemDoc) => Promise<void>;
}

export function ContentEditor({ initialDoc, onSave }: ContentEditorProps) {
  const [doc, setDoc] = useState<ContentItemDoc>({
    slug: initialDoc?.slug || "",
    type: initialDoc?.type || "note",
    title: initialDoc?.title || "",
    summary: initialDoc?.summary || "",
    status: initialDoc?.status || "draft",
    visibility: initialDoc?.visibility || "public",
    topic: initialDoc?.topic || "",
    content: initialDoc?.content || { format: "sections", sections: [] },
    tags: initialDoc?.tags || [],
    revisionJson: initialDoc?.revisionJson || [],
    mistakesJson: initialDoc?.mistakesJson || [],
    visualsJson: initialDoc?.visualsJson || [],
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "json">("edit");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync jsonText when switching to json tab
  useEffect(() => {
    if (activeTab === "json") {
      setJsonText(JSON.stringify(doc, null, 2));
      setJsonError(null);
    }
  }, [activeTab]); // Only sync when entering the tab

  const addSection = () => {
    const newSection: ContentItemSection = {
      id: Math.random().toString(36).substring(2, 9),
      kind: "markdown",
      title: "",
      bodyMd: "",
    };
    setDoc({
      ...doc,
      content: {
        ...doc.content,
        sections: [...doc.content.sections, newSection],
      },
    });
  };

  const updateSection = (id: string, updates: Partial<ContentItemSection>) => {
    setDoc({
      ...doc,
      content: {
        ...doc.content,
        sections: doc.content.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      },
    });
  };

  const removeSection = (id: string) => {
    setDoc({
      ...doc,
      content: {
        ...doc.content,
        sections: doc.content.sections.filter((s) => s.id !== id),
      },
    });
  };

  const handleSave = async () => {
    if (!doc.slug || !doc.title) {
      alert("Slug and Title are required");
      return;
    }
    setSaving(true);
    try {
      await onSave(doc);
      alert("Saved successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      // Map common external formats to internal schema
      const mapped = {
        ...parsed,
        revisionJson: parsed.revisionJson || parsed.revision || [],
        mistakesJson: parsed.mistakesJson || parsed.mistakes || [],
        visualsJson: parsed.visualsJson || parsed.visuals || [],
      };
      setDoc(mapped);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "edit" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "json" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            JSON
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Content"}
        </button>
      </div>

      {activeTab === "edit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Enter title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                type="text"
                value={doc.slug}
                onChange={(e) => setDoc({ ...doc, slug: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g. binary-search-basics"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <textarea
              value={doc.summary}
              onChange={(e) => setDoc({ ...doc, summary: e.target.value })}
              className="w-full p-2 border rounded-md bg-background min-h-[80px]"
              placeholder="Brief overview..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sections</h3>
              <button
                onClick={addSection}
                className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80"
              >
                + Add Section
              </button>
            </div>
            
            {doc.content.sections.map((section, idx) => (
              <div key={section.id} className="p-4 border rounded-lg bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.title || ""}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="bg-transparent border-b font-medium focus:outline-none"
                    placeholder="Section Title (optional)"
                  />
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-destructive text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={section.bodyMd || ""}
                  onChange={(e) => updateSection(section.id, { bodyMd: e.target.value })}
                  className="w-full p-3 border rounded-md bg-background font-mono text-sm min-h-[200px]"
                  placeholder="Markdown content..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="border rounded-lg p-8 bg-card shadow-sm prose dark:prose-invert max-w-none">
          <ContentItemView doc={doc} />
        </div>
      )}

      {activeTab === "json" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Direct JSON Edit (Advanced)</label>
          <div className="text-xs text-muted-foreground mb-2">
            You can paste your blog JSON here. It will automatically map fields like `revision` to `revisionJson`.
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={`w-full p-4 border rounded-md bg-background font-mono text-xs min-h-[600px] ${jsonError ? "border-destructive focus:ring-destructive" : ""}`}
          />
          {jsonError && (
            <div className="text-xs text-destructive font-mono mt-1">
              {jsonError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
