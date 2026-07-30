'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import SiteLayout from './SiteLayout';
import { createClient } from '@/lib/supabase/client';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => { (async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login?redirect=/admin/cms'); return; }
    const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle();
    setAllowed(Boolean(data?.is_admin));
  })(); }, [router]);
  if (allowed === null) return <SiteLayout><div style={{ padding: 160, textAlign: 'center' }}>Checking administrator access…</div></SiteLayout>;
  if (!allowed) return <SiteLayout><div style={{ padding: 160, textAlign: 'center' }}><h1>Access denied</h1><p>This area is for administrators only.</p></div></SiteLayout>;
  return <>{children}</>;
}
