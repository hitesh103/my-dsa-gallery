"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, { Background, Controls, MiniMap, Position, useEdgesState, useNodesState } from "reactflow";

import type { FlowEdge, FlowEdgeData, FlowNode, FlowNodeData, FlowVisualization, FlowVisualizationStep } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";
import { nodeTypes } from "./nodes/DataStructureNodes";
import { edgeTypes } from "./nodes/StyledEdges";

type ColorMode = "light" | "dark";
type AnchorSide = "top" | "right" | "bottom" | "left";
const positionBySide: Record<AnchorSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};
type LegendItem = {
  color: string;
  label: string;
  dashed?: boolean;
};

const sourceHandleBySide: Record<AnchorSide, string> = {
  top: "s-top",
  right: "s-right",
  bottom: "s-bottom",
  left: "s-left",
};

const targetHandleBySide: Record<AnchorSide, string> = {
  top: "t-top",
  right: "t-right",
  bottom: "t-bottom",
  left: "t-left",
};

function getColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function normalizeStep(step: FlowVisualizationStep | null | undefined): FlowVisualizationStep | null {
  if (!step) return null;
  if (!Array.isArray(step.nodes) || !Array.isArray(step.edges)) return null;
  return step;
}

function isAnchorSide(value: string | undefined): value is AnchorSide {
  return value === "top" || value === "right" || value === "bottom" || value === "left";
}

function normalizeNodeType(node: FlowNode): string {
  if (typeof node.type === "string" && node.type in nodeTypes) return node.type;
  if (typeof node.data?.type === "string" && node.data.type in nodeTypes) return node.data.type;
  return "flowchart";
}

function inferAnchorSides(sourceNode: FlowNode, targetNode: FlowNode): [AnchorSide, AnchorSide] {
  const dx = targetNode.position.x - sourceNode.position.x;
  const dy = targetNode.position.y - sourceNode.position.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ["right", "left"] : ["left", "right"];
  }

  return dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
}

function inferEdgeSemanticType(edge: FlowEdge): FlowEdgeData["type"] {
  if (edge.data?.type) return edge.data.type;

  const label = edge.label?.toLowerCase();
  if (!label) return undefined;
  if (label.includes("next")) return "next";
  if (label.includes("random")) return "random";
  if (label.includes("left")) return "left";
  if (label.includes("right")) return "right";
  return undefined;
}

function inferSourceHandle(nodeType: string, edgeType: FlowEdgeData["type"], side: AnchorSide) {
  if (nodeType === "linkedList" && (edgeType === "next" || edgeType === "random")) return edgeType;
  if (nodeType === "tree" && (edgeType === "left" || edgeType === "right")) return edgeType;
  return sourceHandleBySide[side];
}

function extractLegendItems(steps: FlowVisualizationStep[], currentStep: number): LegendItem[] {
  const step = steps[currentStep];
  if (!step) return [];

  const items: LegendItem[] = [];
  const seenTypes = new Set<string>();

  for (const edge of step.edges) {
    const type = inferEdgeSemanticType(edge);
    if (!type || seenTypes.has(type)) continue;

    seenTypes.add(type);

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

  return items;
}

function Legend({ items }: { items: LegendItem[] }) {
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

export function FlowDiagram({
  visualization,
  className,
}: {
  visualization?: FlowVisualization | null;
  className?: string;
}) {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof document === "undefined") return "light";
    return getColorMode();
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const observer = new MutationObserver(() => setColorMode(getColorMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const steps = useMemo(() => {
    if (!visualization) return null;
    if (visualization.flowSteps && Array.isArray(visualization.flowSteps) && visualization.flowSteps.length > 0) {
      return visualization.flowSteps.map(normalizeStep).filter(Boolean) as FlowVisualizationStep[];
    }
    if (visualization.type === "flow" && Array.isArray(visualization.nodes) && Array.isArray(visualization.edges)) {
      return [{ nodes: visualization.nodes, edges: visualization.edges, viewport: visualization.viewport }];
    }
    return null;
  }, [visualization]);

  const activeStepIndex = steps ? Math.min(currentStep, steps.length - 1) : 0;

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const step = steps[activeStepIndex];
    if (!step) return;

    const normalizedNodes = step.nodes.map((node: FlowNode) => {
      const nodeType = normalizeNodeType(node);
      const defaultData: FlowNodeData = { label: node.id };

      return {
        id: node.id,
        type: nodeType,
        data: { ...defaultData, ...node.data },
        position: node.position,
        style: node.style,
        className: node.className,
        draggable: node.draggable ?? false,
        selectable: node.selectable ?? true,
        sourcePosition: isAnchorSide(node.sourcePosition) ? positionBySide[node.sourcePosition] : undefined,
        targetPosition: isAnchorSide(node.targetPosition) ? positionBySide[node.targetPosition] : undefined,
        width: node.width,
        height: node.height,
      };
    });

    const rawNodeById = new Map(step.nodes.map((node) => [node.id, node]));
    const nodeTypeById = new Map(normalizedNodes.map((node) => [node.id, node.type]));

    const normalizedEdges = step.edges.flatMap((edge: FlowEdge) => {
      const sourceNode = rawNodeById.get(edge.source);
      const targetNode = rawNodeById.get(edge.target);

      if (!sourceNode || !targetNode) return [];

      const semanticType = inferEdgeSemanticType(edge);
      const label = edge.data?.label ?? edge.label;
      const [inferredSourceSide, inferredTargetSide] = inferAnchorSides(sourceNode, targetNode);

      const sourceSide = isAnchorSide(edge.sourcePosition)
        ? edge.sourcePosition
        : isAnchorSide(sourceNode.sourcePosition)
          ? sourceNode.sourcePosition
          : inferredSourceSide;
      const targetSide = isAnchorSide(edge.targetPosition)
        ? edge.targetPosition
        : isAnchorSide(targetNode.targetPosition)
          ? targetNode.targetPosition
          : inferredTargetSide;

      return [
        {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle:
            edge.sourceHandle ??
            inferSourceHandle(nodeTypeById.get(edge.source) ?? "flowchart", semanticType, sourceSide),
          targetHandle: edge.targetHandle ?? targetHandleBySide[targetSide],
          sourcePosition: positionBySide[sourceSide],
          targetPosition: positionBySide[targetSide],
          type: edge.type || "bezier",
          label,
          animated: edge.animated,
          data: {
            ...edge.data,
            type: semanticType,
            weight: edge.data?.weight,
            highlight: edge.data?.highlight,
            label,
          },
          style: edge.style,
        },
      ];
    });

    setNodes(normalizedNodes);
    setEdges(normalizedEdges);
  }, [activeStepIndex, setEdges, setNodes, steps]);

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
  const bg = isDark ? "hsl(210, 9%, 14%)" : "hsl(0, 0%, 91.8%)";
  const border = isDark ? "hsla(210, 5%, 20%, 1)" : "hsla(0, 0%, 80%, 1)";
  const step = steps[activeStepIndex];
  const hasMultipleSteps = steps.length > 1;
  const legendItems = extractLegendItems(steps, activeStepIndex);

  const actionButtonClassName =
    "inline-flex min-h-[40px] items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent";

  const renderCanvas = (heightClassName: string) => (
    <div className={cn("w-full overflow-hidden rounded-lg", heightClassName)} style={{ background: bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        defaultViewport={step.viewport as { x: number; y: number; zoom: number } | undefined}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
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
  );

  const renderPanel = (heightClassName: string, fullscreen: boolean) => (
    <div
      className={cn("not-prose overflow-hidden rounded-xl border bg-card", className, fullscreen && "shadow-2xl")}
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
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            ← Prev
          </button>
          <div className="flex flex-col items-center gap-1">
            <span
              className="max-w-[200px] truncate text-sm font-semibold sm:max-w-none"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              {step.label || `Step ${activeStepIndex + 1}`}
            </span>
            {step.description ? (
              <span
                className="max-w-[200px] truncate text-xs sm:max-w-none"
                style={{ color: isDark ? "hsl(0, 0%, 60%)" : "hsl(0, 0%, 40%)" }}
              >
                {step.description}
              </span>
            ) : null}
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
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Next →
          </button>
        </div>
      )}
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className={actionButtonClassName}
            style={{ borderColor: border, color: isDark ? "#fff" : "#000" }}
          >
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
        <Legend items={legendItems} />
        {renderCanvas(heightClassName)}
      </div>
    </div>
  );

  return (
    <>
      {renderPanel("h-[280px] sm:h-[360px]", false)}
      {isFullscreen ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Close full screen visualization"
            onClick={() => setIsFullscreen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-7xl">
            {renderPanel("h-[calc(100vh-12rem)]", true)}
          </div>
        </div>
      ) : null}
    </>
  );
}
