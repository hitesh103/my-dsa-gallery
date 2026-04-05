export type ProblemMeta = {
  slug: string;
  title: string;
  topic: string;
  pattern: string;
  link: string;
};

type Entry = ProblemMeta & {
  load: () => Promise<{ default: React.ComponentType; meta?: unknown }>;
};

export const PROBLEMS: Entry[] = [
  {
    slug: "lower-bound",
    title: "Lower Bound (Binary Search)",
    topic: "Binary Search",
    pattern: "Lower Bound / First index with a[i] ≥ x",
    link: "https://www.geeksforgeeks.org/problems/implement-lower-bound/1",
    load: () => import("@/content/lower-bound.mdx"),
  },
  {
    slug: "jump-game-ii",
    title: "Jump Game II",
    topic: "Greedy",
    pattern: "Range expansion (BFS levels)",
    link: "https://leetcode.com/problems/jump-game-ii/",
    load: () => import("@/content/jump-game-ii.mdx"),
  },
  {
    slug: "n-queen",
    title: "N-Queen",
    topic: "Backtracking",
    pattern: "Row-by-row + hashing (cols/diagonals)",
    link: "https://leetcode.com/problems/n-queens/",
    load: () => import("@/content/n-queen.mdx"),
  },
  {
    slug: "job-sequencing",
    title: "Job Sequencing (Greedy)",
    topic: "Greedy",
    pattern: "Sort by profit + place latest slot",
    link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    load: () => import("@/content/job-sequencing.mdx"),
  },
  {
    slug: "find-leaf-nodes",
    title: "Find Leaf Nodes (Tree)",
    topic: "Trees",
    pattern: "DFS/BFS traversal",
    link: "https://www.geeksforgeeks.org/print-leaf-nodes-binary-tree-right-left/",
    load: () => import("@/content/find-leaf-nodes.mdx"),
  },
];

export function getProblemSlugs() {
  return PROBLEMS.map((p) => p.slug);
}

export async function getProblemBySlug(slug: string) {
  const entry = PROBLEMS.find((p) => p.slug === slug);
  if (!entry) return null;
  const mod = await entry.load();
  const meta = (mod.meta as ProblemMeta | undefined) ?? entry;
  return { meta, Content: mod.default };
}

export function groupProblems() {
  const byTopic = new Map<string, Entry[]>();
  for (const p of PROBLEMS) {
    const list = byTopic.get(p.topic) ?? [];
    list.push(p);
    byTopic.set(p.topic, list);
  }
  return Array.from(byTopic.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

