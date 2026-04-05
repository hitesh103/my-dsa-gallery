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
    credentials: { accessKeyId, secretAccessKey },
    /**
     * OpenNext bundles the server with esbuild `platform: "node"` for workerd.
     * The AWS SDK node runtime defaults try to read shared config files using `fs.readFile`,
     * which is not implemented in Cloudflare Workers.
     *
     * To avoid that, we pass explicit values for the knobs that would otherwise be
     * loaded via `@smithy/node-config-provider` (filesystem).
     */
    defaultsMode: "standard",
    requestHandler: new FetchHttpHandler(),
    authSchemePreference: async () => [],
    disableS3ExpressSessionAuth: async () => false,
    maxAttempts: 3,
    requestChecksumCalculation: async () => "WHEN_REQUIRED",
    responseChecksumValidation: async () => "WHEN_REQUIRED",
    retryMode: async () => "standard",
    sigv4aSigningRegionSet: async () => undefined,
    useArnRegion: async () => false,
    useDualstackEndpoint: async () => false,
    useFipsEndpoint: async () => false,
    userAgentAppId: async () => undefined,
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
