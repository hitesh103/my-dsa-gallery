Minimalist DSA write-ups (MDX) + study image gallery (Cloudflare R2).

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Routes

- `/` home
- `/problems` grouped problem index
- `/problems/[slug]` MDX problem page
- `/gallery` masonry grid + presigned uploads
- `/admin` seed D1 + edit problems
- `/admin/problems/[slug]` editor UI

## R2 (S3-compatible) env vars

Copy `.env.example` → `.env.local` and fill in:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL` (optional)

## D1 (optional, for in-app editing + search)

- Create a D1 database in Cloudflare.
- Apply migrations from `migrations/` to that database.
- Bind the database to your deployment as `DB` (Cloudflare “D1 database bindings”).
- Set `ADMIN_TOKEN` as a secret in Cloudflare env.

Then open `/admin`, save the token in your browser, and click “Seed initial problems”.

## Cloudflare (OpenNext)

Build and preview a production worker locally:

```bash
npm run cf:build
npm run cf:dev
```

`wrangler.toml` is configured with:

- `compatibility_date = "2025-01-01"`
- `compatibility_flags = ["nodejs_compat"]`
