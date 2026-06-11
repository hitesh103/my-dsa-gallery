import { Markdown } from "@/components/dsa/Markdown";
import { CodeSnippet } from "@/components/dsa/CodeBlock";
import { AsciiRenderer, AsciiStepper } from "@/components/dsa/AsciiRenderer";
import { MermaidRenderer, MermaidStepper } from "@/components/dsa/MermaidRenderer";
import { ExecutionRenderer } from "@/components/dsa/ExecutionRenderer";
import { FlowDiagram } from "@/components/dsa/FlowDiagram";
import type { ContentItemDoc, ContentItemSection, Visualization } from "@/lib/contentDoc";

function isMermaidWithSteps(viz: Visualization): viz is { engine: "mermaid"; steps: { label?: string; description?: string; code: string }[] } {
  return viz.engine === "mermaid" && "steps" in viz && Array.isArray(viz.steps);
}

function isAsciiWithSteps(viz: Visualization): viz is { engine: "ascii"; steps: { label?: string; description?: string; lines: string[] }[] } {
  return viz.engine === "ascii" && "steps" in viz && Array.isArray(viz.steps);
}

function RenderVisualization({ viz }: { viz: Visualization }) {
  if (viz.engine === "mermaid") {
    if (isMermaidWithSteps(viz)) return <MermaidStepper steps={viz.steps} />;
    return <MermaidRenderer code={viz.code ?? ""} />;
  }
  if (viz.engine === "ascii") {
    if (isAsciiWithSteps(viz)) return <AsciiStepper steps={viz.steps} />;
    return <AsciiRenderer lines={viz.lines ?? []} />;
  }
  if (viz.engine === "execution") {
    return <ExecutionRenderer visualization={{ steps: viz.executionSteps ?? [] }} />;
  }
  return <FlowDiagram visualization={viz as any} />;
}

function RenderSection({ section }: { section: ContentItemSection }) {
  return (
    <section className="mb-10 first:mt-0">
      {section.title && (
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {section.title}
        </h2>
      )}
      
      {section.bodyMd && <Markdown>{section.bodyMd}</Markdown>}

      {section.visuals?.map((viz, idx) => (
        <div key={idx} className="my-6">
          <RenderVisualization viz={viz} />
        </div>
      ))}

      {section.codeBlocks?.map((cb, idx) => (
        <div key={idx} className="my-6">
          {cb.title && <h3 className="mb-2 text-sm font-medium text-muted-foreground">{cb.title}</h3>}
          <CodeSnippet code={cb.code} language={cb.language} />
        </div>
      ))}
    </section>
  );
}

export function ContentItemView({ doc }: { doc: ContentItemDoc }) {
  return (
    <article className="w-full">
      <header className="mb-8 border-b pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {doc.title}
        </h1>
        {doc.summary && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {doc.summary}
          </p>
        )}
      </header>

      <div className="space-y-2">
        {doc.content.sections.map((section) => (
          <RenderSection key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}
