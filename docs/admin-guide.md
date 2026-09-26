# Admin guide

How admin access to Camí works, and how to add, list and remove admins.

Everything here happens in the Supabase dashboard for the project. There is
deliberately no "make admin" button in the app itself, so that nobody can
grant admin rights through the website, even by mistake.

## How admin access works

Being an admin takes two separate records:

1. **A user account** in Supabase Auth (`auth.users`). It is created the
   first time someone requests a sign-in link at `/admin/login`. On its own
   it grants nothing: anyone can create one, and it only proves that the
   person controls that email address.
2. **An admin row** in the `profiles` table with `role = 'admin'`. This is
   what actually grants access. Only someone with access to the Supabase
   dashboard can create it.

Access is checked in two places, on every request:

- **The route guard** (`middleware.ts`) runs before any `/admin` page loads.
  A visitor with no session goes to `/admin/login`. A signed-in user who
  is not an admin goes to `/admin/login` with a message saying the account
  is not an admin yet.
- **Row Level Security** in the database is the real protection. Every query
  on submissions, internal assessments and unpublished programmes checks
  `public.is_admin()` (see `supabase/migrations/0002_admin_helpers.sql`).
  Even if the route guard were bypassed, a non-admin would get no data
  back.

Because both checks run on every request, adding or removing an admin takes
effect on that person's next page load. They do not need to sign out and
in again.

## Before you start: sign-in email delivery

Admins sign in with a magic link sent by email, so emails have to reach
them.

Supabase's built-in email service only delivers to addresses that are
members of the Supabase organization, and only a few emails per hour. Pick
one of these:

- **Invite each admin to the Supabase organization.** Go to the organization
  settings > Team > Invite. This is the simplest option for a small team,
  but it also gives them access to the Supabase dashboard.
- **Set up your own email sender.** Go to Authentication > Emails > SMTP
  Settings and use a provider such as Resend or Brevo (both have free
  tiers). Admins then need no Supabase access at all. This is recommended
  once more than one or two people review submissions.

## Add an admin

### Step 1: the person signs in once

Send them to <https://cami-gs.vercel.app/admin/login>. They enter their
email and click the link they receive. The link opens the site and shows:

> This account is signed in but is not an admin yet.

That is expected: their user account now exists, but they are not an admin
yet.

### Step 2: grant admin rights

In the Supabase dashboard, open **SQL Editor > New query**, paste the query
below, replace the email address and name, and click **Run**:

```sql
insert into public.profiles (id, role, full_name)
select id, 'admin', 'Their Full Name'
from auth.users
where email = 'their.email@example.org'
on conflict (id) do update
set role = 'admin', full_name = excluded.full_name;
```

What each part does:

- `from auth.users where email = ...` looks up the account created in step 1,
  so you never need to copy a user id by hand.
- `insert into public.profiles ... 'admin'` creates the admin row.
- `on conflict (id) do update` makes it safe to run twice, and turns an
  existing non-admin profile into an admin.

The SQL Editor runs with full database rights, which is why this works
there and cannot be done through the website.

### Step 3: check it worked

Run:

```sql
select u.email, p.full_name, p.role, u.last_sign_in_at
from public.profiles p
join auth.users u on u.id = p.id
order by u.email;
```

The new person should be listed with role `admin`. If they are missing,
the email in step 2 did not match their account exactly: check the
spelling, or find the account under **Authentication > Users**.

Then ask them to reload <https://cami-gs.vercel.app/admin>. The review
queue should open.

## Remove an admin

To remove admin rights but keep the account:

```sql
update public.profiles
set role = 'member'
where id = (select id from auth.users where email = 'their.email@example.org');
```

To delete the account entirely, go to **Authentication > Users**, open the
user's menu and click **Delete user**. Their `profiles` row is deleted with
it automatically.

Either way, they lose access on their next page load. Submissions they
reviewed stay in the history.

## List all admins

```sql
select u.email, p.full_name, u.last_sign_in_at
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin'
order by u.email;
```

It is worth running this now and then, and removing people who have left
the review team.

## Optional: stop unknown people creating accounts

By default anyone can request a sign-in link, which creates a user account
with no rights. This is harmless, but it does add clutter to
Authentication > Users. To allow only people you invite:

1. Go to **Authentication > Sign In / Providers** and turn off
   **Allow new users to sign up**.
2. To add an admin from then on, go to **Authentication > Users > Add user >
   Create new user**. Enter their email, type any long random password
   (Camí never uses it) and tick **Auto Confirm User**. This replaces step 1
   above. Then do steps 2 and 3 as usual, and tell them to sign in at
   `/admin/login`.

With sign-ups off, anyone not invited who tries `/admin/login` sees
"Could not send the link".

## Map pins

Each programme can have a pin on the directory map. You do not need to
look up coordinates: when you approve a submission, create a programme or
save one, Camí asks OpenStreetMap where the university is and stores the
answer.

- **When it runs:** only when the "Find the location automatically" box is
  ticked in the Map location section of the form. It is ticked by default
  for programmes without a pin, and unticked once a pin exists, so saving
  an edit never moves an existing pin by surprise.
- **What counts as a match:** only places OpenStreetMap marks as a
  university or college. A foundation, an office or a city name gets no
  pin rather than a wrong one. For example, "SAID Foundation" funds study
  at several UK universities, so it correctly stays off the map and is
  listed under "Not on the map" in the directory.
- **If nothing is found:** the programme is still saved and published, and
  a notice says no location was found. Add coordinates by hand if it should
  have a pin (see below).
- **Existing programmes without a pin:** in Programmes, click **Find
  missing map locations**. It looks up to 8 programmes per click, about one
  per second, as OpenStreetMap's usage policy asks.

### Check or correct a pin

1. In **Programmes**, open **Edit public details**. The Map location
   section shows the current pin with a link to check it on OpenStreetMap.
2. To correct it, open **Set or correct the pin by hand** and type the
   coordinates as `latitude, longitude`, for example `41.5021, 2.1045`. In
   Google Maps, right-click the campus and click the numbers at the top of
   the menu to copy them. Typed coordinates always win over the automatic
   lookup.
3. To look it up again after changing the university name, clear the
   coordinates and tick the automatic box.
4. To remove a pin, clear the coordinates, leave the box unticked, and
   save.

## Troubleshooting

| What the person sees | Cause | Fix |
|---|---|---|
| No email arrives | Supabase's built-in email limits | See "Before you start" above. Also check spam. |
| "Could not send the link" | Sign-ups are turned off and they were not invited, or too many emails were sent within the hour | Invite them, or wait an hour |
| "That sign-in link has expired or was already used" | Links work once, for a limited time. Opening a link in a different browser from the one that requested it also fails. | Request a new link and open it in the same browser |
| The link opens the wrong site or shows a Supabase error | The site address is missing from Supabase's redirect list | Authentication > URL Configuration: make sure `https://cami-gs.vercel.app/**` is under Redirect URLs |
| "This account is signed in but is not an admin yet" | Step 2 was not done, or the email did not match | Run step 3 to check, then step 2 again |
| Admin pages open but show nothing, or actions fail | Migration `0002_admin_helpers.sql` was not run | Run it in the SQL Editor |
| Saving a programme fails with a message about `latitude` | Migration `0003_programme_location.sql` was not run | Run it in the SQL Editor |
