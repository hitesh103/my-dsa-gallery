import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type Tone =
  | "zinc"
  | "blue"
  | "emerald"
  | "amber"
  | "purple"
  | "rose"
  | "slate";

function toneClasses(tone: Tone) {
  switch (tone) {
    case "blue":
      return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100";
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-100";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100";
    case "purple":
      return "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/35 dark:text-purple-100";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-100";
    case "slate":
      return "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100";
    case "zinc":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100";
  }
}

export function Badge({
  className,
  tone = "zinc",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses(tone),
        className,
      )}
      {...props}
    />
  );
}
