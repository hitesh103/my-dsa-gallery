export type ProblemContent = {
  statementMd: string;
  statementVisualization?: Visualization | null;
  inputMd: string;
  inputVisualization?: Visualization | null;
  outputMd: string;
  outputVisualization?: Visualization | null;
  exampleMd: string;
  exampleVisualization?: Visualization | null;
  exampleExplanationMd: string;
  exampleExplanationVisualization?: Visualization | null;
  brute: {
    intuitionMd: string;
    intuitionVisualization?: Visualization | null;
    approachMd: string;
    approachVisualization?: Visualization | null;
    dryRun?: string;
    dryRunVisualization?: Visualization | null;
    visualization?: Visualization | null;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
    complexityVisualization?: Visualization | null;
  };
  optimal: {
    intuitionMd: string;
    intuitionVisualization?: Visualization | null;
    approachMd: string;
    approachVisualization?: Visualization | null;
    dryRun?: string;
    dryRunVisualization?: Visualization | null;
    visualization?: Visualization | null;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
    complexityVisualization?: Visualization | null;
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

export type VisualizationEngine = "reactflow" | "mermaid" | "ascii";

export type VisualizationType = "flow" | "execution";

export type MermaidVisualization = {
  engine: "mermaid";
  code: string;
  title?: string;
};

export type AsciiVisualization = {
  engine: "ascii";
  lines: string[];
  title?: string;
};

export type AsciiStep = {
  label?: string;
  description?: string;
  lines: string[];
};

export type AsciiVisualizationWithSteps = {
  engine: "ascii";
  steps: AsciiStep[];
};

export type MermaidStep = {
  label?: string;
  description?: string;
  code: string;
};

export type MermaidVisualizationWithSteps = {
  engine: "mermaid";
  steps: MermaidStep[];
};

export type ReactFlowVisualization = {
  engine?: "reactflow";
  type?: VisualizationType;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
  steps?: FlowVisualizationStep[];
  flowSteps?: FlowVisualizationStep[];
  executionSteps?: ExecutionStep[];
};

export type FlowVisualization = ReactFlowVisualization;

export type Visualization = 
  | ReactFlowVisualization 
  | MermaidVisualization 
  | MermaidVisualizationWithSteps
  | AsciiVisualization 
  | AsciiVisualizationWithSteps;

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
  isRevisionReady?: boolean;
};
