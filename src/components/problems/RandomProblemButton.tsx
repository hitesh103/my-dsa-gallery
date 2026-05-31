"use client";

import { useRouter } from "next/navigation";

import { pickRandomProblem } from "@/lib/randomProblem";
import { cn } from "@/lib/cn";

type SlugItem = { slug: string };

export function RandomProblemButton<T extends SlugItem>({
  problems,
  label = "Random problem",
  className,
  disabled,
}: {
  problems: T[];
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const isDisabled = disabled ?? problems.length === 0;

  const onClick = () => {
    const selected = pickRandomProblem(problems);
    if (!selected) return;
    router.push(`/problems/${selected.slug}`);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:disabled:border-slate-800 dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7L11 12l-4.3-4.3A4.2 4.2 0 0 0 3.4 6H2" />
        <path d="M22 6h-1.4c-1.3 0-2.5.6-3.3 1.7L13 12l4.3 4.3A4.2 4.2 0 0 0 20.6 18H22" />
      </svg>
      {label}
    </button>
  );
}
