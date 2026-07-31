-- =============================================================
-- GOOGLE CLASSROOM INTEGRATION — run this ONCE in the Supabase SQL Editor
--
-- 1. Links each course to its Google Classroom (courses.classroom_course_id)
-- 2. Tracks classroom invite delivery per enrollment (status / error / time)
-- =============================================================

-- 1. Which Google Classroom does this course map to?
--    Find the ID in Classroom: open the class → URL is
--    classroom.google.com/c/NUMERIC_ID  (or class settings page).
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS classroom_course_id TEXT;

-- 2. Invite tracking per enrollment (written by the webhook / admin retry)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS classroom_invite_status VARCHAR(20) DEFAULT NULL;
  -- values: enrolled | invited | already_enrolled | already_invited | failed
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS classroom_invite_error TEXT DEFAULT NULL;
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS classroom_invited_at TIMESTAMPTZ DEFAULT NULL;

-- =============================================================
-- EXAMPLE: link course 1 to a Google Classroom whose ID is 731234567890
-- UPDATE public.courses SET classroom_course_id = '731234567890' WHERE courseid = 1;
-- =============================================================
