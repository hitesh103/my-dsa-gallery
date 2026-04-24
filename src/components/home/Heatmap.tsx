"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type HeatmapData = { date: string; count: number };
type HeatmapProps = { years?: number };
type RangeOption = { label: string; value: string; start: Date; end: Date };
type CalendarCell = { date: Date | null; dateKey: string | null; count: number };

const CELL_SIZE = 15; 
const CELL_GAP = 4;

const toDateKey = (date: Date) => date.toISOString().split("T")[0];
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

function getRangeOptions(limit: number): RangeOption[] {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const options: RangeOption[] = [{ label: "Current", value: "current", start: addDays(today, -364), end: today }];
  for (let i = 0; i < limit; i++) {
    const year = today.getUTCFullYear() - i;
    options.push({ label: `${year}`, value: `${year}`, start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year, 11, 31)) });
  }
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
  const scrollRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  const rangeOptions = useMemo(() => getRangeOptions(years), [years]);
  const [selectedRange, setSelectedRange] = useState(rangeOptions[0].value);
  const [data, setData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeRange = useMemo(() => rangeOptions.find((o) => o.value === selectedRange) ?? rangeOptions[0], [rangeOptions, selectedRange]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ start: toDateKey(activeRange.start), end: toDateKey(activeRange.end) });
      const res = await fetch(`/api/heatmap?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [activeRange]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // --- Auto-scroll Logic ---
  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      const container = scrollRef.current;
      container.scrollLeft = container.scrollWidth; // Push scroll to the end (current month)
    }
  }, [isLoading, data]);

  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d.count])), [data]);

  const monthGroups = useMemo(() => {
    const groups: { month: string; weeks: CalendarCell[][] }[] = [];
    let cursor = new Date(activeRange.start);
    const end = new Date(activeRange.end);

    while (cursor <= end) {
      const currentMonth = cursor.getUTCMonth();
      const monthName = cursor.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      const weeks: CalendarCell[][] = [];
      
      while (cursor <= end && cursor.getUTCMonth() === currentMonth) {
        const week: CalendarCell[] = Array(7).fill(null).map(() => ({ date: null, dateKey: null, count: 0 }));
        let startedWeek = false;
        for (let i = cursor.getUTCDay(); i < 7; i++) {
            if (cursor > end || cursor.getUTCMonth() !== currentMonth) break;
            const key = toDateKey(cursor);
            week[i] = { date: new Date(cursor), dateKey: key, count: dataMap.get(key) ?? 0 };
            cursor = addDays(cursor, 1);
            startedWeek = true;
        }
        if (startedWeek) weeks.push(week);
      }
      groups.push({ month: monthName, weeks });
    }
    return groups;
  }, [activeRange, dataMap]);

  return (
    <Card className="overflow-hidden rounded-[28px] border bg-card text-foreground">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {data.reduce((s, d) => s + d.count, 0)} <span className="text-lg font-medium text-muted-foreground">submissions</span>
          </div>
          <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="h-10 rounded-xl border bg-muted/50 px-3 text-sm font-medium outline-none no-select">
            {rangeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" /> : (
          <div 
            ref={scrollRef} 
            className="w-full overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            <div className="flex items-start gap-x-[16px] min-w-max">
              {monthGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-2">
                  <div className="flex" style={{ gap: CELL_GAP }}>
                    {group.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col" style={{ gap: CELL_GAP }}>
                        {week.map((cell, dIdx) => (
                          <div
                            key={dIdx}
                            className={cn(
                              "rounded-[3px] border border-[var(--heatmap-cell-border)]",
                              cell.date ? "opacity-100" : "opacity-0"
                            )}
                            style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: cell.date ? getCellTone(cell.count) : "transparent" }}
                            title={cell.date ? `${cell.count} Submission${cell.count === 1 ? "" : "s"} on ${cell.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}` : undefined}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground select-none">{group.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground no-select">
          <span>Less</span>
          {[0, 1, 2, 3, 4, 5].map((lvl) => (
            <div key={lvl} className="rounded-[2px] border border-[var(--heatmap-cell-border)]" style={{ width: 12, height: 12, backgroundColor: getCellTone(lvl) }} />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}