CREATE TABLE IF NOT EXISTS public.shop_orders (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,customer_name varchar(150) NOT NULL,email varchar(255) NOT NULL,phone varchar(50),address text,notes text,status varchar(30) NOT NULL DEFAULT 'New',total numeric(10,2) NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.shop_order_items (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,order_id bigint NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,product_id bigint NOT NULL,title varchar(200) NOT NULL,price varchar(50) NOT NULL,quantity integer NOT NULL CHECK(quantity > 0));
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY; ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.shop_orders; CREATE POLICY "Anyone can create orders" ON public.shop_orders FOR INSERT TO anon, authenticated WITH CHECK(true);
DROP POLICY IF EXISTS "Admins view orders" ON public.shop_orders; CREATE POLICY "Admins view orders" ON public.shop_orders FOR SELECT TO authenticated USING(public.is_admin());
DROP POLICY IF EXISTS "Admins update orders" ON public.shop_orders; CREATE POLICY "Admins update orders" ON public.shop_orders FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
DROP POLICY IF EXISTS "Admins delete orders" ON public.shop_orders; CREATE POLICY "Admins delete orders" ON public.shop_orders FOR DELETE TO authenticated USING(public.is_admin());
DROP POLICY IF EXISTS "Anyone can create order items" ON public.shop_order_items; CREATE POLICY "Anyone can create order items" ON public.shop_order_items FOR INSERT TO anon, authenticated WITH CHECK(true);
DROP POLICY IF EXISTS "Admins view order items" ON public.shop_order_items; CREATE POLICY "Admins view order items" ON public.shop_order_items FOR SELECT TO authenticated USING(public.is_admin());
DROP POLICY IF EXISTS "Admins update order items" ON public.shop_order_items; CREATE POLICY "Admins update order items" ON public.shop_order_items FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
DROP POLICY IF EXISTS "Admins delete order items" ON public.shop_order_items; CREATE POLICY "Admins delete order items" ON public.shop_order_items FOR DELETE TO authenticated USING(public.is_admin());
GRANT INSERT ON public.shop_orders, public.shop_order_items TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
-- Use a controlled server-side function so an order and its line items are atomic.
CREATE OR REPLACE FUNCTION public.create_shop_order(order_data jsonb, items_data jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id bigint;
BEGIN
 INSERT INTO shop_orders(customer_name,email,phone,address,notes,total) VALUES (order_data->>'customer_name',order_data->>'email',NULLIF(order_data->>'phone',''),NULLIF(order_data->>'address',''),NULLIF(order_data->>'notes',''),COALESCE((order_data->>'total')::numeric,0)) RETURNING id INTO new_id;
 INSERT INTO shop_order_items(order_id,product_id,title,price,quantity) SELECT new_id,(x->>'productid')::bigint,x->>'title',x->>'price',(x->>'quantity')::int FROM jsonb_array_elements(items_data) x;
 RETURN new_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_shop_order(jsonb,jsonb) TO anon, authenticated;
