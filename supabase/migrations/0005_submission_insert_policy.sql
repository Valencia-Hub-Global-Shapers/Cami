-- Recreate the public insert policy on submissions. A live database was
-- found rejecting anonymous submissions with "new row violates row-level
-- security policy", so the 0001 policy was missing or altered there.
-- Naming the roles explicitly makes the intent clear. Safe to re-run.

drop policy if exists "anyone can insert a submission" on submissions;
create policy "anyone can insert a submission"
on submissions for insert
to anon, authenticated
with check (true);

grant insert on table submissions to anon, authenticated;
