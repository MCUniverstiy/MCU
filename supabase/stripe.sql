-- =============================================================
-- STRIPE PAYMENTS — run this ONCE in the Supabase SQL Editor
-- (Dashboard → SQL Editor → paste → Run)
--
-- What this does:
--   1. Adds price + Stripe price cache to membershiptiers
--   2. Adds a Stripe price cache to courses
--   3. Adds a Stripe customer link to users
--   4. Links enrollments to the Stripe checkout session that paid for them
--   5. Creates a stripe_payments ledger (idempotency + admin auditing)
--   6. LOCKS DOWN self-service privilege escalation: enrollments and
--      tier changes can now only be created by the Stripe webhook
--      (service role), not by client-side code.
-- =============================================================

-- 1. Membership pricing is stored as a normal decimal amount. The
--    membership CMS migration seeds the VIP USD plans and adds editable
--    currency/category/feature fields. Keep this migration safe for older
--    installations that only have the original membership columns.
ALTER TABLE public.membershiptiers
  ADD COLUMN IF NOT EXISTS price NUMERIC(12,2)
    CHECK (price IS NULL OR price >= 0);
ALTER TABLE public.membershiptiers
  ALTER COLUMN price TYPE NUMERIC(12,2);
ALTER TABLE public.membershiptiers
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE public.membershiptiers
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Legacy fallback only. Normal installations should run
-- supabase/membership-cms.sql, which changes the three original seed rows to
-- VIP Gold International / VIP Jade International / VIP Black Diamond.
UPDATE public.membershiptiers SET price = 50000.00 WHERE tierid = 1 AND price IS NULL;
UPDATE public.membershiptiers SET price = 1000000.00 WHERE tierid = 2 AND price IS NULL;
UPDATE public.membershiptiers SET price = 2000000.00 WHERE tierid = 3 AND price IS NULL;

-- 2. Cached Stripe price per course (created lazily on first checkout)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 3. One Stripe customer per user, reused across purchases
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 4. Which checkout session paid for this enrollment (+ dup protection)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS enrollments_stripe_session_unique
  ON public.enrollments (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- A student must never be enrolled in the same course twice
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique
  ON public.enrollments (user_id, courseid);

-- 5. Payment ledger: one row per successful Stripe checkout.
--    The webhook anchors idempotency on stripe_session_id.
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  paymentid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('course', 'membership')),
  courseid INT REFERENCES public.courses(courseid) ON DELETE SET NULL,
  tierid INT REFERENCES public.membershiptiers(tierid) ON DELETE SET NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'hkd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.stripe_payments;
CREATE POLICY "Users can view own payments" ON public.stripe_payments
  FOR SELECT USING (auth.uid() = user_id);

-- (No INSERT/UPDATE policies: only the service-role webhook writes here.)

-- 6. Lockdown: enrollment inserts now happen ONLY via the Stripe webhook.
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;

-- 6b. Lockdown: block client-side membership self-upgrades. The old app
--     updated users.tierid directly from the browser — anyone could grant
--     themselves Premium. Tier changes now come only from the webhook
--     (database role = service_role).
CREATE OR REPLACE FUNCTION public.block_client_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('role', true) = 'authenticated'
     AND NEW.tierid IS DISTINCT FROM OLD.tierid THEN
    RAISE EXCEPTION 'Membership tier changes must go through checkout.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS guard_tier_change ON public.users;
CREATE TRIGGER guard_tier_change
  BEFORE UPDATE OF tierid ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.block_client_tier_change();
