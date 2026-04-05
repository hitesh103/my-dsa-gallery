import { ComplexityBadge } from "@/components/dsa/ComplexityBadge";
import { MermaidDiagram } from "@/components/dsa/MermaidDiagram";
import { Markdown } from "@/components/dsa/Markdown";
import { QuickRevision } from "@/components/dsa/QuickRevision";
import type { ProblemDoc } from "@/lib/problemDoc";

function javaFence(code: string) {
  const trimmed = (code ?? "").trimEnd();
  return `\`\`\`java\n${trimmed}\n\`\`\``;
}

export function ProblemDocView({ problem }: { problem: ProblemDoc }) {
  const c = problem.content;

  return (
    <>
      <h1>{problem.title}</h1>

      <p>
        Problem link:{" "}
        <a href={problem.link} target="_blank" rel="noreferrer">
          {problem.link}
        </a>
      </p>

      <h2>Problem Statement</h2>
      <Markdown>{c.statementMd}</Markdown>

      <h2>Input</h2>
      <Markdown>{c.inputMd}</Markdown>

      <h2>Output</h2>
      <Markdown>{c.outputMd}</Markdown>

      <h2>Example</h2>
      <Markdown>{c.exampleMd}</Markdown>
      {c.exampleExplanationMd ? <Markdown>{c.exampleExplanationMd}</Markdown> : null}

      <h2>Brute Force</h2>
      <h3>Intuition</h3>
      <Markdown>{c.brute.intuitionMd}</Markdown>
      <h3>Approach</h3>
      <Markdown>{c.brute.approachMd}</Markdown>
      {c.brute.mermaid ? (
        <>
          <h3>Visualization</h3>
          <MermaidDiagram diagram={c.brute.mermaid} />
        </>
      ) : null}
      <h3>Code (Java)</h3>
      <Markdown>{javaFence(c.brute.codeJava)}</Markdown>
      <ComplexityBadge time={c.brute.time} space={c.brute.space} className="mt-3" />
      <h3>Complexity Analysis (with explanation)</h3>
      <Markdown>{c.brute.complexityExplanationMd}</Markdown>

      <h2>Optimal Solution</h2>
      <h3>Intuition</h3>
      <Markdown>{c.optimal.intuitionMd}</Markdown>
      <h3>Approach</h3>
      <Markdown>{c.optimal.approachMd}</Markdown>
      {c.optimal.mermaid ? (
        <>
          <h3>Visualization</h3>
          <MermaidDiagram diagram={c.optimal.mermaid} />
        </>
      ) : null}
      <h3>Code (Java)</h3>
      <Markdown>{javaFence(c.optimal.codeJava)}</Markdown>
      <ComplexityBadge time={c.optimal.time} space={c.optimal.space} className="mt-3" />
      <h3>Complexity Analysis (with explanation)</h3>
      <Markdown>{c.optimal.complexityExplanationMd}</Markdown>

      <QuickRevision brute={c.quickRevision.brute ?? []} optimal={c.quickRevision.optimal ?? []} />
    </>
  );
}
