-- =============================================================
-- MCU — REPAIR SCRIPT (run this ONCE in Supabase SQL Editor)
-- Does NOT wipe anything. Fixes:
--   1. Missing users INSERT policy (blocked profile creation)
--   2. Backfills users rows for accounts that already signed up
--   3. Seeds membershiptiers + instructors + courses (were empty!)
-- =============================================================

-- 1. Allow users to create their own profile row
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Recreate profile rows for ALL existing auth accounts
INSERT INTO public.users (id, email, first_name, last_name, phone_number, area_of_interest)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'area_of_interest', '')
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- 3. Seed membership tiers (REQUIRED — joining a tier fails without these)
INSERT INTO public.membershiptiers (tierid, membname, tiers, discountrate)
VALUES
  (1, 'Standard', 'Standard', 0.10),
  (2, 'Professional', 'Professional', 0.20),
  (3, 'Premium', 'Premium', 0.30)
ON CONFLICT (tierid) DO UPDATE SET
  membname = EXCLUDED.membname,
  tiers = EXCLUDED.tiers,
  discountrate = EXCLUDED.discountrate;

-- 4. Seed instructors (skip if already present)
INSERT INTO public.instructors (firstname, lastname, specialization)
SELECT * FROM (VALUES
  ('Dr. Alexander', 'Wong', 'Wealth Planning & Estate Tax'),
  ('Sarah', 'Chen', 'Family Office Governance'),
  ('Michael', 'Tse', 'CFP Compliance & Financial Analysis')
) AS v(firstname, lastname, specialization)
WHERE NOT EXISTS (SELECT 1 FROM public.instructors);

-- 5. Seed courses (REQUIRED for "Enroll Now" buttons to appear)
INSERT INTO public.courses (coursename, coursetype, price, description, instructorid)
SELECT * FROM (VALUES
  ('Professional Financial Planning Program', 'Financial Planning', 8500.00,
   'Comprehensive training in financial planning fundamentals and CFP-aligned practice.', 1),
  ('CEO Wealth Management Program', 'Wealth Management', 12500.00,
   'Executive-level wealth management strategies for business leaders.', 2),
  ('Family Office Wealth Management Program', 'Family Office', 15000.00,
   'Structuring, governance and investment management for family offices.', 2),
  ('Professional Family Office Consultant Program', 'Executive', 18000.00,
   'Advanced consultancy skills for serving ultra-high-net-worth families.', 3)
) AS v(coursename, coursetype, price, description, instructorid)
WHERE NOT EXISTS (SELECT 1 FROM public.courses);

-- 6. Verify everything (should show 3 / 3 / 4 / your user count)
SELECT
  (SELECT COUNT(*) FROM public.membershiptiers) AS tiers,
  (SELECT COUNT(*) FROM public.instructors)     AS instructors,
  (SELECT COUNT(*) FROM public.courses)         AS courses,
  (SELECT COUNT(*) FROM public.users)           AS users;
