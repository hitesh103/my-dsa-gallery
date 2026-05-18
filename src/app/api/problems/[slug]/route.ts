import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import type { ProblemDoc } from "@/lib/problemDoc";
import { ProblemDocSchema } from "@/lib/problemSchema";
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

    const raw = await req.json();
    const result = ProblemDocSchema.safeParse(raw);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const body = result.data as ProblemDoc;
    if (body.slug !== slug) {
      return NextResponse.json({ error: "slug in body must match URL" }, { status: 400 });
    }

    await upsertProblem(body);
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
