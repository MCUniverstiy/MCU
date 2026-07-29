-- =============================================================
-- MCU — CERTIFICATE TEMPLATE EDITOR SETUP
-- Run ONCE in Supabase SQL Editor (safe, non-destructive).
-- Creates: settings table + image storage bucket for the visual
-- template editor at /admin/template.
-- =============================================================

-- 1. Single-row settings table holding the template design as JSON
CREATE TABLE IF NOT EXISTS certtemplate (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO certtemplate (id, settings) VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS: everyone logged-in can read it (needed to render certificates),
--    only admins can change it
ALTER TABLE certtemplate ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read template" ON certtemplate;
CREATE POLICY "Anyone can read template" ON certtemplate
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update template" ON certtemplate;
CREATE POLICY "Admins can update template" ON certtemplate
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Storage bucket for template background images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certtemplates', 'certtemplates', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read cert templates" ON storage.objects;
CREATE POLICY "Public read cert templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certtemplates');

DROP POLICY IF EXISTS "Admins upload cert templates" ON storage.objects;
CREATE POLICY "Admins upload cert templates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certtemplates' AND public.is_admin());

DROP POLICY IF EXISTS "Admins update cert templates" ON storage.objects;
CREATE POLICY "Admins update cert templates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'certtemplates' AND public.is_admin());

DROP POLICY IF EXISTS "Admins delete cert templates" ON storage.objects;
CREATE POLICY "Admins delete cert templates" ON storage.objects
  FOR DELETE USING (bucket_id = 'certtemplates' AND public.is_admin());

-- 4. Verify
SELECT id, settings, updated_at FROM certtemplate;
