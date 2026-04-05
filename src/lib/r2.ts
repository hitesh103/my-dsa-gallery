import { S3Client } from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

let cached: S3Client | null = null;

export function getR2Client() {
  if (cached) return cached;

  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const endpoint =
    process.env.R2_ENDPOINT ??
    `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`;

  cached = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    // Avoid Node-only defaults/providers that try to touch the filesystem in workerd.
    defaultsMode: "standard",
    requestHandler: new FetchHttpHandler(),
    credentials: { accessKeyId, secretAccessKey },
  });

  return cached;
}

export function getR2Bucket() {
  return requiredEnv("R2_BUCKET");
}

export function toPublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  const trimmed = base.replace(/\/+$/, "");
  const encoded = key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${trimmed}/${encoded}`;
}
