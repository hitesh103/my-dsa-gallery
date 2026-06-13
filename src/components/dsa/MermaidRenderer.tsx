"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import type { MermaidStep } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  fontFamily: "inherit",
});

function getIsDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function sanitizeMermaidCode(code: string): string {
  return code.replace(/"([^"\n]*)"/g, (m, inner) => {
    const escaped = inner.replace(/[()]/g, (c: string) => (c === "(" ? "#40;" : "#41;"));
    return `"${escaped}"`;
  });
}

type MermaidRendererProps = {
  code: string;
  className?: string;
};

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    setIsDark(getIsDark());
    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current || !code.trim()) return;

      if (!initialized.current) {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });
        initialized.current = true;
      } else {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });
      }

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, sanitizeMermaidCode(code));
        setSvg(svg);
      } catch (e) {
        console.error("Mermaid render error:", e);
        setSvg("");
      }
    };
    void render();
  }, [code, isDark]);

  if (!code.trim()) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-x-auto p-4 rounded-md",
        isDark ? "bg-slate-900" : "bg-slate-50",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

type MermaidStepperProps = {
  steps: MermaidStep[];
  className?: string;
};

export function MermaidStepper({ steps, className }: MermaidStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [renderedSvgs, setRenderedSvgs] = useState<Map<number, string>>(new Map());
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getIsDark());
    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const renderStep = async (index: number, code: string) => {
      if (renderedSvgs.has(index)) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });

      try {
        const id = `mermaid-step-${index}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, sanitizeMermaidCode(code));
        setRenderedSvgs((prev) => new Map(prev).set(index, svg));
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    };

    if (steps[currentStep]) {
      void renderStep(currentStep, steps[currentStep].code);
    }
  }, [currentStep, steps, renderedSvgs, isDark]);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const step = steps[currentStep];

  return (
    <div className={cn("rounded-lg border", className)}>
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="text-sm font-medium">
          Step {currentStep + 1} of {steps.length}
          {step?.label && <span className="ml-2 text-muted-foreground">- {step.label}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium hover:bg-muted disabled:opacity-50"
            aria-label="Previous step"
          >
            ← Prev
          </button>
          <button
            onClick={goNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium hover:bg-muted disabled:opacity-50"
            aria-label="Next step"
          >
            Next →
          </button>
        </div>
      </div>

      {step?.description && (
        <div className="border-b px-4 py-2 text-sm text-muted-foreground">
          {step.description}
        </div>
      )}

      <div
        className={cn(
          "min-h-[200px] overflow-x-auto p-4 rounded-b-md",
          isDark ? "bg-slate-900" : "bg-slate-50"
        )}
      >
        {renderedSvgs.get(currentStep) ? (
          <div dangerouslySetInnerHTML={{ __html: renderedSvgs.get(currentStep)! }} />
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Use arrow keys to navigate
        </span>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentStep ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}