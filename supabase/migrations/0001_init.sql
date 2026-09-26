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

-- Row Level Security

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
