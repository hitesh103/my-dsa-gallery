"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import type { ExecutionStep, ExecutionVisualization } from "@/lib/problemDoc";

type ColorMode = "light" | "dark";

function getColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ExecutionRenderer({
  visualization,
  className,
}: {
  visualization?: ExecutionVisualization | null;
  className?: string;
}) {
  const [colorMode] = useState<ColorMode>(() => {
    if (typeof document === "undefined") return "light";
    return getColorMode();
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = visualization?.steps ?? [];
  const activeStepIndex = Math.min(currentStep, steps.length - 1);
  const step = steps[activeStepIndex];
  const hasMultipleSteps = steps.length > 1;

  const goToPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const isDark = colorMode === "dark";
  const border = isDark ? "hsla(210, 5%, 20%, 1)" : "hsla(0, 0%, 80%, 1)";
  const textPrimary = isDark ? "#fff" : "#000";
  const textSecondary = isDark ? "hsl(0, 0%, 60%)" : "hsl(0, 0%, 40%)";
  const bgCard = isDark ? "hsl(210, 9%, 14%)" : "hsl(0, 0%, 100%)";
  const bgAccent = isDark ? "hsl(210, 5%, 18%)" : "hsl(0, 0%, 86%)";

  return (
    <div
      className={cn("not-prose overflow-hidden rounded-xl border bg-card", className)}
      style={{ borderColor: border }}
    >
      {hasMultipleSteps && (
        <div
          className="flex items-center justify-between gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
          style={{ borderColor: border }}
        >
          <button
            type="button"
            onClick={goToPrev}
            disabled={activeStepIndex === 0}
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              activeStepIndex === 0 ? "cursor-not-allowed opacity-40" : "hover:bg-accent"
            )}
            style={{ color: textPrimary }}
          >
            ← Prev
          </button>
          <div className="flex flex-col items-center gap-1">
            <span
              className="max-w-[200px] truncate text-sm font-semibold sm:max-w-none"
              style={{ color: textPrimary }}
            >
              {step?.label ?? `Step ${activeStepIndex + 1}`}
            </span>
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full transition-colors",
                    idx === activeStepIndex ? "" : "opacity-40 hover:opacity-70"
                  )}
                  aria-label={`Go to step ${idx + 1}`}
                >
                  <span
                    className={cn("block h-2 w-2 rounded-full", idx === activeStepIndex ? "" : "opacity-40")}
                    style={{
                    backgroundColor:
                      idx === activeStepIndex
                        ? isDark
                          ? "hsl(0, 72%, 56%)"
                          : "hsl(0, 72%, 42%)"
                        : isDark
                          ? "hsl(0, 0%, 60%)"
                          : "hsl(0, 0%, 40%)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={goToNext}
            disabled={activeStepIndex === steps.length - 1}
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              activeStepIndex === steps.length - 1 ? "cursor-not-allowed opacity-40" : "hover:bg-accent"
            )}
            style={{ color: textPrimary }}
          >
            Next →
          </button>
        </div>
      )}
      <div className="p-3 sm:p-4">
        {step?.description && (
          <p className="mb-3 text-sm" style={{ color: textSecondary }}>
            {step.description}
          </p>
        )}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: bgCard, borderColor: border, borderWidth: "1px" }}
        >
          <div className="flex flex-col gap-3">
            {step?.action && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium uppercase" style={{ color: textSecondary }}>
                  Action:
                </span>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>
                  {step.action}
                </span>
              </div>
            )}
            {step?.state && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium uppercase" style={{ color: textSecondary }}>
                  State:
                </span>
                {Object.entries(step.state).map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded bg-muted px-2 py-1 text-xs font-mono"
                    style={{ color: textPrimary }}
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
            {step?.highlight && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium uppercase" style={{ color: textSecondary }}>
                  Highlight:
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900" style={{ color: textPrimary }}>
                  {step.highlight}
                </span>
              </div>
            )}
            {step?.result && Object.keys(step.result).length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase" style={{ color: textSecondary }}>
                  Result:
                </span>
                {Object.entries(step.result).map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded bg-green-100 px-2 py-1 text-xs font-mono dark:bg-green-900"
                    style={{ color: textPrimary }}
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
            {step?.payload && Object.entries(step.payload).length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase" style={{ color: textSecondary }}>
                  Details:
                </span>
                <pre
                  className="overflow-x-auto rounded bg-muted p-2 text-xs font-mono"
                  style={{ color: textPrimary }}
                >
                  {JSON.stringify(step.payload, null, 2)}
                </pre>
              </div>
            )}
            {!step?.action && !step?.state && !step?.highlight && !step?.payload && (
              <p className="text-sm" style={{ color: textSecondary }}>
                {step?.label ?? "No details available for this step"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}