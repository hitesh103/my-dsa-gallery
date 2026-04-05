export type ProblemContent = {
  statementMd: string;
  inputMd: string;
  outputMd: string;
  exampleMd: string;
  exampleExplanationMd: string;
  brute: {
    intuitionMd: string;
    approachMd: string;
    visualization?: FlowVisualization | null;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
  };
  optimal: {
    intuitionMd: string;
    approachMd: string;
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

export type FlowVisualization = {
  nodes: Array<{
    id: string;
    type?: string;
    data?: Record<string, unknown>;
    position: { x: number; y: number };
    style?: Record<string, unknown>;
    className?: string;
    draggable?: boolean;
    selectable?: boolean;
    width?: number;
    height?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, unknown>;
  }>;
  viewport?: { x: number; y: number; zoom: number };
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
