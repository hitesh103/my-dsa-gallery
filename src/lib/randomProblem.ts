/** Local calendar date key (YYYY-MM-DD) for stable daily picks. */
export function dailySeed(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Same problem for everyone on a given calendar day (stable sort by slug). */
export function pickDailyProblem<T extends { slug: string }>(
  problems: T[],
  date: Date = new Date(),
): T | null {
  if (problems.length === 0) return null;
  const sorted = [...problems].sort((a, b) => a.slug.localeCompare(b.slug));
  const index = hashString(dailySeed(date)) % sorted.length;
  return sorted[index] ?? null;
}

export function pickRandomProblem<T>(problems: T[]): T | null {
  if (problems.length === 0) return null;
  const index = Math.floor(Math.random() * problems.length);
  return problems[index] ?? null;
}
