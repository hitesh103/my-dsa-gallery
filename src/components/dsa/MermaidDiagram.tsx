"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

type MermaidTheme = "default" | "dark" | "neutral";

function getTheme(): MermaidTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "neutral";
}

export function MermaidDiagram({
  diagram,
  className,
}: {
  diagram: string;
  className?: string;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<MermaidTheme>("neutral");

  const id = useMemo(() => `mmd-${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    setTheme(getTheme());
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const source = (diagram ?? "").trim();
    if (!source) {
      setSvg(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    (async () => {
      const mod = await import("mermaid");
      // ESM/CJS interop
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mermaid: any = (mod as any).default ?? mod;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme,
      });

      const out = await mermaid.render(id, source);
      const nextSvg = typeof out === "string" ? out : (out?.svg as string);
      if (!cancelled) setSvg(nextSvg);
    })().catch((e) => {
      const msg = e instanceof Error ? e.message : "Failed to render diagram";
      if (!cancelled) setError(msg);
    });

    return () => {
      cancelled = true;
    };
  }, [diagram, id, theme]);

  if (error) {
    return (
      <div className={cn("not-prose rounded-xl border bg-card p-3 text-sm text-muted-foreground", className)}>
        <div className="font-medium text-foreground">Mermaid render error</div>
        <div className="mt-1">{error}</div>
        <pre className="mt-3 overflow-auto rounded-lg border bg-background p-3 text-xs">
          {diagram}
        </pre>
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      className={cn("not-prose overflow-auto rounded-xl border bg-card p-3", className)}
      // Mermaid outputs SVG markup.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

