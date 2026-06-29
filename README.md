# osdraft

NFC tag redirect service. Each physical NFC tag is programmed with a unique URL
(`https://feroze.work/tag/[unique-id]`). The first person to tap an unclaimed tag
fills in a short setup form; every tap after that instantly redirects to the
saved destination.

## Routes

| Route | Purpose |
| --- | --- |
| `/tag/[id]` | Redirects if claimed; shows the setup form if not |
| `/tag/[id]/update` | Lets the owner change the destination after verifying name + email/phone |
| `/admin/create-tag` | Register a new tag ID as unclaimed (no auth — see note below) |
| `/osdocs` | Open-source documentation table of contents |
| `/osdocs/[product]` | A specific product's documentation page |
| `/api/keepalive` | Lightweight DB ping to stop Supabase free tier from pausing |

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) on Vercel
- [Supabase](https://supabase.com/) (Postgres) for storage

---

## 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `tags` table and the row-level-security policies the app needs.
3. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon / public key**

## 2. Set environment variables (local)

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000/admin/create-tag, create a tag (e.g. `test1`), then
visit http://localhost:3000/tag/test1 to walk through the setup flow.

## 4. Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com/new), click **Add New → Project** and import
   the repo. Vercel auto-detects Next.js — no build settings needed.
3. Before deploying, add the two environment variables under
   **Settings → Environment Variables** (apply to Production, Preview, and
   Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## 5. Domain (feroze.work)

The app is domain-agnostic — it shows whatever domain it's served from. If
`feroze.work` is already connected to this Vercel project, you're done; tags
live at `https://feroze.work/tag/[id]`.

To connect the domain (if not already):

1. In your Vercel project, go to **Settings → Domains** and add `feroze.work`.
2. Add the DNS records Vercel shows you at your registrar:
   - **Apex (`feroze.work`)**: an `A` record to the IP Vercel displays.
   - **`www`** (optional): a `CNAME` to `cname.vercel-dns.com`.
3. Vercel provisions SSL automatically once DNS resolves.

## 6. Keep Supabase from pausing (free tier)

Supabase pauses free-tier projects after **7 days of inactivity**, which would
break all redirects until you manually restore it. To prevent that, the
`/api/keepalive` route runs a tiny query to register activity. A Vercel Cron
(see [`vercel.json`](vercel.json)) hits it once a day automatically.

- **Vercel Cron** runs only on production deployments. After deploying, confirm
  it under **Settings → Cron Jobs**.
- *(Optional)* set a `CRON_SECRET` env var in Vercel to lock the endpoint;
  Vercel sends it automatically on scheduled runs.
- **Alternative:** a free external monitor (UptimeRobot, cron-job.org) pinging
  `https://feroze.work/api/keepalive` every few days does the same job.

Note: physically programming an NFC tag does **not** count as activity — only
database reads/writes (tag taps, creating tags, the keep-alive ping) do.

## Open-source documentation pages

- `/osdocs` is a text table of contents listing every product's docs.
- Each product has its own page at `/osdocs/[product]`, e.g.
  `app/osdocs/dogtagv1/page.tsx` → `/osdocs/dogtagv1`.
- To add a product page, create `app/osdocs/<slug>/page.tsx` and add a line to
  the `docs` array in [`app/osdocs/page.tsx`](app/osdocs/page.tsx).

## Order of operations for shipping a tag

1. Visit `https://feroze.work/admin/create-tag` and enter a unique ID
   (letters, numbers, hyphens, underscores).
2. Program the physical NFC tag with `https://feroze.work/tag/<that-id>`.
3. Ship it. On first tap the customer fills in the setup form and submits; they
   see a success message, a short countdown, then the product's open-source
   documentation. Every later tap redirects to their saved destination.

## Security notes (current limitations)

- `/admin/create-tag` has **no authentication** — anyone who knows the URL can
  register tag IDs. Add auth (or at least a shared secret) before relying on it.
- Update verification is name + email/phone match, which is identification,
  not real authentication. Fine for low-stakes use; consider magic links later.
- The anon key has insert/update access to the `tags` table via RLS policies,
  so the same operations the API performs could be performed directly against
  Supabase by anyone with the anon key (it ships to the browser). For stricter
  control, move writes behind the `service_role` key (server-only env var) and
  drop the anon insert/update policies.
