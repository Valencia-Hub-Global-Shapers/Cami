-- Exact dates, so the site can work out "open" and "closed" from today's
-- date. Both nullable: programmes without dates keep the status a reviewer
-- chose. The free-text estimated_opening / estimated_deadline stay for
-- vague entries such as "Spring, TBC".

alter table programmes
    add column if not exists opening_date date,
    add column if not exists deadline_date date
        check (opening_date is null or deadline_date is null
               or deadline_date >= opening_date);

-- Same as in 0003, plus opening_date and deadline_date from the review form.
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
        latitude, longitude, opening_date, deadline_date, is_published,
        last_verified_at
    )
    select
        r.university, r.country, r.city, r.programme_name, r.programme_type,
        r.target_group, r.degree_level, r.coverage, r.estimated_opening,
        r.estimated_deadline, r.academic_year, r.language, r.main_eligibility,
        r.required_documents, coalesce(r.status, 'monitor'), r.website,
        r.contact, r.notes, r.latitude, r.longitude, r.opening_date,
        r.deadline_date,
        coalesce(r.is_published, true), current_date
    from jsonb_populate_record(null::programmes, p_programme) as r
    returning id into v_programme_id;

    update submissions
    set review_status = 'approved'
    where id = p_submission_id;

    return v_programme_id;
end;
$$;
