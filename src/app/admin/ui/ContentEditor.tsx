"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ContentItemView } from "@/components/dsa/ContentItemView";
import type { ContentItemDoc, ContentItemSection } from "@/lib/contentDoc";
import { cn } from "@/lib/cn";

interface ContentEditorProps {
  initialDoc?: Partial<ContentItemDoc>;
  onSave: (doc: ContentItemDoc) => Promise<void>;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  fallback: string,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const wrapped = `${before}${selected || fallback}${after}`;
  const newVal =
    textarea.value.substring(0, start) + wrapped + textarea.value.substring(end);
  return { value: newVal, cursor: start + before.length + (selected || fallback).length };
}

function MdToolbar({
  textareaId,
  onInsert,
}: {
  textareaId: string;
  onInsert: (fn: (ta: HTMLTextAreaElement) => { value: string; cursor: number } | null) => void;
}) {
  const buttons = [
    {
      label: "B",
      title: "Bold",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "**", "**", "bold"),
      className: "font-bold",
    },
    {
      label: "I",
      title: "Italic",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "*", "*", "italic"),
      className: "italic",
    },
    {
      label: "H",
      title: "Heading",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "## ", "", "Heading"),
    },
    {
      label: "[]",
      title: "Link",
      action: (ta: HTMLTextAreaElement) =>
        insertMarkdown(ta, "[", "](url)", "link text"),
    },
    {
      label: "IMG",
      title: "Image",
      action: (ta: HTMLTextAreaElement) =>
        insertMarkdown(ta, "![", "](url)", "alt text"),
    },
    {
      label: "<>",
      title: "Inline Code",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "`", "`", "code"),
      className: "font-mono",
    },
    {
      label: "Code Block",
      title: "Code Block",
      action: (ta: HTMLTextAreaElement) =>
        insertMarkdown(ta, "```\n", "\n```", "code"),
      className: "font-mono text-xs",
    },
    {
      label: "UL",
      title: "Bullet List",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "- ", "\n- ", "item"),
    },
    {
      label: "OL",
      title: "Numbered List",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "1. ", "\n2. ", "item"),
    },
    {
      label: "—",
      title: "Horizontal Rule",
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, "\n---\n", "", ""),
    },
  ];

  return (
    <div className="flex flex-wrap gap-0.5 border-b pb-2 mb-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          title={btn.title}
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert(btn.action);
          }}
          className={cn(
            "px-2 py-1 text-xs rounded hover:bg-muted border border-transparent hover:border-border",
            btn.className,
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

function SectionEditor({
  section,
  index,
  onUpdate,
  onRemove,
}: {
  section: ContentItemSection;
  index: number;
  onUpdate: (id: string, updates: Partial<ContentItemSection>) => void;
  onRemove: (id: string) => void;
}) {
  const textareaId = `section-${section.id}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback(
    (fn: (ta: HTMLTextAreaElement) => { value: string; cursor: number } | null) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const result = fn(ta);
      if (result) {
        onUpdate(section.id, { bodyMd: result.value });
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(result.cursor, result.cursor);
        });
      }
    },
    [section.id, onUpdate],
  );

  return (
    <div className="p-4 border rounded-lg bg-card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
          <input
            type="text"
            value={section.title || ""}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="bg-transparent border-b font-medium focus:outline-none flex-1 text-sm"
            placeholder="Section Title (optional)"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={section.kind}
            onChange={(e) =>
              onUpdate(section.id, { kind: e.target.value as ContentItemSection["kind"] })
            }
            className="text-xs px-2 py-1 rounded border bg-background"
          >
            {[
              "markdown",
              "problem-statement",
              "example",
              "solution",
              "complexity",
              "callout",
              "visualization",
            ].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(section.id)}
            className="text-destructive text-xs hover:underline px-2 py-1"
          >
            Remove
          </button>
        </div>
      </div>
      <MdToolbar textareaId={textareaId} onInsert={handleInsert} />
      <textarea
        ref={textareaRef}
        id={textareaId}
        value={section.bodyMd || ""}
        onChange={(e) => onUpdate(section.id, { bodyMd: e.target.value })}
        className="w-full p-3 border rounded-md bg-background font-mono text-sm min-h-[200px] focus:outline-none focus:ring-2 focus:ring-ring/30"
        placeholder="Write markdown content here..."
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selected = ta.value.substring(start, end);
            if (selected) {
              // Copy selected text
              navigator.clipboard.writeText(selected);
            }
          }}
          className="hover:text-foreground px-1"
        >
          Copy selection
        </button>
        <span>{section.bodyMd?.length || 0} chars</span>
      </div>
    </div>
  );
}

function ImageUploader({
  slug,
  onInsertImage,
}: {
  slug: string;
  onInsertImage: (md: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const presignRes = await fetch("/api/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          prefix: `notes/${slug}`,
        }),
      });
      if (!presignRes.ok) throw new Error("Failed to create upload URL");
      const presignData = (await presignRes.json()) as {
        key: string;
        url: string;
        headers: Record<string, string>;
      };

      const put = await fetch(presignData.url, { method: "PUT", headers: presignData.headers, body: file });
      if (!put.ok) throw new Error("Upload failed");

      const imageUrl = `/api/images?key=${encodeURIComponent(presignData.key)}`;
      const md = `![${file.name}](${imageUrl})`;
      onInsertImage(md);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-muted/30">
      <div className="text-xs font-medium text-muted-foreground">Upload Image:</div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-xs flex-1"
      />
      <button
        type="button"
        disabled={!file || uploading}
        onClick={handleUpload}
        className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload & Insert"}
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
      {file && !uploading && (
        <span className="text-xs text-muted-foreground">{file.name}</span>
      )}
    </div>
  );
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync jsonText when switching to json tab
  useEffect(() => {
    if (activeTab === "json") {
      setJsonText(JSON.stringify(doc, null, 2));
      setJsonError(null);
    }
  }, [activeTab]);

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
      setSaveStatus("Slug and Title are required");
      return;
    }
    setSaving(true);
    setSaveStatus(null);
    try {
      await onSave(doc);
      setSaveStatus("Saved successfully");
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
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

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
    } catch {
      // ignore
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setSaveStatus("JSON copied to clipboard");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleInsertImage = (md: string) => {
    // Insert image markdown into the first section or create one
    if (doc.content.sections.length > 0) {
      const first = doc.content.sections[0];
      updateSection(first.id, {
        bodyMd: `${first.bodyMd || ""}\n${md}\n`,
      });
      setActiveTab("edit");
    } else {
      const newSection: ContentItemSection = {
        id: Math.random().toString(36).substring(2, 9),
        kind: "markdown",
        title: "",
        bodyMd: md,
      };
      setDoc({
        ...doc,
        content: {
          ...doc.content,
          sections: [newSection],
        },
      });
    }
  };

  const tabClass = (tab: "edit" | "preview" | "json") =>
    cn(
      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
      activeTab === tab
        ? "bg-primary text-primary-foreground shadow-sm"
        : "hover:bg-muted text-muted-foreground",
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("edit")} className={tabClass("edit")}>
            Edit
          </button>
          <button onClick={() => setActiveTab("preview")} className={tabClass("preview")}>
            Preview
          </button>
          <button onClick={() => setActiveTab("json")} className={tabClass("json")}>
            JSON
          </button>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span
              className={cn(
                "text-xs",
                saveStatus === "Saved successfully" ? "text-green-600" : "text-destructive",
              )}
            >
              {saveStatus}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? "Saving..." : "Save Content"}
          </button>
        </div>
      </div>

      {/* Edit Tab */}
      {activeTab === "edit" && (
        <div className="space-y-6">
          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                className="w-full p-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="Enter title..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <input
                type="text"
                value={doc.slug}
                onChange={(e) => setDoc({ ...doc, slug: e.target.value })}
                className="w-full p-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 font-mono"
                placeholder="e.g. binary-search-basics"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={doc.status}
                onChange={(e) =>
                  setDoc({ ...doc, status: e.target.value as ContentItemDoc["status"] })
                }
                className="w-full p-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Visibility</label>
              <select
                value={doc.visibility}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    visibility: e.target.value as ContentItemDoc["visibility"],
                  })
                }
                className="w-full p-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Topic</label>
              <input
                type="text"
                value={doc.topic || ""}
                onChange={(e) => setDoc({ ...doc, topic: e.target.value })}
                className="w-full p-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="e.g. Arrays, Trees"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Summary</label>
            <textarea
              value={doc.summary}
              onChange={(e) => setDoc({ ...doc, summary: e.target.value })}
              className="w-full p-2.5 border rounded-md bg-background text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring/30"
              placeholder="Brief overview..."
              rows={2}
            />
          </div>

          {/* Image Uploader */}
          {doc.slug && (
            <ImageUploader slug={doc.slug} onInsertImage={handleInsertImage} />
          )}

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                Sections ({doc.content.sections.length})
              </h3>
              <button
                onClick={addSection}
                className="text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 font-medium"
              >
                + Add Section
              </button>
            </div>

            {doc.content.sections.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
                <p className="text-sm">No sections yet. Click &quot;+ Add Section&quot; to start writing.</p>
              </div>
            )}

            {doc.content.sections.map((section, idx) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={idx}
                onUpdate={updateSection}
                onRemove={removeSection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="border rounded-lg p-8 bg-card shadow-sm prose dark:prose-invert max-w-none">
          <ContentItemView doc={doc} />
        </div>
      )}

      {/* JSON Tab */}
      {activeTab === "json" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Direct JSON Edit</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Edit the raw content document. Automatically maps fields like{" "}
                <code className="text-xs">revision</code> →{" "}
                <code className="text-xs">revisionJson</code>.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={formatJson}
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Format
              </button>
              <button
                type="button"
                onClick={copyJson}
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Copy
              </button>
            </div>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={cn(
              "w-full p-4 border rounded-md bg-background font-mono text-xs leading-relaxed min-h-[600px] focus:outline-none focus:ring-2 focus:ring-ring/30",
              jsonError ? "border-destructive ring-destructive/30" : "",
            )}
            spellCheck={false}
          />
          {jsonError && (
            <div className="flex items-center gap-2 text-xs text-destructive font-mono bg-destructive/5 p-2 rounded border border-destructive/20">
              <span className="font-semibold">Error:</span>
              {jsonError}
            </div>
          )}
          {!jsonError && jsonText && (
            <div className="text-xs text-muted-foreground">
              JSON is valid — {new Blob([jsonText]).size.toLocaleString()} bytes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
