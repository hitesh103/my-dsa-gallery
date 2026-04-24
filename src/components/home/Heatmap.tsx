"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type HeatmapData = {
  date: string;
  count: number;
};

const LEVELS = [
  { label: "0", className: "bg-[#161b22]" },
  { label: "1", className: "bg-[#1a472a]" },
  { label: "2", className: "bg-[#2d6a4f]" },
  { label: "3", className: "bg-[#40916c]" },
  { label: "4", className: "bg-[#7b2cbf]" },
  { label: "5", className: "bg-[#5a189a]" },
  { label: "6", className: "bg-[#b5451b]" },
  { label: "7", className: "bg-[#9b2226]" },
  { label: "8+", className: "bg-[#d4a017]" },
];

function getLevel(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count === 4) return 4;
  if (count === 5) return 5;
  if (count === 6) return 6;
  if (count === 7) return 7;
  return 8;
}

function getWeeks(years: number) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - years);

  start.setDate(start.getDate() - start.getDay());

  const weeks: Date[][] = [];
  let current = new Date(start);

  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      if (current <= end) {
        week.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL_SIZE = 11;
const CELL_GAP = 2;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function Heatmap({ years = 1 }: { years?: number }) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/heatmap?years=${years}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load heatmap data");
    }
  }, [years]);

  useEffect(() => {
    void fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const dataMap = new Map(data.map((d) => [d.date, d.count]));

  const weeks = getWeeks(years);
  const totalProblems = data.reduce((sum, d) => sum + d.count, 0);

  const monthLabels: { label: string; offset: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.find((d) => d);
    if (firstDay) {
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], offset: i });
        lastMonth = month;
      }
    }
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-semibold">Contributions</span>
          {isLoading ? null : (
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {totalProblems} total
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="overflow-x-auto">
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: CELL_GAP,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: CELL_GAP,
                  paddingLeft: 28,
                  height: 16,
                  position: "relative",
                }}
              >
                {monthLabels.map(({ label, offset }, idx) => {
                  const nextLabel = monthLabels[idx + 1];
                  const maxWidth = nextLabel
                    ? (nextLabel.offset - offset) * (CELL_SIZE + CELL_GAP)
                    : undefined;

                  return (
                    <span
                      key={`${label}-${offset}`}
                      style={{
                        position: "absolute",
                        left: offset * (CELL_SIZE + CELL_GAP),
                        fontSize: 10,
                        color: "hsl(var(--muted-foreground))",
                        lineHeight: "16px",
                        maxWidth: maxWidth ? maxWidth - 4 : undefined,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: CELL_GAP }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: CELL_GAP,
                    marginRight: 4,
                    width: 24,
                  }}
                >
                  {DAY_LABELS.map((label, i) => (
                    <div
                      key={i}
                      style={{
                        height: CELL_SIZE,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 9,
                        color: "hsl(var(--muted-foreground))",
                        lineHeight: `${CELL_SIZE}px`,
                        justifyContent: "flex-end",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: CELL_GAP,
                    }}
                  >
                    {week.map((day, di) => {
                      if (!day) {
                        return (
                          <div
                            key={di}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              borderRadius: 2,
                            }}
                          />
                        );
                      }
                      const dateStr = day.toISOString().split("T")[0];
                      const count = dataMap.get(dateStr) ?? 0;
                      const level = getLevel(count);

                      return (
                        <div
                          key={di}
                          className={cn(
                            "rounded cursor-pointer transition-opacity hover:opacity-80",
                            LEVELS[level].className
                          )}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              date: dateStr,
                              count,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                  marginTop: 4,
                  fontSize: 9,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <span>Less</span>
                {LEVELS.map((lvl, i) => (
                  <div
                    key={i}
                    className={cn("rounded", lvl.className)}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            zIndex: 50,
            padding: "4px 8px",
            fontSize: 11,
            background: "hsl(var(--foreground))",
            color: "hsl(var(--background))",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            left: tooltip.x,
            top: tooltip.y - 6,
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontWeight: 600 }}>{tooltip.count}</span> problem{tooltip.count !== 1 ? "s" : ""} on{" "}
          {new Date(tooltip.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}
    </Card>
  );
}