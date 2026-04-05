import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2Bucket, getR2Client, toPublicUrl } from "@/lib/r2";

export type GalleryImage = {
  key: string;
  url: string;
  size?: number;
  lastModified?: string;
};

export async function listImages({
  prefix,
  limit = 200,
}: {
  prefix?: string;
  limit?: number;
}): Promise<GalleryImage[]> {
  const client = getR2Client();
  const Bucket = getR2Bucket();

  const out = await client.send(
    new ListObjectsV2Command({
      Bucket,
      Prefix: prefix,
      MaxKeys: limit,
    }),
  );

  const contents = out.Contents ?? [];

  const images = await Promise.all(
    contents
      .filter((o) => o.Key)
      .map(async (o) => {
        const key = o.Key as string;
        const publicUrl = toPublicUrl(key);
        const url =
          publicUrl ??
          (await getSignedUrl(client, new GetObjectCommand({ Bucket, Key: key }), {
            expiresIn: 60 * 10,
          }));

        return {
          key,
          url,
          size: o.Size,
          lastModified: o.LastModified?.toISOString(),
        } satisfies GalleryImage;
      }),
  );

  // Stable: newest first when possible.
  return images.sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));
}

