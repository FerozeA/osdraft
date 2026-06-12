# osdraft

NFC tag redirect service. Each physical NFC tag is programmed with a unique URL
(`https://osdraft.com/tag/[unique-id]`). The first person to tap an unclaimed tag
fills in a short form choosing where the tag should point; every tap after that
instantly redirects to the saved destination.

## Routes

| Route | Purpose |
| --- | --- |
| `/tag/[id]` | Redirects if claimed; shows the claim form if not |
| `/tag/[id]/update` | Lets the owner change the destination after verifying name + email/phone |
| `/admin/create-tag` | Register a new tag ID as unclaimed (no auth — see note below) |

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
visit http://localhost:3000/tag/test1 to walk through the claim flow.

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

## 5. Point osdraft.com at Vercel

1. In your Vercel project, go to **Settings → Domains** and add `osdraft.com`
   (and `www.osdraft.com` if you want it).
2. Vercel will show you the DNS records to add at your domain registrar:
   - **Apex domain (`osdraft.com`)**: an `A` record pointing to `76.76.21.21`
     (use the exact IP Vercel shows you — it can change).
   - **`www` subdomain**: a `CNAME` record pointing to `cname.vercel-dns.com`.
   - Alternatively, switch the domain's nameservers to Vercel's
     (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) and Vercel manages DNS for you.
3. Wait for DNS to propagate (usually minutes, up to 48h). Vercel provisions
   the SSL certificate automatically.

## Workflow for new NFC tags

1. Visit `https://osdraft.com/admin/create-tag` and enter a unique ID
   (letters, numbers, hyphens, underscores).
2. Program the physical NFC tag with `https://osdraft.com/tag/<that-id>`.
3. Ship it. The first tap shows the setup form; after that, taps redirect.

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
