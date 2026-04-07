import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { addComment, listComments } from "@/lib/commentsStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  const limit = Number(searchParams.get("limit") ?? "50") || 50;

  try {
    const comments = await listComments(slug, limit);
    return NextResponse.json({ comments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = (await req.json()) as { slug?: string; body?: string };
    const slug = body.slug ?? "";
    const text = body.body ?? "";
    await addComment(slug, text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
