import { getD1 } from "@/lib/d1";
import { listAdminProblems, type AdminProblemSummary } from "@/lib/problemStore";

export type AdminDashboardStats = {
  totalProblems: number;
  revisionReady: number;
  needsWork: number;
  totalComments: number;
  openTodos: number;
  totalTopics: number;
  totalPatterns: number;
  totalTags: number;
  activeSessions: number;
};

export type AdminSchemaTable = {
  name: string;
  columns: Array<{ name: string; type: string }>;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  recentProblems: AdminProblemSummary[];
  schemaTables: AdminSchemaTable[];
  queryExamples: string[];
};

async function scalarCount(sql: string) {
  const db = getD1();
  const row = await db.prepare(sql).bind().first<{ c: number | string }>();
  return Number(row?.c ?? 0);
}

async function getSchemaTables(): Promise<AdminSchemaTable[]> {
  const db = getD1();
  const tables = [
    "problems",
    "comments",
    "settings",
    "admin_sessions",
    "todos",
    "tags",
  ];

  return Promise.all(
    tables.map(async (table) => {
      const out = await db
        .prepare(`PRAGMA table_info(${table})`)
        .bind()
        .all<{ name: string; type: string }>();
      return {
        name: table,
        columns: out.results.map((column) => ({
          name: column.name,
          type: column.type,
        })),
      };
    }),
  );
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const adminProblems = await listAdminProblems({ limit: 500 });
  const revisionReady = adminProblems.filter((problem) => problem.isRevisionReady).length;

  const [
    totalComments,
    openTodos,
    totalTopics,
    totalPatterns,
    totalTags,
    activeSessions,
    schemaTables,
  ] = await Promise.all([
    scalarCount("SELECT COUNT(*) as c FROM comments"),
    scalarCount("SELECT COUNT(*) as c FROM todos WHERE done = 0"),
    scalarCount("SELECT COUNT(*) as c FROM tags WHERE type = 'topic'"),
    scalarCount("SELECT COUNT(*) as c FROM tags WHERE type = 'pattern'"),
    scalarCount("SELECT COUNT(*) as c FROM tags"),
    scalarCount(
      "SELECT COUNT(*) as c FROM admin_sessions WHERE expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
    ),
    getSchemaTables(),
  ]);

  return {
    stats: {
      totalProblems: adminProblems.length,
      revisionReady,
      needsWork: adminProblems.length - revisionReady,
      totalComments,
      openTodos,
      totalTopics,
      totalPatterns,
      totalTags,
      activeSessions,
    },
    recentProblems: adminProblems.slice(0, 12),
    schemaTables,
    queryExamples: [
      "SELECT slug, title, topic, pattern, updated_at FROM problems ORDER BY updated_at DESC LIMIT 20",
      "SELECT problem_slug, COUNT(*) AS comments FROM comments GROUP BY problem_slug ORDER BY comments DESC LIMIT 10",
      "DELETE FROM comments WHERE problem_slug = 'two-sum'",
      "UPDATE todos SET done = 1 WHERE done = 0",
    ],
  };
}
