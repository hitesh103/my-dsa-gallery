import { NextResponse } from "next/server";
import { requireAdmin, errorStatus } from "@/lib/adminAuth";
import { upsertContentItem, getContentItem, listContentItems } from "@/lib/contentStore";
import { ContentItemDocSchema } from "@/lib/contentDoc";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type");

    if (slug) {
      const item = await getContentItem(slug);
      return NextResponse.json(item);
    }

    const items = await listContentItems({ type: type || undefined, status: undefined });
    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const doc = ContentItemDocSchema.parse(body);
    
    await upsertContentItem(doc);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
