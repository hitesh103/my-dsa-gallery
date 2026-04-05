declare module "*.mdx" {
  import type { ComponentProps, ComponentType } from "react";

  const MDXContent: ComponentType<ComponentProps<"div">>;
  export default MDXContent;

  export const meta: Record<string, unknown> | undefined;
}
