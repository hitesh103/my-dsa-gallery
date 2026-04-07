"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AdminSchemaTable } from "@/lib/adminDashboard";

type AdminSqlResult =
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

type SqlResponse = { ok: true; result: AdminSqlResult } | { error: string };

function renderCell(value: unknown) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AdminSqlConsole({
  schemaTables,
  queryExamples,
  onChanged,
  onStatus,
}: {
  schemaTables: AdminSchemaTable[];
  queryExamples: string[];
  onChanged: () => Promise<void>;
  onStatus: (message: string) => void;
}) {
  const [sql, setSql] = useState(
    "SELECT slug, title, updated_at FROM problems ORDER BY updated_at DESC LIMIT 20",
  );
  const [mode, setMode] = useState<"read" | "write">("read");
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AdminSqlResult | null>(null);

  const columns = useMemo(() => {
    if (!result || result.mode !== "read" || result.rows.length === 0) return [];
    return Array.from(
      new Set(result.rows.flatMap((row) => Object.keys(row))),
    );
  }, [result]);

  const onRun = async () => {
    if (mode === "write" && !confirmWrite) {
      onStatus("Enable the write confirmation before running mutating SQL.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, mode }),
      });
      const json = (await res.json()) as SqlResponse;
      if (!res.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "SQL execution failed");
      }
      setResult(json.result);
      onStatus(
        json.result.mode === "read"
          ? `Read query returned ${json.result.rowCount} row(s) in ${json.result.durationMs}ms.`
          : `Write query completed in ${json.result.durationMs}ms.`,
      );
      if (json.result.mode === "write") {
        await onChanged();
      }
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "SQL execution failed");
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>D1 Query Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value === "write" ? "write" : "read")}
              className="h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            {queryExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setSql(example)}
                className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {example.slice(0, 28)}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-xl border bg-background px-3 py-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={confirmWrite}
              onChange={(e) => setConfirmWrite(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <span>I understand write mode changes D1 immediately</span>
          </label>

          <button
            type="button"
            onClick={() => void onRun()}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {busy ? "Running…" : "Run SQL"}
          </button>
        </div>

        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs font-medium text-muted-foreground">Schema</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {schemaTables.map((table) => (
              <div key={table.name} className="rounded-lg border p-3">
                <div className="font-mono text-xs font-semibold">{table.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {table.columns.map((column) => `${column.name} ${column.type}`).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {result ? (
          <div className="rounded-xl border">
            <div className="border-b px-4 py-3 text-sm font-medium">
              {result.mode === "read" ? "Result Set" : "Mutation Result"}
            </div>
            <div className="p-4">
              {result.mode === "read" ? (
                result.rows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No rows returned.</div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      {result.rowCount} row(s)
                      {result.truncated ? " shown first 200 only" : ""}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-xs">
                        <thead>
                          <tr className="border-b">
                            {columns.map((column) => (
                              <th
                                key={column}
                                className="px-3 py-2 text-left font-medium text-muted-foreground"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, index) => (
                            <tr key={index} className="border-b last:border-b-0">
                              {columns.map((column) => (
                                <td key={column} className="max-w-[240px] px-3 py-2 align-top">
                                  <div className="whitespace-pre-wrap break-words">
                                    {renderCell(row[column])}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
                  {JSON.stringify(result.meta, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
