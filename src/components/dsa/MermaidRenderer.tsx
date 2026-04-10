"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import type { MermaidStep } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "inherit",
});

type MermaidRendererProps = {
  code: string;
  className?: string;
};

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current || !code.trim()) return;
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
      } catch (e) {
        console.error("Mermaid render error:", e);
        setSvg("");
      }
    };
    void render();
  }, [code]);

  if (!code.trim()) return null;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-x-auto p-4", className)}
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

  useEffect(() => {
    const renderStep = async (index: number, code: string) => {
      if (renderedSvgs.has(index)) return;
      try {
        const id = `mermaid-step-${index}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setRenderedSvgs((prev) => new Map(prev).set(index, svg));
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    };

    if (steps[currentStep]) {
      void renderStep(currentStep, steps[currentStep].code);
    }
  }, [currentStep, steps, renderedSvgs]);

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
            className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentStep === steps.length - 1}
            className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {step?.description && (
        <div className="border-b px-4 py-2 text-sm text-muted-foreground">
          {step.description}
        </div>
      )}

      <div className="min-h-[200px] overflow-x-auto p-4">
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