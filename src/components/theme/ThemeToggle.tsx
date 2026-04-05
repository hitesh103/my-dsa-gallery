"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        applyTheme(stored);
      }
    } catch {
      // no-op
    }
    setTheme(getCurrentTheme());
  }, []);

  const label = useMemo(() => {
    if (!theme) return "Theme";
    return theme === "dark" ? "Dark" : "Light";
  }, [theme]);

  const onToggle = () => {
    const current = getCurrentTheme();
    const next: Theme = current === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // no-op
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium",
        "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
      )}
      aria-label="Toggle theme"
    >
      {label}
    </button>
  );
}

