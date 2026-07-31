# Stripe Setup — Managed Payments

The site now takes **real payments** via Stripe Checkout with [Managed Payments]
enabled (Stripe handles tax calculation on digital products). The mock `4242`
checkout forms are gone.

## How it works now

```
Student clicks "Pay" on /courses or /membership
        │
        ▼
POST /api/create-checkout-session         (app/api/create-checkout-session/route.ts)
  • verifies the user is signed in
  • price + member-discount resolved SERVER-SIDE (browser can only send an ID)
  • creates the Stripe Product + default price on first checkout of an item
    (cached afterwards as `stripe_price_id` on the row)
  • member discount applied as a Stripe coupon (`member-tier-N`)
  • creates a Checkout Session with managed_payments[enabled] = true
        │
        ▼  redirect to session.url
Stripe hosted checkout  →  success_url: /courses?checkout=success
        │
        ▼
POST /api/stripe-webhook  (checkout.session.completed)
  • signature verified with STRIPE_WEBHOOK_SECRET
  • writes stripe_payments ledger row (idempotent — safe on retries)
  • course     → enrollments row (paymentstatus = 'Paid')
  • membership → users.tierid set (memberid auto-assigned by trigger)
```

Enrollment/membership is activated **only** by the webhook — never by browser
code. `supabase/stripe.sql` also drops the old RLS policies that let any
logged-in user enroll themselves or set their own tier.

## One-time setup

### 1. Run the database migration
Supabase Dashboard → SQL Editor → paste `supabase/stripe.sql` → Run.
(Also sets the tier prices: Standard 1200 / Professional 3800 / Premium 8800 HKD.)

### 2. Environment variables
Copy `.env.example` → `.env.local` and fill in:

| Key | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys (use `sk_test_…` while testing) |
| `STRIPE_PUBLISHABLE_KEY` | Same page (kept for future client-side Stripe.js use) |
| `STRIPE_WEBHOOK_SECRET` | See step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (secret!) |

### 3. Webhook endpoint

**Production:** Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://<your-domain>/api/stripe-webhook`
- Event: `checkout.session.completed` (only this one is needed)

Copy the endpoint's **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

**Local development** (Stripe CLI):
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
# prints: whsec_...  → put that in .env.local as STRIPE_WEBHOOK_SECRET
```

### 4. Test a purchase
1. `npm run dev`, sign in on the site
2. Enroll in a paid course → you're redirected to Stripe Checkout
3. Test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. **Try different billing addresses** — with Managed Payments, the tax
   shown changes by customer location
5. Back on the site: the "✓ Enrolled" badge appears within a few seconds,
   and rows appear in `stripe_payments` + `enrollments`

Check Supabase table `stripe_payments` for the ledger, and the Stripe
Dashboard → Payments for the charge.

## Notes

- Managed Payments is a preview API; requests pin `2026-02-25.preview` via the
  `Stripe-Version` header (`lib/stripe.ts`). The blueprint allows "2026-02-25.preview
  **or above**" — if your account rejects that header or the `managed_payments`
  parameter (older preview headers can age out), set
  `STRIPE_MANAGED_PAYMENTS_API_VERSION` to your account's API version
  (shown on the webhook's details page, e.g. `2026-06-24.dahlia`). The rest of
  the SDK calls use the library default version.
- Tax code used is `txcd_10103100` (digital goods). Adjust per product in
  `lib/stripe-catalog.ts` if your accountant wants a different category.
- Products/prices are created on demand (first checkout of each course/tier)
  and cached in the `stripe_price_id` column — admins never need to touch the
  Stripe Dashboard to add a new course: just set its `price` in Supabase.
- Free courses (`price = 0`) skip Stripe entirely and enroll directly.
