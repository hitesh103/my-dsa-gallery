import type { MDXComponents } from "mdx/types";

import { CodeBlock } from "@/components/dsa/CodeBlock";
import { Link } from "@/components/ui/Link";
import { Prose } from "@/components/ui/Prose";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <Prose>{children}</Prose>,
    a: Link,
    pre: CodeBlock,
    ...components,
  };
}

