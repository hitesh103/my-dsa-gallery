export type ProblemContent = {
  statementMd: string;
  inputMd: string;
  outputMd: string;
  exampleMd: string;
  exampleExplanationMd: string;
  brute: {
    intuitionMd: string;
    approachMd: string;
    mermaid?: string;
    codeJava: string;
    time: string;
    space: string;
    complexityExplanationMd: string;
  };
  optimal: {
    intuitionMd: string;
    approachMd: string;
    mermaid?: string;
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
