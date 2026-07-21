'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px', fontSize: 15, borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)', outline: 'none', background: '#fff',
    fontFamily: 'DM Sans, sans-serif', color: '#1A1A2A', transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const callbackError = searchParams.get('error');

  return (
    <>
      {(error || callbackError) && (
        <div style={{
          padding: '14px 18px', borderRadius: 10, marginBottom: 24,
          background: 'rgba(123,26,45,0.06)', border: '1px solid rgba(123,26,45,0.15)',
          color: '#7B1A2D', fontSize: 14, lineHeight: 1.5,
        }}>
          {callbackError === 'auth_callback_failed'
            ? 'Authentication failed. Please try signing in again.'
            : error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Email Address</label>
          <input
            type="email" required placeholder="you@example.com"
            style={inputStyle} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 13, color: '#7B1A2D', fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <input
            type="password" required placeholder="••••••••"
            style={inputStyle} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="remember" style={{ width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="remember" style={{ fontSize: 14, color: '#666', cursor: 'pointer' }}>Remember me for 30 days</label>
        </div>
        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600,
            background: loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D', color: '#fff', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', marginTop: 8,
          }}
          onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = '#9B2A3D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: '#999' }}>
          By signing in you agree to our{' '}
          <a href="#" style={{ color: '#7B1A2D' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#7B1A2D' }}>Privacy Policy</a>
        </span>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FA', display: 'flex' }}>
      <div style={{
        width: '45%', background: 'linear-gradient(135deg, #7B1A2D 0%, #5a1320 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }} className="auth-panel">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ animation: 'kenburns 25s ease-in-out infinite alternate', position: 'absolute', inset: 0 }}>
          <img src="https://mcuinstitute.com/wp-content/uploads/2025/04/pexels-element5-1370296-scaled.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={56} />
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginTop: 32, lineHeight: 1.2 }}>Welcome Back</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginTop: 16, lineHeight: 1.7, maxWidth: 320 }}>
            Sign in to access your MCU Institute student portal, course materials, and member benefits.
          </p>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['Access all enrolled courses', 'Track your CPD progress', 'Connect with your cohort', 'Download certificates'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5A52E' }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/" style={{ fontSize: 13, color: '#7B1A2D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>← Back to site</Link>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1A1A2A', marginTop: 24, marginBottom: 8 }}>Sign In</h1>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 36 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#7B1A2D', fontWeight: 600 }}>Register here</Link>
          </p>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}