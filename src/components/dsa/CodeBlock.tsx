"use client";

import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

// Prism is used client-side to keep Edge runtime compatibility simple.
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-java";

type PreProps = ComponentProps<"pre">;

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyNode = node as any;
  if (Array.isArray(anyNode)) return anyNode.map(extractText).join("");
  if (anyNode.props?.children) return extractText(anyNode.props.children);
  return "";
}

export function CodeBlock({ className, children, tabIndex, ...props }: PreProps) {
  const codeRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  const codeText = useMemo(() => extractText(children), [children]);

  useEffect(() => {
    if (!codeRef.current) return;
    Prism.highlightElement(codeRef.current);
  }, [children]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      // no-op
    }
  };

  // MDX typically renders <pre><code class="language-java">...</code></pre>.
  const codeChild =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (children as any)?.type === "code" ? (children as any) : null;
  const codeClassName = codeChild?.props?.className ?? "language-java";

  return (
    <div className="group relative my-6">
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "absolute right-3 top-3 z-10 rounded-md border border-zinc-200 bg-white/80 px-2 py-1 text-xs font-medium text-zinc-700 backdrop-blur",
          "opacity-0 transition-opacity group-hover:opacity-100",
          "dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200",
        )}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      <pre
        {...props}
        // Ensure server/client markup matches (some MDX pipelines add tabIndex).
        tabIndex={tabIndex ?? 0}
        className={cn("not-prose", className, codeClassName)}
      >
        <code
          // Prism needs the class on <code>, not only <pre>.
          ref={(el) => {
            codeRef.current = el;
          }}
          className={codeClassName}
        >
          {codeText}
        </code>
      </pre>
    </div>
  );
}

export function CodeSnippet({
  code,
  language = "language-java",
}: {
  code: string;
  language?: string;
}) {
  const codeRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const codeText = (code ?? "").trimEnd();

  useEffect(() => {
    if (!codeRef.current) return;
    Prism.highlightElement(codeRef.current);
  }, [codeText, language]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      // no-op
    }
  };

  return (
    <div className="group relative my-6">
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "absolute right-3 top-3 z-10 rounded-md border border-zinc-200 bg-white/80 px-2 py-1 text-xs font-medium text-zinc-700 backdrop-blur",
          "opacity-0 transition-opacity group-hover:opacity-100",
          "dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200",
        )}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      <pre tabIndex={0} className={cn("not-prose", language)}>
        <code ref={codeRef} className={language}>
          {codeText}
        </code>
      </pre>
    </div>
  );
}
