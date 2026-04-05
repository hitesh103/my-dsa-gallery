import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none",
        "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
        className,
      )}
    >
      {children}
    </article>
  );
}

