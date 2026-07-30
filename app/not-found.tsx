import Link from 'next/link';
import SiteLayout from '@/components/SiteLayout';

export default function NotFound() {
  return <SiteLayout><main style={{ minHeight: '65vh', padding: '180px 24px 80px', textAlign: 'center' }}>
    <p style={{ color: '#7B1A2D', fontWeight: 700, letterSpacing: '0.12em' }}>404</p>
    <h1 style={{ margin: '12px 0', fontSize: 42, color: '#1A1A2A' }}>Page not found</h1>
    <p style={{ color: '#666', marginBottom: 28 }}>The page you requested does not exist or may have moved.</p>
    <Link href="/" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 24, background: '#7B1A2D', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Return home</Link>
  </main></SiteLayout>;
}
