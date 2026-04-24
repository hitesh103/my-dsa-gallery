"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type HeatmapData = {
  date: string;
  count: number;
};

type HeatmapProps = {
  years?: number;
};

type TooltipState = {
  date: string;
  count: number;
  x: number;
  y: number;
};

type WeekColumn = {
  days: Array<Date | null>;
  label: string | null;
  startColumn: number;
  gapCountBefore: number;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL_SIZE = "clamp(9px, 1.7vw, 12px)";
const CELL_GAP = "clamp(2px, 0.35vw, 3px)";
const MONTH_GAP = "clamp(8px, 1.1vw, 12px)";
const DAY_LABEL_WIDTH = 28;
const LEGEND_LEVELS = [
  { label: "0", color: "var(--heatmap-level-0)" },
  { label: "1", color: "var(--heatmap-level-1)" },
  { label: "2", color: "var(--heatmap-level-2)" },
  { label: "3", color: "var(--heatmap-level-3)" },
  { label: "4", color: "var(--heatmap-level-4)" },
  { label: "5+", color: "var(--heatmap-level-5)" },
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCellColor(count: number) {
  if (count <= 0) return "var(--heatmap-level-0)";
  if (count === 1) return "var(--heatmap-level-1)";
  if (count === 2) return "var(--heatmap-level-2)";
  if (count === 3) return "var(--heatmap-level-3)";
  if (count === 4) return "var(--heatmap-level-4)";
  return "var(--heatmap-level-5)";
}

function getAvailableYears(limit: number) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: limit }, (_, index) => currentYear - index);
}

function getWeeksForYear(year: number): WeekColumn[] {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const gridStart = new Date(yearStart);
  const gridEnd = new Date(yearEnd);

  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const columns: WeekColumn[] = [];
  let current = new Date(gridStart);
  let gapCountBefore = 0;

  while (current <= gridEnd) {
    const weekDays: Array<Date | null> = [];
    let label: string | null = null;

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const day = new Date(current);
      const isInYear = day >= yearStart && day <= yearEnd;

      if (isInYear && day.getDate() === 1) {
        label = MONTHS[day.getMonth()];
        if (columns.length > 0) {
          gapCountBefore += 1;
        }
      }

      weekDays.push(isInYear ? day : null);
      current.setDate(current.getDate() + 1);
    }

    columns.push({
      days: weekDays,
      label,
      startColumn: columns.length + 1,
      gapCountBefore,
    });
  }

  return columns;
}

export function Heatmap({ years = 3 }: HeatmapProps) {
  const availableYears = useMemo(() => getAvailableYears(Math.max(1, Math.min(years, 5))), [years]);
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [data, setData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    setSelectedYear(availableYears[0]);
  }, [availableYears]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/heatmap?year=${selectedYear}`);
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      setData(json.data || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load heatmap data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const todayKey = formatDateKey(new Date());
  const dataMap = useMemo(() => new Map(data.map((entry) => [entry.date, entry.count])), [data]);
  const weekColumns = useMemo(() => getWeeksForYear(selectedYear), [selectedYear]);
  const totalProblems = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card>
      <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold">Contributions</span>
          {isLoading ? null : (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-normal text-muted-foreground">
              {totalProblems} total
            </span>
          )}
        </CardTitle>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Year</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
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
          <div className="w-full overflow-x-auto pb-2 [scrollbar-width:thin]">
            <div
              className="min-w-max"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: CELL_GAP,
              }}
            >
              <div
                style={{
                  height: 18,
                  paddingLeft: DAY_LABEL_WIDTH + 6,
                  position: "relative",
                }}
              >
                {weekColumns.map(({ label, startColumn, gapCountBefore }, index) => {
                  if (!label) return null;

                  return (
                    <span
                      key={`${label}-${index}`}
                      style={{
                        position: "absolute",
                        left: `calc((${startColumn - 1} * (${CELL_SIZE} + ${CELL_GAP})) + ${gapCountBefore} * ${MONTH_GAP})`,
                        fontSize: 10,
                        lineHeight: "18px",
                        color: "hsl(var(--muted-foreground))",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: `repeat(7, ${CELL_SIZE})`,
                    rowGap: CELL_GAP,
                    width: DAY_LABEL_WIDTH,
                  }}
                >
                  {DAY_LABELS.map((label, index) => (
                    <div
                      key={index}
                      style={{
                        height: CELL_SIZE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        fontSize: 9,
                        lineHeight: CELL_SIZE,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridAutoColumns: CELL_SIZE,
                    gridTemplateRows: `repeat(7, ${CELL_SIZE})`,
                    columnGap: CELL_GAP,
                    rowGap: CELL_GAP,
                  }}
                >
                  {weekColumns.map((week, weekIndex) => (
                    <div
                      key={weekIndex}
                      style={{
                        display: "grid",
                        gridTemplateRows: `repeat(7, ${CELL_SIZE})`,
                        rowGap: CELL_GAP,
                        marginLeft: week.label && weekIndex > 0 ? MONTH_GAP : "0px",
                      }}
                    >
                      {week.days.map((day, dayIndex) => {
                        if (!day) {
                          return (
                            <div
                              key={dayIndex}
                              style={{
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                              }}
                            />
                          );
                        }

                        const dateKey = formatDateKey(day);
                        const count = dataMap.get(dateKey) ?? 0;
                        const isFutureDay = dateKey > todayKey;

                        return (
                          <div
                            key={dayIndex}
                            className={cn(
                              "rounded-[3px] border border-[var(--heatmap-cell-border)] transition-opacity",
                              isFutureDay ? "opacity-45" : "cursor-pointer hover:opacity-80"
                            )}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              backgroundColor: isFutureDay ? "var(--heatmap-future-cell)" : getCellColor(count),
                            }}
                            onMouseEnter={
                              isFutureDay
                                ? undefined
                                : (event) => {
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    setTooltip({
                                      date: dateKey,
                                      count,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top,
                                    });
                                  }
                            }
                            onMouseLeave={isFutureDay ? undefined : () => setTooltip(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-[10px] text-muted-foreground">
                <span>{selectedYear} contributions</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  {LEGEND_LEVELS.map((level) => (
                    <div
                      key={level.label}
                      className="rounded-[3px] border border-[var(--heatmap-cell-border)]"
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: level.color,
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
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
            left: tooltip.x,
            top: tooltip.y - 6,
            transform: "translate(-50%, -100%)",
            padding: "4px 8px",
            borderRadius: 6,
            background: "hsl(var(--foreground))",
            color: "hsl(var(--background))",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.22)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: 11,
          }}
        >
          <span style={{ fontWeight: 600 }}>{tooltip.count}</span> problem{tooltip.count !== 1 ? "s" : ""} on{" "}
          {new Date(`${tooltip.date}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}
    </Card>
  );
}
