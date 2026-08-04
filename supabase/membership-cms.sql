-- =============================================================
-- MCU — MEMBERSHIP TIER CMS MIGRATION
-- Run this once in Supabase SQL Editor for an existing installation.
--
-- This migration is non-destructive: it adds the fields used by the
-- administrator membership-tier editor and updates only the original
-- Standard / Professional / Premium seed rows to the requested VIP plans.
-- Custom tier rows are left alone when this file is run again.
--
-- Prerequisites: RUN-THIS-IN-SUPABASE.sql should already have been run.
-- This file also creates the small is_admin helper if admin.sql has not yet
-- been run. Never put a service_role key in the browser or in this file.
-- =============================================================

-- 1. Make sure the admin flag/helper exists for RLS policies.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = auth.uid()), FALSE);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Add the editable membership catalogue fields.
--    price is a normal currency amount, not the smallest Stripe unit:
--    50000.00 means USD 50,000.00.
ALTER TABLE public.membershiptiers
  ALTER COLUMN membname TYPE VARCHAR(150),
  ALTER COLUMN tiers TYPE VARCHAR(150);

ALTER TABLE public.membershiptiers
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'International',
  ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS period VARCHAR(40) NOT NULL DEFAULT '/ year',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) NOT NULL DEFAULT '#2EC4B6',
  ADD COLUMN IF NOT EXISTS highlight BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Older installations may have received price as NUMERIC(8,2), which cannot
-- hold the requested USD 2,000,000 tier. Widen it safely.
ALTER TABLE public.membershiptiers
  ALTER COLUMN price TYPE NUMERIC(12, 2);

-- Keep currency values and prices safe when edited from the CMS.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.membershiptiers'::regclass
      AND conname = 'membershiptiers_price_nonnegative'
  ) THEN
    ALTER TABLE public.membershiptiers
      ADD CONSTRAINT membershiptiers_price_nonnegative
      CHECK (price IS NULL OR price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.membershiptiers'::regclass
      AND conname = 'membershiptiers_currency_code'
  ) THEN
    ALTER TABLE public.membershiptiers
      ADD CONSTRAINT membershiptiers_currency_code
      CHECK (currency = upper(currency) AND currency ~ '^[A-Z]{3}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.membershiptiers'::regclass
      AND conname = 'membershiptiers_discount_range'
  ) THEN
    ALTER TABLE public.membershiptiers
      ADD CONSTRAINT membershiptiers_discount_range
      CHECK (discountrate >= 0 AND discountrate <= 1);
  END IF;
END $$;

-- 3. Replace only the original sample rows. Once an administrator changes a
--    row, rerunning this file will not overwrite that custom content.
INSERT INTO public.membershiptiers
  (tierid, membname, tiers, category, price, currency, period,
   discountrate, description, features, color, highlight, active, sort_order)
VALUES
  (
    1,
    'VIP Gold International',
    'VIP Gold',
    'International',
    50000.00,
    'USD',
    '/ year',
    0.10,
    'A prestigious international membership for professionals who want a strong foundation of access, learning and connection.',
    '[
      "International member directory access",
      "Monthly executive webinars",
      "Priority invitations to MCU events",
      "10% discount on course enrolment",
      "Digital VIP Gold membership certificate"
    ]'::jsonb,
    '#E5A52E',
    FALSE,
    TRUE,
    1
  ),
  (
    2,
    'VIP Jade International',
    'VIP Jade',
    'International',
    1000000.00,
    'USD',
    '/ year',
    0.20,
    'An elevated international membership for leaders seeking deeper access to MCU insight, networks and opportunities.',
    '[
      "All VIP Gold benefits",
      "Private quarterly networking briefings",
      "Priority course registration",
      "20% discount on course enrolment",
      "Members-only research reports",
      "Dedicated relationship support"
    ]'::jsonb,
    '#2EC4B6',
    TRUE,
    TRUE,
    2
  ),
  (
    3,
    'VIP Black Diamond',
    'VIP Black Diamond',
    'International',
    2000000.00,
    'USD',
    '/ year',
    0.30,
    'Our highest membership level for distinguished principals and institutions building a lasting global legacy.',
    '[
      "All VIP Jade benefits",
      "Private advisory and strategy sessions",
      "VIP access to the annual conference",
      "30% discount on course enrolment",
      "Personal academic advisor",
      "Black Diamond member spotlight"
    ]'::jsonb,
    '#1A1A2A',
    FALSE,
    TRUE,
    3
  )
ON CONFLICT (tierid) DO UPDATE SET
  membname = EXCLUDED.membname,
  tiers = EXCLUDED.tiers,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  period = EXCLUDED.period,
  discountrate = EXCLUDED.discountrate,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  color = EXCLUDED.color,
  highlight = EXCLUDED.highlight,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  stripe_price_id = NULL
WHERE public.membershiptiers.membname IN ('Standard', 'Professional', 'Premium');

-- 4. Public members see active tiers; administrators can manage all tiers.
ALTER TABLE public.membershiptiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view membership tiers" ON public.membershiptiers;
CREATE POLICY "Anyone can view active membership tiers"
  ON public.membershiptiers
  FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admins manage membership tiers" ON public.membershiptiers;
CREATE POLICY "Admins manage membership tiers"
  ON public.membershiptiers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Verify the migration. You should see three active rows and the new
--    prices/currency. This query is safe to run whenever you need to check.
SELECT tierid, membname, category, price, currency, active, sort_order
FROM public.membershiptiers
ORDER BY sort_order, tierid;
