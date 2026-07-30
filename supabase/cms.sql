-- Run after RUN-THIS-IN-SUPABASE.sql and admin.sql.
-- Safe, repeatable CMS migration.
CREATE TABLE IF NOT EXISTS public.products (
  productid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title varchar(200) NOT NULL,
  category varchar(100), price varchar(50) NOT NULL,
  image_url text, description text, badge varchar(50), badge_color varchar(20) DEFAULT '#E5A52E',
  sort_order integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category varchar(80);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration varchar(50) DEFAULT '10 weeks';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level varchar(50) DEFAULT 'Professional';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS format varchar(50) DEFAULT 'Hybrid';
UPDATE public.courses SET category = CASE
  WHEN lower(coursetype) LIKE '%financial%' OR lower(coursetype) LIKE '%planning%' THEN 'Financial Planning'
  WHEN lower(coursetype) LIKE '%wealth%' OR lower(coursetype) LIKE '%management%' THEN 'Wealth Management'
  WHEN lower(coursetype) LIKE '%family%' OR lower(coursetype) LIKE '%office%' THEN 'Family Office'
  WHEN lower(coursetype) LIKE '%executive%' OR lower(coursetype) LIKE '%ceo%' THEN 'Executive'
  ELSE 'Other' END
WHERE category IS NULL;
ALTER TABLE public.instructors ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.instructors ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins manage instructors" ON public.instructors;
CREATE POLICY "Admins manage instructors" ON public.instructors FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public) VALUES ('cms', 'cms', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public read CMS files" ON storage.objects;
CREATE POLICY "Public read CMS files" ON storage.objects FOR SELECT USING (bucket_id = 'cms');
DROP POLICY IF EXISTS "Admins manage CMS files" ON storage.objects;
CREATE POLICY "Admins manage CMS files" ON storage.objects FOR ALL USING (bucket_id = 'cms' AND public.is_admin()) WITH CHECK (bucket_id = 'cms' AND public.is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique ON public.enrollments(user_id, courseid);
