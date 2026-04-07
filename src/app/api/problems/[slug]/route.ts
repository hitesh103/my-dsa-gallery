import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import type { ProblemDoc } from "@/lib/problemDoc";
import { deleteProblem, getProblem, upsertProblem } from "@/lib/problemStore";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const problem = await getProblem(slug);
    if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ problem });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    await requireAdmin(req);

    const body = (await req.json()) as Partial<ProblemDoc>;
    if (!body.slug || body.slug !== slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (!body.title || !body.topic || !body.pattern || !body.link || !body.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await upsertProblem(body as ProblemDoc);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    await requireAdmin(req);
    await deleteProblem(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
