import { Handle, Position, type NodeProps } from "reactflow";
import { cn } from "@/lib/cn";

const hiddenHandleClassName =
  "!h-2 !w-2 !rounded-full !border-0 !bg-transparent !opacity-0 pointer-events-none";

function SideHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="t-top" className={hiddenHandleClassName} />
      <Handle type="source" position={Position.Top} id="s-top" className={hiddenHandleClassName} />
      <Handle type="target" position={Position.Right} id="t-right" className={hiddenHandleClassName} />
      <Handle type="source" position={Position.Right} id="s-right" className={hiddenHandleClassName} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" className={hiddenHandleClassName} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className={hiddenHandleClassName} />
      <Handle type="target" position={Position.Left} id="t-left" className={hiddenHandleClassName} />
      <Handle type="source" position={Position.Left} id="s-left" className={hiddenHandleClassName} />
    </>
  );
}

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
        <SideHandles />
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

export function LinkedListNode({ data }: NodeProps<LinkedListNodeData>) {
  const { value, highlight = "default" } = data;
  const style = llHighlightStyles[highlight];

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "flex min-w-[48px] items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-mono font-medium transition-all",
          style
        )}
      >
        <SideHandles />
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
      <SideHandles />
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
        <SideHandles />
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
        <SideHandles />
        {value}
      </div>
    </div>
  );
}

export type FlowchartNodeData = {
  label?: string;
  value?: string | number;
  highlight?: "default" | "active" | "success" | "danger";
  extra?: string;
};

const flowchartHighlightStyles = {
  default: "bg-card border-border",
  active: "bg-blue-100 dark:bg-blue-900 border-blue-500",
  success: "bg-green-100 dark:bg-green-900 border-green-500",
  danger: "bg-red-100 dark:bg-red-900 border-red-500",
};

export function FlowchartNode({ data }: NodeProps<FlowchartNodeData>) {
  const { label, value, highlight = "default", extra } = data;
  const style = flowchartHighlightStyles[highlight];

  return (
    <div
      className={cn(
        "relative flex min-w-[120px] max-w-[220px] items-center justify-center rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all",
        style
      )}
    >
      <SideHandles />
      <div className="flex flex-col items-center gap-1">
        <span>{value ?? label}</span>
        {extra ? <span className="text-xs text-muted-foreground">{extra}</span> : null}
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
  flowchart: FlowchartNode,
  default: FlowchartNode,
};
