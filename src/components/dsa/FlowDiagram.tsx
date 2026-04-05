"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from "reactflow";

import type { FlowVisualization, FlowNode, FlowEdge, FlowVisualizationStep, FlowNodeData, FlowEdgeData } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";
import { nodeTypes } from "./nodes/DataStructureNodes";
import { edgeTypes } from "./nodes/StyledEdges";

type ColorMode = "light" | "dark";

function getColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function normalizeStep(step: FlowVisualizationStep | null | undefined): FlowVisualizationStep | null {
  if (!step) return null;
  if (!Array.isArray(step.nodes) || !Array.isArray(step.edges)) return null;
  return step;
}

type LegendItem = {
  color: string;
  label: string;
  dashed?: boolean;
};

function Legend({ items, isDark }: { items: LegendItem[]; isDark: boolean }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <svg width="24" height="12" className="overflow-visible">
            <line
              x1="0"
              y1="6"
              x2="24"
              y2="6"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={item.dashed ? "4,3" : undefined}
            />
          </svg>
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function extractLegendItems(steps: FlowVisualizationStep[], currentStep: number): LegendItem[] {
  const step = steps[currentStep];
  if (!step) return [];

  const items: LegendItem[] = [];
  const edgeTypes = new Set<string>();

  for (const edge of step.edges) {
    const type = edge.data?.type;
    if (type && !edgeTypes.has(type)) {
      edgeTypes.add(type);
      
      switch (type) {
        case "next":
          items.push({ color: "rgb(37 99 235)", label: "Next pointer" });
          break;
        case "random":
          items.push({ color: "rgb(147 51 234)", label: "Random pointer", dashed: true });
          break;
        case "left":
          items.push({ color: "rgb(22 163 74)", label: "Left child" });
          break;
        case "right":
          items.push({ color: "rgb(220 38 38)", label: "Right child" });
          break;
        case "edge":
        case "undirected":
          items.push({ color: "rgb(75 85 99)", label: "Edge" });
          break;
      }
    }
  }

  return items;
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

    const mappedNodes = step.nodes.map((n: FlowNode) => {
      const nodeType = n.type || "default";
      const defaultData: FlowNodeData = { label: n.id };
      const mergedData = { ...defaultData, ...n.data };

      return {
        id: n.id,
        type: nodeType,
        data: mergedData,
        position: n.position,
        style: n.style,
        className: n.className,
        draggable: n.draggable ?? false,
        selectable: n.selectable ?? true,
      };
    });

    const mappedEdges = step.edges.map((e: FlowEdge) => {
      const edgeData: FlowEdgeData = {};
      if (e.data) {
        edgeData.type = e.data.type;
        edgeData.weight = e.data.weight;
        edgeData.highlight = e.data.highlight;
      } else {
        if (e.label?.toLowerCase().includes("next")) {
          edgeData.type = "next";
        } else if (e.label?.toLowerCase().includes("random")) {
          edgeData.type = "random";
        } else if (e.label?.toLowerCase().includes("left")) {
          edgeData.type = "left";
        } else if (e.label?.toLowerCase().includes("right")) {
          edgeData.type = "right";
        }
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type || "bezier",
        label: e.label,
        animated: e.animated,
        data: edgeData,
        style: e.style,
      };
    });

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
  const legendItems = extractLegendItems(steps, currentStep);

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
      <div className="p-4" style={{ borderColor: border }}>
        {legendItems.length > 0 && <Legend items={legendItems} isDark={isDark} />}
        <div className="h-[360px] w-full overflow-hidden rounded-lg" style={{ background: bg }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            defaultViewport={step.viewport as { x: number; y: number; zoom: number } | undefined}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag
            zoomOnScroll
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} size={1} />
            <MiniMap pannable zoomable />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
