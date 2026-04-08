export type ProblemContent = {
  statementMd: string;
  inputMd: string;
  outputMd: string;
  exampleMd: string;
  exampleExplanationMd: string;
  brute: {
    intuitionMd: string;
    approachMd: string;
    dryRun?: string;
    visualization?: FlowVisualization | null;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
  };
  optimal: {
    intuitionMd: string;
    approachMd: string;
    dryRun?: string;
    visualization?: FlowVisualization | null;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
  };
  quickRevision: {
    brute: string[];
    optimal: string[];
  };
};

export type FlowNode = {
  id: string;
  type?: "array" | "linkedList" | "tree" | "graph" | "matrix" | "flowchart" | string;
  data?: FlowNodeData;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
  className?: string;
  draggable?: boolean;
  selectable?: boolean;
  width?: number;
  height?: number;
  sourcePosition?: "top" | "bottom" | "left" | "right";
  targetPosition?: "top" | "bottom" | "left" | "right";
};

export type FlowNodeData = 
  | {
      type?: "array";
      label?: string;
      index?: number;
      value?: string | number;
      highlight?: "default" | "active" | "comparing" | "swapped" | "done";
      extra?: string;
    }
  | {
      type?: "linkedList";
      value?: string | number;
      nextPointer?: boolean;
      randomPointer?: boolean;
      highlight?: "default" | "new" | "modified" | "traversed";
      nextLabel?: string;
      randomLabel?: string;
    }
  | {
      type?: "tree";
      value?: string | number;
      highlight?: "default" | "current" | "left" | "right" | "visited" | "new";
      leftLabel?: string;
      rightLabel?: string;
    }
  | {
      type?: "graph";
      label?: string;
      value?: string | number;
      highlight?: "default" | "source" | "target" | "visited" | "path" | "new";
      weight?: string | number;
    }
  | {
      type?: "matrix";
      value?: string | number;
      row?: number;
      col?: number;
      highlight?: "default" | "row" | "col" | "cell" | "path" | "swap";
      label?: string;
    }
  | Record<string, unknown>;

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: "bezier" | "straight" | string;
  label?: string;
  animated?: boolean;
  data?: FlowEdgeData;
  style?: Record<string, unknown>;
  sourcePosition?: "top" | "bottom" | "left" | "right";
  targetPosition?: "top" | "bottom" | "left" | "right";
};

export type FlowEdgeData = {
  type?: "next" | "random" | "left" | "right" | "parent" | "child" | "edge" | "undirected";
  weight?: string | number;
  highlight?: "default" | "active" | "path" | "visited" | "new";
  label?: string;
};

export type FlowVisualizationStep = {
  label?: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
};

export type ExecutionStep = {
  step: number;
  label?: string;
  description?: string;
  state?: Record<string, unknown>;
  action?: string;
  highlight?: string;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type ExecutionVisualization = {
  steps: ExecutionStep[];
  initialState?: Record<string, unknown>;
};

export type VisualizationType = "flow" | "execution";

export type FlowVisualization = {
  type?: VisualizationType;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
  steps?: FlowVisualizationStep[];
  flowSteps?: FlowVisualizationStep[];
  executionSteps?: ExecutionStep[];
};

export type ProblemDoc = {
  slug: string;
  title: string;
  topic: string;
  pattern: string;
  link: string;
  content: ProblemContent;
  createdAt?: string;
  updatedAt?: string;
};

export type ProblemMeta = Pick<ProblemDoc, "slug" | "title" | "topic" | "pattern" | "link"> & {
  updatedAt?: string;
};
