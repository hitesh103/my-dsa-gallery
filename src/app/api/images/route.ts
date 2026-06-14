import { NextResponse } from "next/server";

import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import { listImages } from "@/lib/images";
import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { getR2Bucket, getR2Client, toPublicUrl } from "@/lib/r2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  // Serve individual image by key
  if (key) {
    try {
      const publicUrl = toPublicUrl(key);
      if (publicUrl) {
        return NextResponse.redirect(publicUrl);
      }

      const client = getR2Client();
      const Bucket = getR2Bucket();
      const command = new GetObjectCommand({ Bucket, Key: key });
      const { Body, ContentType } = await client.send(command);

      if (!Body) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      const bytes = await Body.transformToByteArray();
      return new NextResponse(bytes.buffer as ArrayBuffer, {
        headers: {
          "Content-Type": ContentType || "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

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

function canDeleteKey(key: string) {
  if (key.startsWith("gallery/")) return true;
  if (/^problems\/[a-z0-9-]+\//.test(key)) return true;
  if (/^notes\/[a-z0-9-]+\//.test(key)) return true;
  return false;
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    let key = searchParams.get("key") ?? "";
    if (!key) {
      try {
        const body = (await req.json()) as { key?: string };
        key = body.key ?? "";
      } catch {
        // no-op
      }
    }
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
    if (!canDeleteKey(key)) return NextResponse.json({ error: "Invalid key" }, { status: 400 });

    const client = getR2Client();
    const Bucket = getR2Bucket();
    await client.send(new DeleteObjectCommand({ Bucket, Key: key }));

    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
