import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, type EdgeProps } from "reactflow";
import { cn } from "@/lib/cn";

export type StyledEdgeData = {
  type?: "next" | "random" | "left" | "right" | "parent" | "child" | "edge" | "undirected";
  weight?: string | number;
  highlight?: "default" | "active" | "path" | "visited" | "new";
  label?: string;
  animated?: boolean;
};

const edgeStyles = {
  next: {
    stroke: "stroke-blue-600 dark:stroke-blue-400",
    width: 2,
    dashed: false,
  },
  random: {
    stroke: "stroke-purple-600 dark:stroke-purple-400",
    width: 2,
    dashed: true,
  },
  left: {
    stroke: "stroke-green-600 dark:stroke-green-400",
    width: 2,
    dashed: false,
  },
  right: {
    stroke: "stroke-red-600 dark:stroke-red-400",
    width: 2,
    dashed: false,
  },
  parent: {
    stroke: "stroke-gray-600 dark:stroke-gray-400",
    width: 2,
    dashed: false,
  },
  child: {
    stroke: "stroke-gray-600 dark:stroke-gray-400",
    width: 2,
    dashed: false,
  },
  edge: {
    stroke: "stroke-gray-600 dark:stroke-gray-400",
    width: 2,
    dashed: false,
  },
  undirected: {
    stroke: "stroke-gray-600 dark:stroke-gray-400",
    width: 2,
    dashed: false,
  },
};

const highlightOverlay = {
  active: "opacity-100",
  path: "opacity-100",
  visited: "opacity-60",
  new: "opacity-100",
  default: "opacity-80",
};

export function StyledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<StyledEdgeData>) {
  const edgeType = data?.type ?? "edge";
  const highlight = data?.highlight ?? "default";
  const style = edgeStyles[edgeType];
  const highlightStyle = highlightOverlay[highlight];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: edgeType === "random" ? 0.5 : 0.25,
  });

  const strokeWidth = selected ? style.width + 1 : style.width;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth,
          strokeDasharray: style.dashed ? "5,5" : undefined,
          stroke: selected 
            ? "rgb(147 51 234)" 
            : style.stroke.includes("blue") 
              ? "rgb(37 99 235)"
              : style.stroke.includes("purple")
                ? "rgb(147 51 234)"
                : style.stroke.includes("green")
                  ? "rgb(22 163 74)"
                  : style.stroke.includes("red")
                    ? "rgb(220 38 38)"
                    : "rgb(75 85 99)",
          opacity: highlightStyle === "opacity-100" ? 1 : 0.6,
        }}
      />
      {(data?.label || data?.weight) && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "absolute rounded border bg-background px-1.5 py-0.5 text-xs font-medium shadow-sm pointer-events-all",
              style.stroke.replace("stroke-", "text-"),
              highlight === "active" && "bg-yellow-100 dark:bg-yellow-900 border-yellow-500"
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {data?.label ?? data?.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export function StraightStyledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
  markerEnd,
}: EdgeProps<StyledEdgeData>) {
  const edgeType = data?.type ?? "edge";
  const highlight = data?.highlight ?? "default";
  const style = edgeStyles[edgeType];
  const highlightStyle = highlightOverlay[highlight];

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const strokeWidth = selected ? style.width + 1 : style.width;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth,
          strokeDasharray: style.dashed ? "5,5" : undefined,
          stroke: selected 
            ? "rgb(147 51 234)" 
            : style.stroke.includes("blue") 
              ? "rgb(37 99 235)"
              : style.stroke.includes("purple")
                ? "rgb(147 51 234)"
                : style.stroke.includes("green")
                  ? "rgb(22 163 74)"
                  : style.stroke.includes("red")
                    ? "rgb(220 38 38)"
                    : "rgb(75 85 99)",
          opacity: highlightStyle === "opacity-100" ? 1 : 0.6,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "absolute rounded border bg-background px-1.5 py-0.5 text-xs font-medium shadow-sm pointer-events-all",
              style.stroke.replace("stroke-", "text-")
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const edgeTypes = {
  bezier: StyledEdge,
  straight: StraightStyledEdge,
  default: StyledEdge,
};
