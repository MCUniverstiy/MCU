-- =============================================================
-- MCU — Seed / Test Data
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Safe to re-run: uses ON CONFLICT upserts / do-nothing.
-- =============================================================


-- 1. Insert Membership Tiers (tierid: 1 = Standard, 2 = Professional, 3 = Premium)
INSERT INTO public.membershiptiers (tierid, membname, tiers, discountrate)
VALUES
  (1, 'Standard', 'Standard', 0.10),
  (2, 'Professional', 'Professional', 0.20),
  (3, 'Premium', 'Premium', 0.30)
ON CONFLICT (tierid) DO UPDATE SET
  membname = EXCLUDED.membname,
  tiers = EXCLUDED.tiers,
  discountrate = EXCLUDED.discountrate;


-- 2. Insert Instructors
INSERT INTO public.instructors (firstname, lastname, specialization)
VALUES
  ('Dr. Alexander', 'Wong', 'Wealth Planning & Estate Tax'),
  ('Sarah', 'Chen', 'Family Office Governance'),
  ('Michael', 'Tse', 'CFP Compliance & Financial Analysis')
ON CONFLICT DO NOTHING;


-- 3. Insert Sample Courses
INSERT INTO public.courses (coursename, coursetype, price, description, instructorid)
VALUES
  ('Professional Financial Planning Program', 'Financial Planning', 8500.00,
   'Comprehensive training in financial planning fundamentals and CFP-aligned practice.', 1),
  ('CEO Wealth Management Program', 'Wealth Management', 12500.00,
   'Executive-level wealth management strategies for business leaders.', 2),
  ('Family Office Wealth Management Program', 'Family Office', 15000.00,
   'Structuring, governance and investment management for family offices.', 2),
  ('Professional Family Office Consultant Program', 'Executive', 18000.00,
   'Advanced consultancy skills for serving ultra-high-net-worth families.', 3)
ON CONFLICT DO NOTHING;
