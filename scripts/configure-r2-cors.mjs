import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

function parseEnv(text) {
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".env.local",
);

let env;
try {
  env = parseEnv(readFileSync(envPath, "utf-8"));
} catch {
  env = {};
}

function envOrThrow(name) {
  const v = env[name] ?? process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local or environment`);
  return v;
}

const accessKeyId = envOrThrow("R2_ACCESS_KEY_ID");
const secretAccessKey = envOrThrow("R2_SECRET_ACCESS_KEY");
const accountId = env["R2_ACCOUNT_ID"] ?? process.env["R2_ACCOUNT_ID"];
const endpoint =
  env["R2_ENDPOINT"] ??
  (accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : envOrThrow("R2_ENDPOINT"));
const bucket = envOrThrow("R2_BUCKET");
const workerOrigin = env["WORKER_ORIGIN"] ?? process.env["WORKER_ORIGIN"] ?? null;

const origins = ["http://localhost:3000"];
if (workerOrigin) origins.push(workerOrigin);

if (!workerOrigin) {
  console.warn("⚠ WORKER_ORIGIN not set — using http://localhost:3000 only.");
  console.warn("  Set WORKER_ORIGIN to add your production origin, e.g.:");
  console.warn("    WORKER_ORIGIN=https://my-dsa-gallery.kzoldyk.workers.dev");
  console.warn("  Re-run this script after adding it.");
}

const client = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
  requestHandler: new FetchHttpHandler(),
});

const corsConfig = {
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

console.log(`Configuring CORS on bucket "${bucket}" via ${endpoint}`);
console.log(`Allowed origins: ${origins.join(", ")}`);

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: corsConfig,
  }),
);

console.log("✅ CORS configured successfully!");
