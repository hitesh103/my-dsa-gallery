"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type HeatmapData = {
  date: string;
  count: number;
};

const LEVELS = [
  { threshold: 0, label: "No problems", className: "bg-muted" },
  { threshold: 1, label: "1-2 problems", className: "bg-green-200 dark:bg-green-900" },
  { threshold: 3, label: "3-4 problems", className: "bg-green-300 dark:bg-green-700" },
  { threshold: 5, label: "5+ problems", className: "bg-green-400 dark:bg-green-500" },
];

function getLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
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
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const activeDays = data.filter((d) => d.count > 0).length;

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
          <div className="relative overflow-x-auto pb-2">
            <div className="inline-block min-w-max">
              <div className="flex gap-4 mb-1 ml-8">
                {monthLabels.map(({ label, offset }) => (
                  <span
                    key={`${label}-${offset}`}
                    className="text-[10px] text-muted-foreground"
                    style={{ marginLeft: offset === 0 ? 0 : undefined }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex gap-[3px]">
                <div className="flex flex-col gap-[3px] mr-1">
                  {DAYS.map((day, i) => (
                    <span
                      key={day}
                      className="text-[10px] text-muted-foreground leading-[13px]"
                      style={{ height: "13px", display: day === "Sun" || day === "Tue" || day === "Thu" || day === "Sat" ? "block" : "none" }}
                    >
                      {i % 2 === 1 ? day[0] : ""}
                    </span>
                  ))}
                </div>

                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => {
                      if (!day) {
                        return <div key={di} className="w-[13px] h-[13px]" />;
                      }
                      const dateStr = day.toISOString().split("T")[0];
                      const count = dataMap.get(dateStr) ?? 0;
                      const level = getLevel(count);

                      return (
                        <div
                          key={di}
                          className={cn(
                            "w-[13px] h-[13px] rounded-sm cursor-pointer transition-opacity hover:opacity-80",
                            LEVELS[level].className
                          )}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ date: dateStr, count, x: rect.left + rect.width / 2, y: rect.top });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>Less</span>
                {LEVELS.map((lvl, i) => (
                  <div
                    key={i}
                    className={cn("w-[13px] h-[13px] rounded-sm", lvl.className)}
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
          className="fixed z-50 px-2 py-1 text-xs bg-foreground text-background rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="font-medium">{tooltip.count}</span> problem{tooltip.count !== 1 ? "s" : ""} on{" "}
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