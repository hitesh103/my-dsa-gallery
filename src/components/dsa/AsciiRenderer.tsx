"use client";

import { useEffect, useState } from "react";
import type { AsciiStep } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";

type AsciiRendererProps = {
  lines: string[];
  className?: string;
};

export function AsciiRenderer({ lines, className }: AsciiRendererProps) {
  if (!lines || lines.length === 0) return null;

  return (
    <pre
      className={cn(
        "overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed",
        className
      )}
    >
      {lines.map((line, i) => (
        <div key={i} className="tabular-nums">
          {line}
        </div>
      ))}
    </pre>
  );
}

type AsciiStepperProps = {
  steps: AsciiStep[];
  className?: string;
};

export function AsciiStepper({ steps, className }: AsciiStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentStep((s) => Math.max(s - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps.length]);

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

      <div className="min-h-[150px] overflow-x-auto p-4">
        <pre className="font-mono text-xs leading-relaxed whitespace-pre">
          {step?.lines.join("\n")}
        </pre>
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