import NextLink from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = AnchorHTMLAttributes<HTMLAnchorElement>;

export function Link({ className, href, ...props }: Props) {
  const classes = cn(
    "font-medium underline underline-offset-4 decoration-link/40 hover:decoration-link",
    className,
  );

  if (!href) return <a className={classes} {...props} />;
  if (href.startsWith("/")) return <NextLink className={classes} href={href} {...props} />;
  return <a className={classes} href={href} rel="noreferrer" target="_blank" {...props} />;
}

