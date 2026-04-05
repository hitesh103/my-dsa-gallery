Minimalist DSA write-ups (MDX) + study image gallery (Cloudflare R2).

## Getting Started

Run the development server :

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Routes

- `/` home
- `/problems` grouped problem index
- `/problems/[slug]` MDX problem page
- `/gallery` masonry grid + presigned uploads

## R2 (S3-compatible) env vars

Copy `.env.example` → `.env.local` and fill in:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL` (optional)

## Cloudflare (OpenNext)

Build and preview a production worker locally:

```bash
npm run cf:build
npm run cf:dev
```

`wrangler.toml` is configured with:

- `compatibility_date = "2025-01-01"`
- `compatibility_flags = ["nodejs_compat"]`
