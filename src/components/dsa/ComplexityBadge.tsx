import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function ComplexityBadge({
  time,
  space,
  className,
}: {
  time: string;
  space: string;
  className?: string;
}) {
  return (
    <div className={cn("not-prose flex flex-wrap gap-2", className)}>
      <Badge className="bg-muted text-foreground dark:bg-muted">Time: {time}</Badge>
      <Badge className="bg-muted text-foreground dark:bg-muted">Space: {space}</Badge>
    </div>
  );
}

