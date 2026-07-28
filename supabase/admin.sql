-- =============================================================
-- MCU — ADMIN / GRADING SETUP
-- Run this ONCE in the Supabase SQL Editor (safe, non-destructive).
-- Adds: is_admin flag, admin RLS policies, auto-certificate trigger.
-- =============================================================

-- 1. Add is_admin flag to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Helper function to check admin status (SECURITY DEFINER avoids
--    recursive RLS problems when policies on users reference users)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = auth.uid()), FALSE);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Admin RLS policies
-- Admins can see all user profiles (needed to list students)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (public.is_admin());

-- Admins can see all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (public.is_admin());

-- Admins can update enrollments (set grades)
DROP POLICY IF EXISTS "Admins can update enrollments" ON public.enrollments;
CREATE POLICY "Admins can update enrollments" ON public.enrollments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Certificates: students see their own, admins see all
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.enrollmentid = certificates.enrollmentid AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
CREATE POLICY "Admins can view all certificates" ON public.certificates
  FOR SELECT USING (public.is_admin());

-- 5. BONUS: auto-generate a certificate when a grade becomes 'Pass'
CREATE OR REPLACE FUNCTION public.issue_certificate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.grade = 'Pass' AND (OLD.grade IS DISTINCT FROM 'Pass') THEN
    INSERT INTO public.certificates (enrollmentid, certificatenumber)
    VALUES (
      NEW.enrollmentid,
      'MCU-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEW.enrollmentid::TEXT, 6, '0')
    )
    ON CONFLICT (enrollmentid) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_grade_pass ON public.enrollments;
CREATE TRIGGER on_grade_pass
  AFTER UPDATE OF grade ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.issue_certificate();

-- =============================================================
-- 6. MAKE YOURSELF ADMIN  ←←← EDIT THE EMAIL BELOW!
-- =============================================================
UPDATE public.users SET is_admin = TRUE
WHERE email = 'YOUR_EMAIL_HERE@example.com';

-- Verify: should list your account with is_admin = true
SELECT email, memberid, is_admin FROM public.users WHERE is_admin;
