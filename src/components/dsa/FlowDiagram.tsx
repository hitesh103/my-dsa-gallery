"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from "reactflow";

import type { FlowVisualization, FlowNode, FlowEdge, FlowVisualizationStep } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";

type ColorMode = "light" | "dark";

function getColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function normalizeStep(step: FlowVisualizationStep | null | undefined): FlowVisualizationStep | null {
  if (!step) return null;
  if (!Array.isArray(step.nodes) || !Array.isArray(step.edges)) return null;
  return step;
}

export function FlowDiagram({
  visualization,
  className,
}: {
  visualization?: FlowVisualization | null;
  className?: string;
}) {
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [currentStep, setCurrentStep] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setColorMode(getColorMode());
    const observer = new MutationObserver(() => setColorMode(getColorMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const steps = useMemo(() => {
    if (!visualization) return null;
    if (visualization.steps && Array.isArray(visualization.steps) && visualization.steps.length > 0) {
      return visualization.steps.map(normalizeStep).filter(Boolean) as FlowVisualizationStep[];
    }
    if (Array.isArray(visualization.nodes) && Array.isArray(visualization.edges)) {
      return [{ nodes: visualization.nodes, edges: visualization.edges, viewport: visualization.viewport }];
    }
    return null;
  }, [visualization]);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const step = steps[currentStep];
    if (!step) return;

    const mappedNodes = step.nodes.map((n: FlowNode) => ({
      id: n.id,
      type: n.type || "default",
      data: n.data || { label: n.id },
      position: n.position,
      style: n.style,
      className: n.className,
      draggable: n.draggable ?? false,
      selectable: n.selectable ?? false,
    }));

    const mappedEdges = step.edges.map((e: FlowEdge) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type || "default",
      label: e.label,
      animated: e.animated,
      style: e.style,
    }));

    setNodes(mappedNodes);
    setEdges(mappedEdges);
  }, [steps, currentStep, setNodes, setEdges]);

  const goToPrev = useCallback(() => {
    if (!steps) return;
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, [steps]);

  const goToNext = useCallback(() => {
    if (!steps) return;
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  const isDark = colorMode === "dark";
  const bg = isDark ? "#09090b" : "#fafafa";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(24,24,27,0.10)";
  const step = steps[currentStep];
  const hasMultipleSteps = steps.length > 1;

  return (
    <div
      className={cn("not-prose overflow-hidden rounded-xl border bg-card", className)}
      style={{ borderColor: border }}
    >
      {hasMultipleSteps && (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: border }}>
          <button
            onClick={goToPrev}
            disabled={currentStep === 0}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              currentStep === 0
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-accent"
            )}
            style={{ color: isDark ? "#e4e4e7" : "#18181b" }}
          >
            ← Prev
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold" style={{ color: isDark ? "#e4e4e7" : "#18181b" }}>
              {step.label || `Step ${currentStep + 1}`}
            </span>
            {step.description && (
              <span className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                {step.description}
              </span>
            )}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    idx === currentStep ? "" : "opacity-40 hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: idx === currentStep
                      ? (isDark ? "#3b82f6" : "#2563eb")
                      : (isDark ? "#71717a" : "#a1a1aa")
                  }}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={goToNext}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              currentStep === steps.length - 1
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-accent"
            )}
            style={{ color: isDark ? "#e4e4e7" : "#18181b" }}
          >
            Next →
          </button>
        </div>
      )}
      <div className="h-[360px] w-full" style={{ background: bg }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          defaultViewport={step.viewport as { x: number; y: number; zoom: number } | undefined}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} size={1} />
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
