import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function RevisionCard({ title = "Quick Revision", items }: { title?: string; items: string[] }) {
  return (
    <Card className="not-prose">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
