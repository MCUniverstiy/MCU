# Google Classroom Integration

Students who pay for a course are **automatically added to its Google
Classroom** — content, calendar, assignments and grading all live in Google;
this site stays the shopfront and the record of who paid.

```
Stripe webhook (payment confirmed)
        │
        ▼
enrollments row created (paymentstatus = 'Paid')
        │
        ▼
lib/google-classroom.ts
  1. try direct roster add  ──► student appears in the class immediately
  2. else send invitation   ──► student clicks "Join" in the invite e-mail
        │
        ▼
outcome saved on the enrollment (classroom_invite_status / _error / _at)
```

- External students (personal `@gmail.com` etc.) **must** join via invite —
  that's Google's rule, not ours. So most students will get an e-mail and
  click **Join**. Direct roster add only succeeds when teacher and student
  are in the same Workspace domain.
- Everything is idempotent: re-runs, webhook retries and admin re-sends are
  safe (Google returns "already enrolled/invited", we record it).
- Classroom failures **never** break a payment — the failure is logged on the
  enrollment row and can be re-sent (see "Retrying" below).

---

## Step 0 — one-time database migration

Supabase Dashboard → SQL Editor → paste `supabase/classroom.sql` → Run.
(Adds `courses.classroom_course_id` and three invite-tracking columns to
`enrollments`.)

## Step 1 — create your classes in Google Classroom

1. With your teacher/admin Google account, go to <https://classroom.google.com>
2. Create one class per website course
3. 🔒 **Security: turn invite codes OFF.** Class → ⚙️ Settings → *Manage invite
   codes* → **Disable**. Our automation adds students directly — a shared code
   would let anyone join a paid class for free. (Students can't invite other
   students by themselves either way, but disable it anyway.)
4. Copy each class ID: open the class → the URL is
   `classroom.google.com/c/**731234567890**` — that number is the ID.

Link them to courses EITHER in the database:

```sql
UPDATE public.courses SET classroom_course_id = '731234567890' WHERE courseid = 1;
```

…OR, with zero DB changes, via env var `GOOGLE_CLASSROOM_COURSE_MAP`:

```
GOOGLE_CLASSROOM_COURSE_MAP={"1":"731234567890","2":"731234567891"}
```

## Step 2 — give the site a Google identity

Pick **one** of two paths.

### Path A — Google Workspace (recommended, ~US$6/mo for 1 teacher seat)

Best long-term: server-to-server auth, no expiring tokens, institutional
account owns the classes.

1. Buy/activate **Google Workspace Business Starter**, create a teacher
   account, e.g. `teaching@your-domain.com`. Create the classes with THIS
   account.
2. [console.cloud.google.com](https://console.cloud.google.com) → create a
   project → **APIs & Services → Library** → enable **Google Classroom API**.
3. **APIs & Services → Credentials → Create Credentials → Service Account**
   → create → open it → **Keys → Add Key → JSON**. Download the file.
   Copy its **Client ID** (the 21-digit number on the service account's
   Details page) — needed next.
4. **Grant domain-wide delegation:** Google Admin console
   ([admin.google.com](https://admin.google.com)) → **Security → Access and
   data control → API controls → Domain-wide delegation → Add new**:
   - Client ID: the service account's 21-digit client ID
   - OAuth scopes: `https://www.googleapis.com/auth/classroom.rosters`
5. Env vars:

```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...(entire JSON, one line)}
GOOGLE_CLASSROOM_TEACHER_EMAIL=teaching@your-domain.com
```

### Path B — free Gmail account (works today, fine for testing)

1. Create/use a Gmail for the institute (e.g. `mcu.teaching@gmail.com`) and
   create the classes with it.
2. [console.cloud.google.com](https://console.cloud.google.com) → project →
   enable **Google Classroom API**.
3. **APIs & Services → OAuth consent screen**: External → fill the basics.
   Add scope `.../auth/classroom.rosters`. Add your Gmail under **Test users**
   (you can skip Google verification while the app is in Testing).
4. **Credentials → Create Credentials → OAuth client ID → Web application**.
   Add authorized redirect URI: `https://oauth2.googleapis.com/oauth/callback`…
   (or use OAuth Playground's `https://developers.google.com/oauthplayground`).
5. Get a refresh token: open
   [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) →
   ⚙️ → tick **Use your own OAuth credentials** (enter your client ID/secret)
   → left list: select **Classroom API v1 → classroom.rosters** → Authorize →
   sign in as the teacher → **Exchange authorization code for tokens** → copy
   the **refresh_token**.
6. Env vars:

```
GOOGLE_OAUTH_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
GOOGLE_OAUTH_REFRESH_TOKEN=1//...
```

⚠️ **Gotcha:** OAuth apps in "Testing" status issue refresh tokens that
**expire after 7 days** — you'll need to redo step 5 weekly. For anything
real, either click **Publish app** on the consent screen (an "unverified app"
warning appears to you as the only user — acceptable), or move to Path A.

## Step 3 — deploy env vars & test

Add the vars to Vercel (Production + Preview), redeploy, then:

1. Buy a course with test card `4242 4242 4242 4242`
2. Watch Stripe webhook deliver → within seconds the buyer (your email) gets
   a **Classroom invitation e-mail** → click **Join**
3. Check in Supabase: `enrollments.classroom_invite_status` should read
   `invited` (or `enrolled`)

### Retrying / testing without buying

As an **admin** (`users.is_admin = true`), re-send an invite anytime from the
browser console on the site:

```js
fetch('/api/classroom-invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enrollmentid: 12 }),
}).then(r => r.json()).then(console.log);
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `classroom_invite_error: ... 403` on direct add | Normal for external students — the invite e-mail path handles it (status becomes `invited`). If *both* fail with 403: the teacher account doesn't own/co-teach that class, or domain-wide delegation scopes are wrong (Path A step 4). |
| `invalid_grant` | Refresh token expired (Testing-mode OAuth app, Path B) — regenerate step B5. |
| No invite e-mail | Check `enrollments.classroom_invite_error`; spam folder; e-mails go to the **address the student registered with** (it must be/become a Google account). |
| Status stuck on `failed` | Fix the cause, then re-send via `/api/classroom-invite` (above). |
