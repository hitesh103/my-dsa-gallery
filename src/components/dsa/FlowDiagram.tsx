"use client";

import { useEffect, useMemo, useState } from "react";

import ReactFlow, { Background, Controls, MiniMap } from "reactflow";

import type { FlowVisualization } from "@/lib/problemDoc";
import { cn } from "@/lib/cn";

type ColorMode = "light" | "dark";

function getColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function normalizeVisualization(
  visualization: FlowVisualization | null | undefined,
): FlowVisualization | null {
  if (!visualization) return null;
  if (!Array.isArray(visualization.nodes) || !Array.isArray(visualization.edges)) return null;
  return visualization;
}

export function FlowDiagram({
  visualization,
  className,
}: {
  visualization?: FlowVisualization | null;
  className?: string;
}) {
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  useEffect(() => {
    setColorMode(getColorMode());
    const observer = new MutationObserver(() => setColorMode(getColorMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => normalizeVisualization(visualization), [visualization]);
  if (!data) return null;

  const nodes = data.nodes;
  const edges = data.edges;
  const viewport = data.viewport;

  const isDark = colorMode === "dark";
  const bg = isDark ? "#09090b" : "#fafafa";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(24,24,27,0.10)";

  return (
    <div
      className={cn("not-prose overflow-hidden rounded-xl border bg-card", className)}
      style={{ borderColor: border }}
    >
      <div className="h-[360px] w-full" style={{ background: bg }}>
        <ReactFlow
          nodes={nodes as never}
          edges={edges as never}
          fitView
          defaultViewport={viewport as never}
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
