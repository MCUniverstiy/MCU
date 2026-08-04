# Membership tiers: Supabase setup and editing

The membership page now reads its plans from the `membershiptiers` table. Administrators can edit the plans from **Admin → Content Manager → Membership tiers** instead of changing code.

## One-time setup for an existing Supabase project

1. Open your Supabase project dashboard.
2. Select **SQL Editor → New query**.
3. Open `supabase/membership-cms.sql` in this repository and paste the whole file into the editor.
4. Click **Run**.
5. Check the result at the bottom of the query. It should list:
   - VIP Gold International — `USD 50000.00`
   - VIP Jade International — `USD 1000000.00`
   - VIP Black Diamond — `USD 2000000.00`
6. If Stripe checkout is enabled, also run `supabase/stripe.sql` after this migration. The Stripe migration creates the payment ledger and checkout-related columns.
7. Sign in to the website with an administrator account and open `/admin/cms/membership`.

This migration is safe to run again. It only replaces the original `Standard`, `Professional`, and `Premium` seed rows. Rows that an administrator has renamed are not overwritten.

> Do **not** run `supabase/RUN-THIS-IN-SUPABASE.sql` on a live project unless you intentionally want to rebuild the database. That file drops and recreates application tables.

## Making yourself an administrator

If your account is not an administrator yet, edit the email at the bottom of `supabase/admin.sql`:

```sql
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'your-real-email@example.com';
```

Run that statement in Supabase SQL Editor. Then sign out and back in to refresh the session before opening the admin area. Never put a Supabase `service_role` key in frontend code or share it in chat.

## Editing a tier in the website

The membership editor supports:

- display name and internal tier label;
- category (existing categories are offered as suggestions, and a new category can be typed);
- price, currency and billing label;
- course discount percentage;
- description and one feature per line;
- accent colour;
- highlighted / “Most Popular” state;
- active state (inactive tiers are hidden from the public page but remain in the admin list); and
- display order.

When a price or currency is changed, the editor clears the cached Stripe price ID. The next checkout creates a new Stripe price using the updated amount and currency.

## Editing directly in SQL (optional)

Prices are stored as normal decimal amounts, not Stripe cents:

```sql
UPDATE public.membershiptiers
SET price = 50000.00,
    currency = 'USD',
    membname = 'VIP Gold International'
WHERE tierid = 1;
```

Features are stored as a JSON array:

```sql
UPDATE public.membershiptiers
SET features = '["Private briefings", "Priority invitations"]'::jsonb
WHERE tierid = 1;
```

For day-to-day changes, use the admin page so the fields stay formatted consistently. If you edit a price directly in SQL, clear its cached Stripe price before the next checkout:

```sql
UPDATE public.membershiptiers
SET stripe_price_id = NULL
WHERE tierid = 1;
```

The Supabase free plan is sufficient for these tables and policies. The migration does not require a paid Supabase plan; Stripe fees and any payment-provider limits are separate from Supabase storage/database limits.
