-- =============================================================
-- MCU — CERTIFICATE UPGRADE
-- Run ONCE in Supabase SQL Editor (safe, non-destructive).
-- 1. Adds recipientname + coursename columns to certificates
-- 2. Upgrades the auto-issue trigger to fill them in
-- 3. Backfills name/course on certificates already issued
-- =============================================================

-- 1. New columns (name + course snapshot at time of issue)
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS recipientname VARCHAR(120);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS coursename VARCHAR(120);

-- 2. Upgraded trigger: fills number, recipient name and course name
CREATE OR REPLACE FUNCTION public.issue_certificate()
RETURNS TRIGGER AS $$
DECLARE
  v_name   VARCHAR(120);
  v_course VARCHAR(120);
BEGIN
  IF NEW.grade = 'Pass' AND (OLD.grade IS DISTINCT FROM 'Pass') THEN
    SELECT TRIM(u.first_name || ' ' || u.last_name), c.coursename
      INTO v_name, v_course
      FROM public.users u, public.courses c
     WHERE u.id = NEW.user_id
       AND c.courseid = NEW.courseid;

    INSERT INTO public.certificates (enrollmentid, certificatenumber, recipientname, coursename)
    VALUES (
      NEW.enrollmentid,
      'MCU-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEW.enrollmentid::TEXT, 6, '0'),
      v_name,
      v_course
    )
    ON CONFLICT (enrollmentid) DO UPDATE SET
      recipientname = EXCLUDED.recipientname,
      coursename    = EXCLUDED.coursename;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (trigger itself already exists from admin.sql and now uses the new function)

-- 3. Backfill names/courses on certificates issued before this upgrade
UPDATE public.certificates cert
   SET recipientname = TRIM(u.first_name || ' ' || u.last_name),
       coursename    = c.coursename
  FROM public.enrollments e
  JOIN public.users u   ON u.id = e.user_id
  JOIN public.courses c ON c.courseid = e.courseid
 WHERE e.enrollmentid = cert.enrollmentid
   AND (cert.recipientname IS NULL OR cert.coursename IS NULL);

-- 4. Verify
SELECT certificateid, certificatenumber, recipientname, coursename, issuedate
  FROM public.certificates
 ORDER BY certificateid;
