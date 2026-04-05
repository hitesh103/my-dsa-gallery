import type { Tone } from "@/components/ui/Badge";

const PALETTE: Tone[] = ["blue", "emerald", "amber", "purple", "rose", "slate"];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function toneForLabel(label: string): Tone {
  const idx = hashString(label) % PALETTE.length;
  return PALETTE[idx] ?? "zinc";
}

export function toneForTopic(topic: string): Tone {
  return toneForLabel(`topic:${topic}`);
}

export function toneForPattern(pattern: string): Tone {
  // Give some common patterns stable, semantically nice colors.
  const p = pattern.toLowerCase();
  if (p.includes("sliding")) return "blue";
  if (p.includes("two pointer")) return "blue";
  if (p.includes("dfs") || p.includes("bfs") || p.includes("traversal")) return "emerald";
  if (p.includes("binary")) return "amber";
  if (p.includes("backtrack")) return "purple";
  if (p.includes("greedy")) return "rose";
  return toneForLabel(`pattern:${pattern}`);
}

