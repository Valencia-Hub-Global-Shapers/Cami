-- Fixes and helpers on top of 0001_init.sql. Safe to run on a database
-- that already has 0001 applied.

-- 1. Admin check without RLS recursion.
--
-- The 0001 policies query `profiles` from inside policies, including a
-- policy on `profiles` itself. Postgres rejects that with "infinite
-- recursion detected in policy for relation profiles". A security definer
-- function reads `profiles` without re-entering RLS.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    );
$$;

drop policy if exists "admins manage programmes" on programmes;
create policy "admins manage programmes"
on programmes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage internal_assessments" on internal_assessments;
create policy "admins manage internal_assessments"
on internal_assessments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage submissions" on submissions;
create policy "admins manage submissions"
on submissions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins read all profiles" on profiles;
create policy "admins read all profiles"
on profiles for select
using (public.is_admin());

-- 2. Keep programmes.updated_at current on every edit.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists programmes_touch_updated_at on programmes;
create trigger programmes_touch_updated_at
before update on programmes
for each row execute function public.touch_updated_at();

-- 3. Approve a submission in one transaction.
--
-- Inserts the (possibly edited) programme and marks the submission as
-- approved. A function body runs atomically, so a submission can never be
-- marked approved without its programme row existing, or vice versa.
-- Runs as the caller (security invoker), so RLS still applies.

create or replace function public.approve_submission(
    p_submission_id uuid,
    p_programme jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_programme_id uuid;
begin
    if not public.is_admin() then
        raise exception 'Only admins can approve submissions';
    end if;

    perform 1 from submissions
    where id = p_submission_id and review_status = 'pending'
    for update;

    if not found then
        raise exception 'Submission is not pending review';
    end if;

    insert into programmes (
        university, country, city, programme_name, programme_type,
        target_group, degree_level, coverage, estimated_opening,
        estimated_deadline, academic_year, language, main_eligibility,
        required_documents, status, website, contact, notes,
        is_published, last_verified_at
    )
    select
        r.university, r.country, r.city, r.programme_name, r.programme_type,
        r.target_group, r.degree_level, r.coverage, r.estimated_opening,
        r.estimated_deadline, r.academic_year, r.language, r.main_eligibility,
        r.required_documents, coalesce(r.status, 'monitor'), r.website,
        r.contact, r.notes, coalesce(r.is_published, true), current_date
    from jsonb_populate_record(null::programmes, p_programme) as r
    returning id into v_programme_id;

    update submissions
    set review_status = 'approved'
    where id = p_submission_id;

    return v_programme_id;
end;
$$;
