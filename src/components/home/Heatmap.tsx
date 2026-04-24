"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

// --- Types ---
type HeatmapData = { date: string; count: number };
type HeatmapProps = { years?: number };
type RangeOption = { label: string; value: string; start: Date; end: Date };
type CalendarCell = { date: Date | null; dateKey: string | null; count: number; isInRange: boolean };

// --- Constants ---
const CELL_SIZE = 15; 
const CELL_GAP = 4;
const MONTH_GAP = 16; // The "LeetCode" gap

// --- Utilities ---
const toDateKey = (date: Date) => date.toISOString().split("T")[0];
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
const startOfWeek = (date: Date) => addDays(date, -date.getUTCDay());
const endOfWeek = (date: Date) => addDays(date, 6 - date.getUTCDay());

function getRangeOptions(limit: number): RangeOption[] {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  const options: RangeOption[] = [
    { label: "Current", value: "current", start: addDays(today, -364), end: today }
  ];

  for (let i = 0; i < limit; i++) {
    const year = today.getUTCFullYear() - i;
    // Check if we already added "Current" which might cover this year
    options.push({
      label: `${year}`,
      value: `${year}`,
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year, 11, 31)),
    });
  }
  // Remove duplicates if "Current" and the first year overlap
  return Array.from(new Map(options.map(o => [o.label, o])).values());
}

function getCellTone(count: number) {
  if (count <= 0) return "var(--heatmap-level-0)";
  if (count === 1) return "var(--heatmap-level-1)";
  if (count === 2) return "var(--heatmap-level-2)";
  if (count === 3) return "var(--heatmap-level-3)";
  if (count === 4) return "var(--heatmap-level-4)";
  return "var(--heatmap-level-5)";
}

export function Heatmap({ years = 3 }: HeatmapProps) {
  const rangeOptions = useMemo(() => getRangeOptions(years), [years]);
  const [selectedRange, setSelectedRange] = useState(rangeOptions[0].value);
  const [data, setData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeRange = useMemo(
    () => rangeOptions.find((o) => o.value === selectedRange) ?? rangeOptions[0],
    [rangeOptions, selectedRange]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ 
        start: toDateKey(activeRange.start), 
        end: toDateKey(activeRange.end) 
      });
      const res = await fetch(`/api/heatmap?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error("Heatmap fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeRange]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d.count])), [data]);

  // Group weeks by month for the LeetCode cluster effect
  const monthGroups = useMemo(() => {
    const groups: { month: string; weeks: CalendarCell[][] }[] = [];
    let cursor = startOfWeek(activeRange.start);
    const end = endOfWeek(activeRange.end);

    while (cursor <= end) {
      const week: CalendarCell[] = [];
      // Use Wednesday to decide which month this week belongs to
      const midWeek = addDays(cursor, 3);
      const monthName = midWeek.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

      for (let i = 0; i < 7; i++) {
        const inRange = cursor >= activeRange.start && cursor <= activeRange.end;
        const key = toDateKey(cursor);
        week.push({
          date: inRange ? new Date(cursor) : null,
          dateKey: inRange ? key : null,
          count: inRange ? dataMap.get(key) ?? 0 : 0,
          isInRange: inRange,
        });
        cursor = addDays(cursor, 1);
      }

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.month === monthName) {
        lastGroup.weeks.push(week);
      } else {
        groups.push({ month: monthName, weeks: [week] });
      }
    }
    return groups;
  }, [activeRange, dataMap]);

  const totalSubmissions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="overflow-hidden rounded-[28px] border bg-card text-foreground">
      <CardContent className="space-y-6 p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {totalSubmissions} <span className="text-lg font-medium text-muted-foreground sm:text-xl">
              submissions in {activeRange.value === "current" ? "the past year" : activeRange.label}
            </span>
          </div>

          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="h-10 w-full rounded-xl border bg-muted/50 px-3 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-ring sm:w-[120px]"
          >
            {rangeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Heatmap Grid */}
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-start gap-x-[16px] min-w-max">
              {monthGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-2">
                  {/* Grid of Squares */}
                  <div className="flex" style={{ gap: CELL_GAP }}>
                    {group.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col" style={{ gap: CELL_GAP }}>
                        {week.map((cell, dIdx) => (
                          <div
                            key={dIdx}
                            className={cn(
                              "rounded-[3px] border border-[var(--heatmap-cell-border)] transition-all duration-300",
                              cell.isInRange ? "opacity-100" : "opacity-0 pointer-events-none"
                            )}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              backgroundColor: cell.isInRange ? getCellTone(cell.count) : "transparent",
                            }}
                            title={cell.dateKey ? `${cell.count} submissions on ${cell.dateKey}` : undefined}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Month Label */}
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {group.month}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className="rounded-[2px] border border-[var(--heatmap-cell-border)]"
                  style={{ width: 12, height: 12, backgroundColor: getCellTone(lvl) }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}