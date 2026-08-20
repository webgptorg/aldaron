# Secure the RLS of the contacts — what to do on the Supabase dashboard

## Why this is needed

The `Contact` table holds every lead of the site — full names, e-mail addresses, phone numbers, notes and ip addresses.

Until now the table had **row level security switched off** and the browser wrote into it directly with the **anonymous
key**. That key is public by design — it is part of the JavaScript of every single page, anybody can read it from the
sources of `/cs` in a few seconds. With row level security off, that key is enough to do this:

```bash
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/Contact?select=*" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

…and get **all the leads**. The same key could also change or delete them.

The fix is to close the table completely and let only the server touch it, with the service role key which never leaves
the server. **The application is already changed for it** (see the last section), the steps below are what is left to do
on the Supabase side.

## ⚠️ Do the steps in this order

Step 1 must be finished **before** step 2. Between enabling the row level security and having the service role key in
place, the contact forms and `/admin/contacts` would not work, so the key goes first.

---

## Step 1 — Give the server the service role key

1. Open the Supabase dashboard → your project → **Project Settings** → **API Keys** (in an older dashboard it is
   **Settings** → **API** → **Project API keys**).
2. Find **`service_role`** (it is the secret one, marked as "This key has the ability to bypass Row Level Security").
   Click **Reveal** and copy it.

   > ⚠️ This key bypasses every rule of the database. It must never appear in the frontend code, in the repository, or
   > in any variable whose name starts with `NEXT_PUBLIC_`.

3. Put it into the **hosting** of the site (Vercel → your project → **Settings** → **Environment Variables**), for
   Production, Preview and Development:

    ```
    SUPABASE_SERVICE_ROLE_KEY=<the copied service_role key>
    ```

4. Put the very same line into your local `.env` file (it is git-ignored, so it stays on your machine):

    ```
    SUPABASE_SERVICE_ROLE_KEY=<the copied service_role key>
    ```

5. **Redeploy** the site, so that the running server really has the variable. Environment variables are read when the
   server starts, an already running deployment will not see the new one.

6. Check that the deployed `/admin/contacts?token=…` still lists the contacts. It now reads them through the service
   role key. If it says `Database not configured`, the variable did not arrive — fix that before going on.

---

## Step 2 — Close the `Contact` table

1. Open the Supabase dashboard → your project → **SQL Editor** → **New query**.
2. Paste the whole content of [`lib/contacts/contact-table-rls.sql`](lib/contacts/contact-table-rls.sql) and press
   **Run**.

    It does four things:
    - switches row level security on for `public."Contact"`,
    - drops every policy which may have been left there earlier (a policy is what would open the table again),
    - takes the table away from the `anon` and `authenticated` roles altogether,
    - keeps the full access for `service_role`, which is our server.

3. Expect `Success. No rows returned`.

> If you would rather click it than run the SQL: **Table Editor** → table `Contact` → the three dots next to its name →
> **Enable Row Level Security**, and then **Authentication** → **Policies** → `Contact` → delete every policy listed
> there. Running the SQL is still recommended, because it also takes away the rights of the public roles, which the
> Table Editor cannot do.

---

## Step 3 — Check that it is really closed

1. **The leads must no longer be readable with the public key.** Run this with the values from your `.env`:

    ```bash
    curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/Contact?select=*" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ```

    - Before: the whole list of the leads.
    - Now expected: `{"code":"42501","message":"permission denied for table Contact"...}` (or `[]`).
    - ❌ If you still see the leads, the SQL did not run against the project the site uses.

2. **The public key must no longer be able to write a lead either:**

    ```bash
    curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/Contact" \
      -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -d '{"email":"forged@example.com"}'
    ```

    Expected: a `permission denied` answer, no new row.

3. **A real contact form must still work.** Open the site, fill in for example the newsletter form in the footer, and
   check that the contact appears in `/admin/contacts?token=…`. It goes through `/api/waitlist` now.

4. **The dashboard must still work fully** — listing, adding by hand, editing a note, marking as contacted, deleting and
   both exports.

---

## Step 4 — Afterwards

- The anonymous key was, until now, a key to all the leads and it is public. Anybody who took a copy of the leads
  earlier still has it, and the key itself is worth rotating: Supabase dashboard → **Project Settings** → **API Keys** →
  the `anon` key → **Rotate**. If you rotate it, set the new value as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the hosting and
  in `.env` and redeploy.
- Consider whether the ip addresses of the leads are still needed at all — they are the most sensitive column of the
  table and nothing in the dashboard depends on them.
- What this change does **not** solve: `/api/waitlist` is open to everybody, exactly as leaving a contact in a form has
  to be, so somebody can still write nonsense leads into the table. They can no longer read or change what is already
  there, which was the real leak, but if the leads ever start being flooded, the endpoint is now the one place where a
  rate limit or a captcha would go.

---

## What was changed in the application

Nothing here needs your attention on the dashboard, it is just so that you know what happens now:

- **`/api/waitlist` (new)** — every public form of the site now leaves the contact through this endpoint, which writes
  it on the server with the service role key. The browser sends only what the person filled in plus the page they filled
  it in on; who they are (`userAgent`), from which address they came (`ipAddress`) and that the lead is not contacted yet
  is decided by the server, so a forged request cannot pretend to be somebody else or an already answered lead. The
  detour over `api.ipify.org` for the ip address is gone, the server reads it from the request itself.
- **`subscribeToWaitlist`** — same function, same arguments, all the forms which use it are untouched; it only asks the
  api instead of the database now.
- **`/api/contacts`** — the administration api reads and writes the contacts through the service role key as well.
- **`lib/contacts/contactsDatabase.ts` (new)** — the one and only place in the whole codebase which reaches the
  `Contact` table, so the rule "only the service role opens the contacts" is written down exactly once.
- **`lib/contacts/contact-table-rls.sql` (new)** — the SQL of step 2, kept in the repository next to the tables of the
  workshop, so it is clear how the table is protected.

⚠️ One behaviour changed on purpose: when the server has no service role key, a contact form now shows an error instead
of quietly pretending that the contact was saved. A lost lead should be loud.

---

# Put the live workshop room into production

The participant room and its administration are implemented in the application, but the database migration still has
to be run against the Supabase project before the room can accept participants.

1. Keep `SUPABASE_SERVICE_ROLE_KEY` configured on the server as described above. Workshop tables are deliberately
   unreachable with the public anonymous key; the API cannot operate without the server-only key.
2. In Supabase **SQL Editor**, run the complete file
   [`migrations/2026-07-0040-workshop-page`](migrations/2026-07-0040-workshop-page). It creates the reusable workshop,
   participant, content, comment, upvote and reaction tables; their indexes and integrity triggers; forced RLS; and the
   receive-only private Realtime Broadcast policy. It also creates the `online-workshop-2026-08-20` occurrence used by
   `/cs/online-workshop/participant`.
3. In **Realtime Settings**, keep Realtime enabled and set the maximum concurrent clients and event throughput for the
   expected audience. A room intended for more than 1,000 simultaneously connected participants needs limits of at
   least that size. Restricting the project to private channels is recommended; this room already subscribes as a
   private channel and authorizes reads through the migration policy.
4. Open `/admin?token=<ADMIN_TOKEN>`, choose **Živé workshopy**, add the YouTube stream URL, check the start time and
   publish the desired Markdown blocks with their unlock times. The video ID is validated and stored separately from
   the URL.
5. Smoke-test in a private browser window with
   `/cs/online-workshop/participant?email=test@example.com&fullname=Test`. Confirm that the form is prefilled, a
   submitted comment first appears under moderation, approval makes it visible, and a reaction animates in a second
   browser.

Do not add a browser policy to any `public.workshop_*` table. Participants always use the server API and a hash-only
HttpOnly session; opening a table to `anon` would expose identities or moderation data. Realtime events contain only
invalidation signals, reaction emoji and public vote totals, so the database remains the source of truth if a client
misses an event.

---

# Make room for the reactions which have an animation of their own

Thirteen reactions (👍 ❤️ 👏 🔥 💡 😂 `</>` ✨ 🐍 👀 🎉 🎆 👩‍💻) are now celebrated their own way in the room. A
workshop which wants to offer all of them at once did not fit into the twelve reactions the table allowed, so one more
migration is waiting:

1. In Supabase **SQL Editor**, run [`migrations/2026-07-0040-workshop-page-6.sql`](migrations/2026-07-0040-workshop-page-6.sql).
   It raises the guard on `workshops.allowed_reactions` to sixteen and offers the whole animated set as the default of
   the column.
2. Until it is run, saving more than twelve reactions in `/admin/workshops` fails on the database, and everything else
   keeps working exactly as before. Workshops which already exist keep the reactions they have.
3. The animations themselves need no migration at all — they are decided in the browser from the text of the reaction,
   so any reaction, including one sent from the administration, flies without the database knowing about it.
