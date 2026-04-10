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
  return (
    <div className={className}>
      <h3>{title}</h3>
      <Markdown>{md}</Markdown>
      {visualization ? <Visualization visualization={visualization} /> : null}
    </div>
  );
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
      {c.statementVisualization ? <Visualization visualization={c.statementVisualization} /> : null}

      <h2>Input</h2>
      <Markdown>{c.inputMd}</Markdown>
      {c.inputVisualization ? <Visualization visualization={c.inputVisualization} /> : null}

      <h2>Output</h2>
      <Markdown>{c.outputMd}</Markdown>
      {c.outputVisualization ? <Visualization visualization={c.outputVisualization} /> : null}

      <h2>Example</h2>
      <Markdown>{c.exampleMd}</Markdown>
      {c.exampleVisualization ? <Visualization visualization={c.exampleVisualization} /> : null}
      {c.exampleExplanationMd ? (
        <SectionWithViz
          title="Explanation"
          md={c.exampleExplanationMd}
          visualization={c.exampleExplanationVisualization}
          className="mt-4"
        />
      ) : null}

      <h2>Brute Force</h2>
      <SectionWithViz title="Intuition" md={c.brute.intuitionMd} visualization={c.brute.intuitionVisualization} />
      <SectionWithViz title="Approach" md={c.brute.approachMd} visualization={c.brute.approachVisualization} />
      {c.brute.dryRun ? (
        <SectionWithViz title="Dry Run" md={c.brute.dryRun} visualization={c.brute.dryRunVisualization} />
      ) : null}
      {c.brute.visualization ? (
        <SectionWithViz title="Visualization" md="" visualization={c.brute.visualization} />
      ) : null}
      <h3>Code (Java)</h3>
      <Markdown>{javaFence(c.brute.codeJava)}</Markdown>
      <ComplexityBadge time={c.brute.time} space={c.brute.space} className="mt-3" />
      <SectionWithViz
        title="Complexity Analysis"
        md={c.brute.complexityExplanationMd}
        visualization={c.brute.complexityVisualization}
        className="mt-4"
      />

      <h2>Optimal Solution</h2>
      <SectionWithViz title="Intuition" md={c.optimal.intuitionMd} visualization={c.optimal.intuitionVisualization} />
      <SectionWithViz title="Approach" md={c.optimal.approachMd} visualization={c.optimal.approachVisualization} />
      {c.optimal.dryRun ? (
        <SectionWithViz title="Dry Run" md={c.optimal.dryRun} visualization={c.optimal.dryRunVisualization} />
      ) : null}
      {c.optimal.visualization ? (
        <SectionWithViz title="Visualization" md="" visualization={c.optimal.visualization} />
      ) : null}
      <h3>Code (Java)</h3>
      <Markdown>{javaFence(c.optimal.codeJava)}</Markdown>
      <ComplexityBadge time={c.optimal.time} space={c.optimal.space} className="mt-3" />
      <SectionWithViz
        title="Complexity Analysis"
        md={c.optimal.complexityExplanationMd}
        visualization={c.optimal.complexityVisualization}
        className="mt-4"
      />

      <QuickRevision brute={c.quickRevision.brute ?? []} optimal={c.quickRevision.optimal ?? []} />
    </>
  );
}