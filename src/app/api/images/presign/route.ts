import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { getR2Bucket, getR2Client } from "@/lib/r2";

function safeFilename(name: string) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function safePrefix(prefix: string | undefined) {
  const p = (prefix ?? "gallery/").trim();
  if (p === "gallery/" || p === "gallery") return "gallery/";

  const normalized = p.endsWith("/") ? p : `${p}/`;
  // Allow per-problem uploads only: problems/<slug>/
  if (/^problems\/[a-z0-9-]+\/$/.test(normalized)) return normalized;

  throw new Error("Invalid prefix");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      filename?: string;
      contentType?: string;
      prefix?: string;
    };
    const filename = safeFilename(body.filename ?? "upload");
    const contentType = body.contentType ?? "application/octet-stream";
    const prefix = safePrefix(body.prefix);

    const Bucket = getR2Bucket();
    const client = getR2Client();

    const key = `${prefix}${Date.now()}-${filename}`;

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 60 * 5 },
    );

    return NextResponse.json({
      key,
      url,
      method: "PUT",
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
