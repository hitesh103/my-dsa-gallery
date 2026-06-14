import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin, errorStatus } from "@/lib/adminAuth";
import { getR2Bucket, getR2Client } from "@/lib/r2";

function buildCorsConfig(origin: string) {
  const origins = ["http://localhost:3000"];
  try {
    const u = new URL(origin);
    origins.push(u.origin);
  } catch {
    // not a valid URL — skip
  }

  return {
    CORSRules: [
      {
        AllowedOrigins: origins,
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedHeaders: ["*"],
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3600,
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    if (!origin) {
      return NextResponse.json(
        { error: "Could not determine origin. Are you hitting this from the browser?" },
        { status: 400 },
      );
    }

    const client = getR2Client();
    const Bucket = getR2Bucket();
    const config = buildCorsConfig(origin);

    await client.send(
      new PutBucketCorsCommand({
        Bucket,
        CORSConfiguration: config,
      }),
    );

    return NextResponse.json({
      ok: true,
      origins: config.CORSRules[0].AllowedOrigins,
    });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    return NextResponse.json({
      message:
        "Send a POST request to this endpoint to configure CORS on the R2 bucket.",
      instructions:
        "curl -X POST https://my-dsa-gallery.kzoldyk.workers.dev/api/admin/configure-cors",
    });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
