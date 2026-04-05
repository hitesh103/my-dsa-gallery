import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/dsa/CodeBlock";
import { Link } from "@/components/ui/Link";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: Link,
        pre: CodeBlock,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

