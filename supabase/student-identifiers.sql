-- Permanent student IDs, separate from membership IDs.
-- Run after RUN-THIS-IN-SUPABASE.sql.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS student_number varchar(20) UNIQUE;
CREATE SEQUENCE IF NOT EXISTS public.student_number_seq START WITH 1;
CREATE OR REPLACE FUNCTION public.assign_student_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.student_number IS NULL OR NEW.student_number = '' THEN
    NEW.student_number := 'MCU-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.student_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_student_number ON public.users;
CREATE TRIGGER on_student_number BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.assign_student_number();
-- Backfill existing students. The generated values are permanent once saved.
UPDATE public.users
SET student_number = 'MCU-' || to_char(COALESCE(created_at, now()), 'YYYY') || '-' || lpad(nextval('public.student_number_seq')::text, 6, '0')
WHERE student_number IS NULL;
