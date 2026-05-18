import { AsciiRenderer, AsciiStepper } from "@/components/dsa/AsciiRenderer";
import { ComplexityBadge } from "@/components/dsa/ComplexityBadge";
import { ExecutionRenderer } from "@/components/dsa/ExecutionRenderer";
import { CodeSnippet } from "@/components/dsa/CodeBlock";
import { FlowDiagram } from "@/components/dsa/FlowDiagram";
import { Markdown } from "@/components/dsa/Markdown";
import { MermaidRenderer, MermaidStepper } from "@/components/dsa/MermaidRenderer";
import { QuickRevision } from "@/components/dsa/QuickRevision";
import type { ProblemDoc, Visualization } from "@/lib/problemDoc";

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

function SectionWithViz({
  title,
  md,
  visualization,
  className,
}: {
  title: string;
  md: string;
  visualization?: Visualization | null;
  className?: string;
}) {
  if (!md && !visualization) return null;
  return (
    <div className={className}>
      <h3>{title}</h3>
      <Markdown>{md}</Markdown>
      {visualization ? <Visualization visualization={visualization} /> : null}
    </div>
  );
}

function hasBruteContent(c: ProblemDoc["content"]): boolean {
  const b = c.brute;
  return Boolean(
    b.intuitionMd ||
    b.approachMd ||
    b.dryRun ||
    b.codeJava ||
    b.complexityExplanationMd ||
    b.visualization ||
    b.intuitionVisualization ||
    b.approachVisualization ||
    b.dryRunVisualization ||
    b.complexityVisualization
  );
}

function hasOptimalContent(c: ProblemDoc["content"]): boolean {
  const o = c.optimal;
  return Boolean(
    o.intuitionMd ||
    o.approachMd ||
    o.dryRun ||
    o.codeJava ||
    o.complexityExplanationMd ||
    o.visualization ||
    o.intuitionVisualization ||
    o.approachVisualization ||
    o.dryRunVisualization ||
    o.complexityVisualization
  );
}

export function ProblemDocView({ problem }: { problem: ProblemDoc }) {
  const c = problem.content;
  const showBrute = hasBruteContent(c);
  const showOptimal = hasOptimalContent(c);

  return (
    <>
      <h1>{problem.title}</h1>

      <p>
        Problem link:{" "}
        <a href={problem.link} target="_blank" rel="noreferrer">
          {problem.link}
        </a>
      </p>

      {c.statementMd || c.statementVisualization ? (
        <>
          <h2>Problem Statement</h2>
          <Markdown>{c.statementMd}</Markdown>
          {c.statementVisualization ? <Visualization visualization={c.statementVisualization} /> : null}
        </>
      ) : null}

      {c.inputMd || c.inputVisualization ? (
        <>
          <h2>Input</h2>
          <Markdown>{c.inputMd}</Markdown>
          {c.inputVisualization ? <Visualization visualization={c.inputVisualization} /> : null}
        </>
      ) : null}

      {c.outputMd || c.outputVisualization ? (
        <>
          <h2>Output</h2>
          <Markdown>{c.outputMd}</Markdown>
          {c.outputVisualization ? <Visualization visualization={c.outputVisualization} /> : null}
        </>
      ) : null}

      {c.exampleMd || c.exampleVisualization || c.exampleExplanationMd ? (
        <>
          <h2>Example</h2>
          <Markdown>{c.exampleMd}</Markdown>
          {c.exampleVisualization ? <Visualization visualization={c.exampleVisualization} /> : null}
          {c.exampleExplanationMd || c.exampleExplanationVisualization ? (
            <SectionWithViz
              title="Explanation"
              md={c.exampleExplanationMd}
              visualization={c.exampleExplanationVisualization}
              className="mt-4"
            />
          ) : null}
        </>
      ) : null}

      {showBrute ? (
        <>
          <h2>Brute Force</h2>
          <SectionWithViz title="Intuition" md={c.brute.intuitionMd} visualization={c.brute.intuitionVisualization} />
          <SectionWithViz title="Approach" md={c.brute.approachMd} visualization={c.brute.approachVisualization} />
          {c.brute.dryRun ? (
            <SectionWithViz title="Dry Run" md={c.brute.dryRun} visualization={c.brute.dryRunVisualization} />
          ) : null}
          {c.brute.visualization ? (
            <SectionWithViz title="Visualization" md="" visualization={c.brute.visualization} />
          ) : null}
          {c.brute.codeJava ? (
            <>
              <h3>Code (Java)</h3>
              <CodeSnippet code={c.brute.codeJava} />
            </>
          ) : null}
          {c.brute.time || c.brute.space ? (
            <ComplexityBadge time={c.brute.time} space={c.brute.space} className="mt-3" />
          ) : null}
          <SectionWithViz
            title="Complexity Analysis"
            md={c.brute.complexityExplanationMd}
            visualization={c.brute.complexityVisualization}
            className="mt-4"
          />
        </>
      ) : null}

      {showOptimal ? (
        <>
          <h2>Optimal Solution</h2>
          <SectionWithViz title="Intuition" md={c.optimal.intuitionMd} visualization={c.optimal.intuitionVisualization} />
          <SectionWithViz title="Approach" md={c.optimal.approachMd} visualization={c.optimal.approachVisualization} />
          {c.optimal.dryRun ? (
            <SectionWithViz title="Dry Run" md={c.optimal.dryRun} visualization={c.optimal.dryRunVisualization} />
          ) : null}
          {c.optimal.visualization ? (
            <SectionWithViz title="Visualization" md="" visualization={c.optimal.visualization} />
          ) : null}
          {c.optimal.codeJava ? (
            <>
              <h3>Code (Java)</h3>
              <CodeSnippet code={c.optimal.codeJava} />
            </>
          ) : null}
          {c.optimal.time || c.optimal.space ? (
            <ComplexityBadge time={c.optimal.time} space={c.optimal.space} className="mt-3" />
          ) : null}
          <SectionWithViz
            title="Complexity Analysis"
            md={c.optimal.complexityExplanationMd}
            visualization={c.optimal.complexityVisualization}
            className="mt-4"
          />
        </>
      ) : null}

      {c.quickRevision?.brute?.length || c.quickRevision?.optimal?.length ? (
        <QuickRevision brute={c.quickRevision.brute ?? []} optimal={c.quickRevision.optimal ?? []} />
      ) : null}
    </>
  );
}
