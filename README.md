# Camí

A directory of university admission and scholarship routes for Palestinian
students in Europe, kept current by Global Shapers hubs worldwide.

Built with Next.js (App Router) and Supabase (Postgres + Auth), deployed on
Vercel.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_admin_helpers.sql`. The first creates all four
   tables (`programmes`, `internal_assessments`, `submissions`, `profiles`)
   and their Row Level Security policies. The second is required: it fixes
   the admin policies (without it every admin query fails with "infinite
   recursion detected in policy"), keeps `updated_at` current, and adds the
   `approve_submission` function that publishes a submission in a single
   transaction.
3. Run `supabase/seed/0001_programmes.sql` to load the five known
   programmes as published entries, with their internal triage scores.
4. Go to **Authentication > Providers** and confirm Email is enabled
   (it is by default). This app uses magic-link sign-in for admins, no
   password needed.
5. Go to **Authentication > URL Configuration** and add your eventual
   production URL (e.g. `https://cami.vercel.app/**`) plus
   `http://localhost:3000/**` for local development, under Redirect URLs.
   Sign-in links return to `/auth/callback`, so the `/**` wildcard (or that
   exact path) must be allowed.
6. Go to **Project Settings > API** and copy the **Project URL** and the
   **anon public** key, you'll need both in the next step.

### Make your team admins

Nobody can access `/admin` until they have a row in `profiles` with
`role = 'admin'`. After someone signs in once through `/admin/login` (which
creates their `auth.users` row), run in the SQL editor:

```sql
insert into profiles (id, role, full_name)
values ('paste-their-auth-user-id-here', 'admin', 'Their Name')
on conflict (id) do update set role = 'admin';
```

Find their user id under **Authentication > Users** in the Supabase
dashboard.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Visit `http://localhost:3000`.

## 3. Deploy to Vercel

1. Push this repository to GitHub (repo name suggestion: `cami`).
2. In [vercel.com](https://vercel.com), click **New Project** and import
   the repository. Vercel detects Next.js automatically, no config needed.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (same values as your `.env.local`)
4. Click **Deploy**. Vercel gives you a `*.vercel.app` URL immediately.
5. Go back to Supabase's **Authentication > URL Configuration** and add
   that real Vercel URL to the Redirect URLs list, magic links won't work
   from a domain Supabase doesn't recognize.
6. Once you have a custom domain, add it in Vercel's project settings and
   repeat step 5 with the final domain.

## 4. What's in this repo

- `/`: public directory, filterable by country, degree level and status.
- `/submit`: public submission form, no login required.
- `/admin/login`: magic-link sign-in for the review team.
- `/auth/callback`: completes magic-link sign-in and sends admins on to
  `/admin`.
- `/admin`: pending submissions as editable, pre-filled forms, with
  Approve (publishes to the live directory in one transaction) and Reject
  actions. `/admin?tab=history` lists approved and rejected submissions.
- `/admin/programmes`: add, edit, publish/unpublish and delete programmes,
  mark them as checked today, and edit their internal-only triage scores
  (funding, fit, success probability).
- `supabase/migrations/`: full schema, RLS policies and admin helpers.
- `supabase/seed/0001_programmes.sql`: the five known programmes.
- `docs/`: the project handoff document and the original seed CSV.

Run `npm run lint` and `npm run build` before pushing; both should pass
cleanly.

## 5. Design tokens

Colors, fonts and component conventions are already wired into
`tailwind.config.ts` and `app/globals.css`. See the project's handoff
document for the full visual identity spec and content tone guidelines,
particularly before writing any new marketing copy for this site.

## 6. Not included yet (see handoff doc for details)

- Map view (pins per programme), planned as a v1.1 addition.
- Anti-spam tooling on `/submit`, intentionally left out, trust-based by
  decision.
- Multi-language UI.
