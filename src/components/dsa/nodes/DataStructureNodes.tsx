import { Handle, Position, type NodeProps } from "reactflow";
import { cn } from "@/lib/cn";

export type ArrayNodeData = {
  label?: string;
  index?: number;
  value?: string | number;
  highlight?: "default" | "active" | "comparing" | "swapped" | "done";
  extra?: string;
};

const highlightStyles = {
  default: "bg-background border-border",
  active: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  comparing: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500",
  swapped: "bg-red-100 dark:bg-red-900 border-red-500",
  done: "bg-green-100 dark:bg-green-900 border-green-500",
};

export function ArrayNode({ data }: NodeProps<ArrayNodeData>) {
  const { label, index, value, highlight = "default", extra } = data;
  const style = highlightStyles[highlight];

  return (
    <div className="relative">
      {index !== undefined && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          {index}
        </div>
      )}
      <div
        className={cn(
          "flex min-w-[48px] items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
          style
        )}
      >
        <span className="font-mono">{value ?? label}</span>
        {extra && (
          <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs">{extra}</span>
        )}
      </div>
    </div>
  );
}

export type LinkedListNodeData = {
  value?: string | number;
  nextPointer?: boolean;
  randomPointer?: boolean;
  highlight?: "default" | "new" | "modified" | "traversed";
  nextLabel?: string;
  randomLabel?: string;
};

const llHighlightStyles = {
  default: "bg-card border-border",
  new: "bg-green-100 dark:bg-green-900 border-green-500",
  modified: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  traversed: "bg-muted border-muted-foreground",
};

export function LinkedListNode({ data, id }: NodeProps<LinkedListNodeData>) {
  const { value, highlight = "default", nextLabel, randomLabel } = data;
  const style = llHighlightStyles[highlight];

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "flex min-w-[48px] items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-mono font-medium transition-all",
          style
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !rounded-full !border-2 !border-muted-foreground !bg-background"
        />
        {value}
        <Handle
          type="source"
          position={Position.Right}
          id="next"
          className="!h-2 !w-2 !rounded-full !border-2 !border-blue-600 !bg-background"
          style={{ top: "35%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="random"
          className="!h-2 !w-2 !rounded-full !border-2 !border-purple-600 !bg-background"
          style={{ top: "65%" }}
        />
      </div>
    </div>
  );
}

export type TreeNodeData = {
  value?: string | number;
  highlight?: "default" | "current" | "left" | "right" | "visited" | "new";
  leftLabel?: string;
  rightLabel?: string;
};

const treeHighlightStyles = {
  default: "bg-card border-border",
  current: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  left: "bg-green-100 dark:bg-green-900 border-green-500",
  right: "bg-red-100 dark:bg-red-900 border-red-500",
  visited: "bg-muted border-muted-foreground",
  new: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500",
};

export function TreeNode({ data }: NodeProps<TreeNodeData>) {
  const { value, highlight = "default" } = data;
  const style = treeHighlightStyles[highlight];

  return (
    <div
      className={cn(
        "flex min-w-[40px] items-center justify-center rounded-full border-2 px-4 py-2 text-sm font-mono font-medium transition-all",
        style
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !rounded-full !border-2 !border-muted-foreground !bg-background"
      />
      {value}
      <Handle
        type="source"
        position={Position.Bottom}
        id="left"
        className="!h-2 !w-2 !rounded-full !border-2 !border-green-600 !bg-background"
        style={{ left: "25%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="right"
        className="!h-2 !w-2 !rounded-full !border-2 !border-red-600 !bg-background"
        style={{ left: "75%" }}
      />
    </div>
  );
}

export type GraphNodeData = {
  label?: string;
  value?: string | number;
  highlight?: "default" | "source" | "target" | "visited" | "path" | "new";
  weight?: string | number;
};

const graphHighlightStyles = {
  default: "bg-card border-border",
  source: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  target: "bg-red-100 dark:bg-red-900 border-red-500",
  visited: "bg-green-100 dark:bg-green-900 border-green-500",
  path: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500",
  new: "bg-purple-100 dark:bg-purple-900 border-purple-500",
};

export function GraphNode({ data }: NodeProps<GraphNodeData>) {
  const { label, value, highlight = "default", weight } = data;
  const style = graphHighlightStyles[highlight];

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-w-[40px] items-center justify-center rounded-full border-2 px-3 py-2 text-sm font-medium transition-all",
          style
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2 !w-2 !rounded-full !border-2 !border-muted-foreground !bg-background"
        />
        <span className="font-mono">{value ?? label}</span>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2 !w-2 !rounded-full !border-2 !border-muted-foreground !bg-background"
        />
      </div>
      {weight !== undefined && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 rounded bg-muted px-1 text-xs font-mono">
          {weight}
        </div>
      )}
    </div>
  );
}

export type MatrixCellData = {
  value?: string | number;
  row?: number;
  col?: number;
  highlight?: "default" | "row" | "col" | "cell" | "path" | "swap";
  label?: string;
};

const matrixHighlightStyles = {
  default: "bg-background border-border",
  row: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  col: "bg-green-100 dark:bg-green-900 border-green-500",
  cell: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500",
  path: "bg-purple-100 dark:bg-purple-900 border-purple-500",
  swap: "bg-red-100 dark:bg-red-900 border-red-500",
};

export function MatrixCell({ data }: NodeProps<MatrixCellData>) {
  const { value, row, col, highlight = "default", label } = data;
  const style = matrixHighlightStyles[highlight];

  return (
    <div className="relative">
      {(row !== undefined || label) && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          {label ?? `${row},${col}`}
        </div>
      )}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded border-2 text-sm font-mono transition-all",
          style
        )}
      >
        {value}
      </div>
    </div>
  );
}

export const nodeTypes = {
  array: ArrayNode,
  linkedList: LinkedListNode,
  tree: TreeNode,
  graph: GraphNode,
  matrix: MatrixCell,
  default: ArrayNode,
};
