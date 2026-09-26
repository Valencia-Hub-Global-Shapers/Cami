# Handoff: Camí

**Project name:** Camí (Catalan for "path" or "way"), kept as a single plain word, no tagline appended.
**Owner:** Global Shapers Valencia Hub
**Stack:** Next.js on Vercel, Supabase (Postgres + Auth)
**Approach:** Trust-based submissions, manual admin review, no CAPTCHA/anti-spam layer

**A working starter codebase is included** (`cami-app.zip`): the public directory, submission form, admin login, submission queue with approve/reject, and programme management with internal scoring, all wired to Supabase. Its own `README.md` has the exact deployment steps, summarized in Section 9 below. This document is the fuller reference for the reasoning behind each decision.

## 1. What this is

A public, always-current directory of European university programmes, scholarships and admission pathways for Palestinian students, maintained by Global Shapers hubs worldwide. Two audiences:

- **Students** browse a public page: filterable, read-only, no login.
- **Shapers from any hub** submit new opportunities through a public form, no login required.
- **Valencia Hub's admin team** reviews submissions and publishes them, plus manages an internal-only triage score per opportunity.

## 2. Database schema (Supabase / Postgres)

Run as one migration.

```sql
create extension if not exists "pgcrypto";

-- Published, public-facing opportunities
create table programmes (
    id uuid primary key default gen_random_uuid(),
    university text not null,
    country text not null,
    city text,
    programme_name text not null,
    programme_type text,
    target_group text,
    degree_level text[],
    coverage text,
    estimated_opening text,
    estimated_deadline text,
    academic_year text,
    language text,
    main_eligibility text,
    required_documents text,
    status text not null default 'monitor'
        check (status in ('open', 'expected', 'renewal_only', 'closed', 'monitor')),
    website text,
    contact text,
    notes text,
    is_published boolean not null default false,
    last_verified_at date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Internal-only triage, never shown publicly
create table internal_assessments (
    programme_id uuid primary key references programmes(id) on delete cascade,
    funding_score int check (funding_score between 1 and 5),
    fit_score int check (fit_score between 1 and 5),
    success_probability int check (success_probability between 1 and 5),
    recommended_action text,
    internal_notes text
);

-- Incoming submissions from any Shaper, awaiting review
create table submissions (
    id uuid primary key default gen_random_uuid(),
    university text not null,
    country text not null,
    city text,
    programme_name text not null,
    programme_type text,
    target_group text,
    degree_level text[],
    coverage text,
    estimated_opening text,
    estimated_deadline text,
    academic_year text,
    language text,
    main_eligibility text,
    required_documents text,
    website text,
    contact text,
    notes text,
    submitter_name text not null,
    submitter_hub text not null,
    submitter_email text not null,
    review_status text not null default 'pending'
        check (review_status in ('pending', 'approved', 'rejected')),
    reviewer_notes text,
    created_at timestamptz default now()
);

-- Admin team members
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'member' check (role in ('member', 'admin')),
    hub text,
    full_name text
);
```

### Row Level Security

```sql
alter table programmes enable row level security;
alter table internal_assessments enable row level security;
alter table submissions enable row level security;
alter table profiles enable row level security;

-- Public reads only published programmes
create policy "public reads published programmes"
on programmes for select
using (is_published = true);

-- Admins do everything on programmes
create policy "admins manage programmes"
on programmes for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Internal assessments: admin-only, full stop
create policy "admins manage internal_assessments"
on internal_assessments for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Anyone can submit, nobody but admins can read or edit submissions
create policy "anyone can insert a submission"
on submissions for insert
with check (true);

create policy "admins manage submissions"
on submissions for all
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Profiles: a user reads their own row, admins read all
create policy "user reads own profile"
on profiles for select
using (auth.uid() = id);

create policy "admins read all profiles"
on profiles for select
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

Note the deliberate absence of an `update`/`delete` policy for `submissions` insert: anonymous visitors can only ever create rows, never read or modify them, so one Shaper can't see or tamper with another's pending submission.

## 3. Pages and routes

### `/`: Public directory
- Server-rendered (or ISR, revalidate every few minutes), reads `programmes` with the anon key.
- Filters: country, degree level, status. Search by university/programme name.
- Card or table layout per entry: university, country/city, programme name, degree level, coverage, deadline, status badge, "View details" link to source website.
- **Never render** funding score, fit score, success probability, or recommended action, those live only in `internal_assessments`, which the public role can't read anyway, but keep this explicit for whoever builds the query.
- Show `last_verified_at` on each card ("Last checked: [date]") so students can gauge freshness.

### `/submit`: Public submission form
- No login required.
- 20 fields total, everything in `submissions` except the review/system columns.
- **Required:** `university`, `country`, `programme_name`, `submitter_name`, `submitter_hub`, `submitter_email`, plus at least one of `website` or `contact` (enforced client-side, not as a DB constraint, since an either/or rule is awkward in SQL).
- **Optional:** `city`, `programme_type`, `target_group`, `degree_level`, `coverage`, `estimated_opening`, `estimated_deadline`, `academic_year`, `language`, `main_eligibility`, `required_documents`, `notes`. A busy Shaper submitting from a phone shouldn't have to stop because they don't know the exact deadline, your admin team can fill gaps during review, or follow up using the submitter's email.
- On success: plain confirmation message, no auto-publish, no account creation.
- No CAPTCHA, no honeypot, no email verification. Trust-based by explicit decision of the hub, revisit only if abuse actually becomes a problem.

### `/admin/login`: Magic link auth via Supabase Auth

### `/admin`: Submission queue (protected)
- Middleware checks the session's `profiles.role` server-side before rendering, RLS is the real gate but the route guard avoids flashing content to non-admins.
- List of `submissions` where `review_status = 'pending'`, newest first, full details per row.
- Each row expands into an editable form (pre-filled, since submissions will have typos or need light cleanup) with **Approve** and **Reject** actions.
- **Approve** runs as a single server-side transaction: insert the (possibly edited) data into `programmes`, set that submission's `review_status = 'approved'`. Never do these as two separate calls, a submission marked approved that never made it into `programmes` is a real failure mode to avoid.
- **Reject** sets `review_status = 'rejected'` with an optional `reviewer_notes` explaining why, useful if you ever want to follow up with the submitting hub.
- Secondary tab: approved/rejected history, for auditing ("who submitted the UAB entry originally").

### `/admin/programmes`: Live directory management (protected, admin only)
- Full CRUD on `programmes`, plus the `internal_assessments` fields (funding/fit/success-probability/recommended action) per entry.
- Toggle `is_published` per entry, this is what actually makes something visible on `/`.

## 4. Seed data

The attached CSV (`palestinian_scholarships_database.csv`) has the five known entries. Load these as already-approved, published `programmes` rows (they didn't come through the submission flow, so there's nothing to reconcile there).

## 5. Visual identity

A working design mockup exists here: [Camí, Landing Page](https://claude.ai/artifact/HxR5k7HcbNg82QF1atvszd). Treat it as the reference for layout, spacing and component style, not literal code to copy in.

### Palette

| Token | Hex | Use |
|---|---|---|
| Cream | `#FBF6EE` | Page background |
| Ink | `#211E19` | Body text, dark section background |
| Terracotta (primary) | `#C1652F` | Primary buttons, links, key accents |
| Terracotta hover | `#A34F22` | Primary button hover state |
| Route teal (secondary) | `#2F6F65` | Secondary accent, "open" status |
| Warm sand | `#F1E9D8` | Alternating section background, cards |
| Border | `#E6DDCC` | Card and section borders |
| Muted text | `#4A4438` | Body copy on light backgrounds |
| Faint text | `#8A8271` | Captions, footer, timestamps |

### Typography

- **Display / headings:** Fraunces (serif, Google Fonts). Warm and editorial, not corporate.
- **Body / UI:** IBM Plex Sans (Google Fonts). Avoid Inter, Roboto, or Arial, they read as generic AI-tool defaults.

### Logo

Wordmark "Camí" set in Fraunces, paired with a small inline icon: two dots connected by a short dashed line, representing a route rather than a literal map. Keep the icon abstract, it should never depict a specific place, border, or journey (see tone notes below).

### Component conventions

- Buttons: full pill shape (`border-radius: 999px`), solid terracotta for the primary action, ink outline for secondary.
- Status badges: pill-shaped, color-coded (teal for open, muted tones for expected/renewal-only/closed), the one place on the page where color carries meaning beyond decoration.
- Cards: soft rounded corners (12–16px), thin border, no drop shadows, no left-border accent bars.

### Content and tone: read this before writing any copy

This site is a practical tool for people navigating displacement, not a mission-driven product launch. An earlier draft used language like "a path to Europe, mapped together" and an illustration tracing a route from "Gaza" through "Amman" to "Europe," and it read as exactly wrong: turning a war and a displacement into a warm, hopeful travel narrative. Avoid that failure mode specifically:

- **No journey metaphors applied to real displacement.** Don't illustrate or narrate students' movement from Gaza as a "path," "journey," or anything visually resembling a travel-brand graphic. The word "Camí" as a name is fine; depicting the literal route is not.
- **Plain, functional copy over inspirational copy.** Say what the tool does ("A directory of admission and scholarship programmes...") rather than what it hopes to mean ("mapped together," "living directory," "infrastructure the network can keep alive"). If a sentence would work equally well on a travel startup's landing page, rewrite it.
- **Show real content instead of illustrating a concept.** Where the instinct is to add a decorative graphic, prefer showing an actual sample listing (real university, real programme, real terms) instead. It's both more honest and more useful.
- **CTA hierarchy: browsing the directory is the primary action everywhere**, including the header. Submitting a programme is real and important, but secondary, a plain text link or outline button, never the single colored button competing for attention at the top of the page.
- **Credit stays light**, matching how two existing hub microsites already handle it: AIwareness (aiwareness.vercel.app) uses a small text link in the header reading "Made from Valencia Hub," and Size of Pain (size-of-pain.vercel.app) uses one plain sentence in the footer, "Developed by the Valencia Hub, Global Shapers Community," at the same visual weight as its other data attributions. No logo lockup, no dedicated credit section, nothing competing visually with the directory content itself.

## 6. Map view (v1.1, not required for launch)

Each published `programmes` row should eventually render as a pin at its university's location. Practical notes for whoever builds it:

- Add `latitude`/`longitude` columns to `programmes` (nullable, filled in on approval by whoever geocodes the university address, a one-time lookup per university, not per submission).
- Use Leaflet or Mapbox GL, plot only published, geocoded rows.
- Keep the map factual: pins show university, programme name, status and a link, nothing narrative layered on top (see tone notes above, the same caution applies to any map graphic, not just the landing page mockup).
- This can ship after the core directory and submission flow are live, it's additive, not a blocker.

## 9. Deployment steps (summary)

Full detail lives in the codebase's own `README.md`. In short:

1. **Supabase:** create a project, run `supabase/migrations/0001_init.sql` in the SQL editor, then `supabase/seed/0001_programmes.sql` to load the five known programmes. Enable Email auth (on by default), add your local and production URLs under Authentication > URL Configuration.
2. **Admins:** have each team member sign in once via `/admin/login`, then promote them with one SQL statement setting `role = 'admin'` in `profiles`, using their id from Authentication > Users.
3. **Local dev:** `npm install`, copy `.env.example` to `.env.local` with your Supabase URL and anon key, `npm run dev`.
4. **Vercel:** import the GitHub repo, add the same two environment variables, deploy. Then add the resulting `*.vercel.app` URL (and later your custom domain) to Supabase's redirect URLs, or magic-link sign-in won't work.

## 10. Domain

No domain has been secured yet, candidates like `cami.org` or `getcami.com` need a direct check on a registrar (Namecheap, GoDaddy), live availability can't be confirmed from search results.

## 11. Explicitly out of scope for v1

- Anti-spam tooling (CAPTCHA, honeypots, email verification): trust-based by decision, revisit only if abuse appears.
- Automated freshness-checking or expiry alerts on `estimated_deadline`: manual for now, could be a v2 cron job.
- Multi-language UI: main hub site runs ES/EN/VAL, but the directory can ship English-only for v1 given its international audience.
- Map view: see section 6, planned but not required for launch.
