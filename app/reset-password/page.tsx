'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px', fontSize: 15, borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)', outline: 'none', background: '#fff',
    fontFamily: 'DM Sans, sans-serif', color: '#1A1A2A', transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(123,26,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: 32, color: '#7B1A2D' }}>✓</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>Password Updated!</h1>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 1.7 }}>
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-gold">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, marginBottom: 24, background: 'rgba(123,26,45,0.06)', border: '1px solid rgba(123,26,45,0.15)', color: '#7B1A2D', fontSize: 14, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>New Password</label>
          <input
            type="password" required placeholder="Min. 8 characters"
            style={inputStyle} value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Confirm New Password</label>
          <input
            type="password" required placeholder="Repeat new password"
            style={inputStyle} value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
        </div>
        <button
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600, background: loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', marginTop: 8 }}
          onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = '#9B2A3D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        >
          {loading ? 'Updating…' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FA', display: 'flex' }}>
      <div style={{ width: '45%', background: 'linear-gradient(135deg, #7B1A2D 0%, #5a1320 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', overflow: 'hidden' }} className="auth-panel">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={56} />
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginTop: 32, lineHeight: 1.2 }}>Set New Password</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginTop: 16, lineHeight: 1.7, maxWidth: 320 }}>
            Enter your new password below. Make sure it's at least 8 characters long.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/login" style={{ fontSize: 13, color: '#7B1A2D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>← Back to Sign In</Link>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1A1A2A', marginTop: 24, marginBottom: 8 }}>Reset Password</h1>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 36 }}>Choose a new password for your account.</p>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}