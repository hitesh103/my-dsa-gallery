import { AsciiRenderer, AsciiStepper } from "@/components/dsa/AsciiRenderer";
import { ComplexityBadge } from "@/components/dsa/ComplexityBadge";
import { ExecutionRenderer } from "@/components/dsa/ExecutionRenderer";
import { FlowDiagram } from "@/components/dsa/FlowDiagram";
import { Markdown } from "@/components/dsa/Markdown";
import { MermaidRenderer, MermaidStepper } from "@/components/dsa/MermaidRenderer";
import { QuickRevision } from "@/components/dsa/QuickRevision";
import type { ProblemDoc, Visualization } from "@/lib/problemDoc";

function javaFence(code: string) {
  const trimmed = (code ?? "").trimEnd();
  return `\`\`\`java\n${trimmed}\n\`\`\``;
}

function isMermaidWithSteps(viz: Visualization): viz is { engine: "mermaid"; steps: { label?: string; description?: string; code: string }[] } {
  return viz.engine === "mermaid" && "steps" in viz && Array.isArray((viz as { steps: unknown }).steps);
}

function isAsciiWithSteps(viz: Visualization): viz is { engine: "ascii"; steps: { label?: string; description?: string; lines: string[] }[] } {
  return viz.engine === "ascii" && "steps" in viz && Array.isArray((viz as { steps: unknown }).steps);
}

function Visualization({ visualization }: { visualization: Visualization | null | undefined }) {
  if (!visualization) return null;

  if (visualization.engine === "mermaid") {
    if (isMermaidWithSteps(visualization)) {
      return <MermaidStepper steps={visualization.steps} />;
    }
    return <MermaidRenderer code={visualization.code} />;
  }

  if (visualization.engine === "ascii") {
    if (isAsciiWithSteps(visualization)) {
      return <AsciiStepper steps={visualization.steps} />;
    }
    return <AsciiRenderer lines={visualization.lines} />;
  }

  const type = visualization.type;
  if (type === "execution") {
    return <ExecutionRenderer visualization={{ steps: visualization.executionSteps ?? [] }} />;
  }

  return <FlowDiagram visualization={visualization} />;
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
      {c.brute.dryRun ? (
        <>
          <h3>Dry Run</h3>
          <Markdown>{c.brute.dryRun}</Markdown>
        </>
      ) : null}
      {c.brute.visualization ? (
        <>
          <h3>Visualization</h3>
          <Visualization visualization={c.brute.visualization} />
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
      {c.optimal.dryRun ? (
        <>
          <h3>Dry Run</h3>
          <Markdown>{c.optimal.dryRun}</Markdown>
        </>
      ) : null}
      {c.optimal.visualization ? (
        <>
          <h3>Visualization</h3>
          <Visualization visualization={c.optimal.visualization} />
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
