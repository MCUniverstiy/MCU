CREATE TABLE IF NOT EXISTS public.contact_messages (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,name varchar(150) NOT NULL,email varchar(255) NOT NULL,phone varchar(50),subject varchar(150) NOT NULL,message text NOT NULL,status varchar(30) NOT NULL DEFAULT 'New',created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
