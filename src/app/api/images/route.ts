import { NextResponse } from "next/server";

import { listImages } from "@/lib/images";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "200") || 200;

  try {
    const images = await listImages({ prefix, limit });
    return NextResponse.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

