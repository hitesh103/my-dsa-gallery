import { getD1 } from "@/lib/d1";

export type AdminSqlMode = "read" | "write";

export type AdminSqlResult =
  | {
      mode: "read";
      rowCount: number;
      rows: Record<string, unknown>[];
      truncated: boolean;
      durationMs: number;
    }
  | {
      mode: "write";
      meta: unknown;
      durationMs: number;
    };

function normalizeSql(sql: string) {
  return sql.trim();
}

function stripTrailingSemicolon(sql: string) {
  return sql.replace(/;\s*$/, "").trim();
}

function hasMultipleStatements(sql: string) {
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (!inSingle && !inDouble) {
      if (char === "-" && next === "-") {
        inLineComment = true;
        i++;
        continue;
      }
      if (char === "/" && next === "*") {
        inBlockComment = true;
        i++;
        continue;
      }
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (char === ";" && !inSingle && !inDouble) {
      return true;
    }
  }

  return false;
}

function firstKeyword(sql: string) {
  const match = sql.match(/^[a-z]+/i);
  return match ? match[0].toLowerCase() : "";
}

function assertAllowed(sql: string, mode: AdminSqlMode) {
  const keyword = firstKeyword(sql);
  const allowedRead = new Set(["select", "pragma", "explain", "with"]);
  const allowedWrite = new Set([
    "insert",
    "update",
    "delete",
    "create",
    "drop",
    "alter",
    "replace",
    "with",
  ]);

  if (mode === "read" && !allowedRead.has(keyword)) {
    throw new Error("Read mode only allows SELECT, PRAGMA, EXPLAIN, or WITH queries.");
  }
  if (mode === "write" && !allowedWrite.has(keyword)) {
    throw new Error(
      "Write mode only allows INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, REPLACE, or WITH queries.",
    );
  }
}

export async function executeAdminSql(
  rawSql: string,
  mode: AdminSqlMode,
): Promise<AdminSqlResult> {
  const normalized = normalizeSql(rawSql);
  if (!normalized) throw new Error("Query is empty.");

  const statement = stripTrailingSemicolon(normalized);
  if (!statement) throw new Error("Query is empty.");
  if (hasMultipleStatements(statement)) {
    throw new Error("Run one SQL statement at a time.");
  }

  assertAllowed(statement, mode);

  const db = getD1();
  const startedAt = Date.now();

  if (mode === "read") {
    const out = await db.prepare(statement).bind().all<Record<string, unknown>>();
    const rows = out.results;
    return {
      mode,
      rowCount: rows.length,
      rows: rows.slice(0, 200),
      truncated: rows.length > 200,
      durationMs: Date.now() - startedAt,
    };
  }

  const result = await db.prepare(statement).bind().run();
  return {
    mode,
    meta: result,
    durationMs: Date.now() - startedAt,
  };
}
