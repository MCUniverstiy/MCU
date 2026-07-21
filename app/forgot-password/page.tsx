'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) { setError(resetError.message); return; }
      setSent(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FA', display: 'flex' }}>
      <div style={{ width: '45%', background: 'linear-gradient(135deg, #7B1A2D 0%, #5a1320 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', overflow: 'hidden' }} className="auth-panel">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={56} />
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginTop: 32, lineHeight: 1.2 }}>Reset Password</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginTop: 16, lineHeight: 1.7, maxWidth: 320 }}>
            No worries — it happens to the best of us. Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/login" style={{ fontSize: 13, color: '#7B1A2D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>← Back to Sign In</Link>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(123,26,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: 32, color: '#7B1A2D' }}>✉</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>Check Your Email</h1>
              <p style={{ fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 1.7, maxWidth: 340, margin: '0 auto 32px' }}>
                We&apos;ve sent a password reset link to <strong>{email}</strong>. The link will expire in 1 hour.
              </p>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} style={{ color: '#7B1A2D', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>try again</button>.
              </p>
              <Link href="/login" style={{ color: '#7B1A2D', fontWeight: 600, fontSize: 15 }}>← Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1A1A2A', marginTop: 24, marginBottom: 8 }}>Forgot Password</h1>
              <p style={{ fontSize: 15, color: '#666', marginBottom: 36 }}>Enter the email address associated with your account.</p>

              {error && (
                <div style={{ padding: '14px 18px', borderRadius: 10, marginBottom: 24, background: 'rgba(123,26,45,0.06)', border: '1px solid rgba(123,26,45,0.15)', color: '#7B1A2D', fontSize: 14, lineHeight: 1.5 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Email Address</label>
                  <input type="email" required placeholder="you@example.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }} />
                </div>
                <button
                  type="submit" disabled={loading}
                  style={{ width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600, background: loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', marginTop: 8 }}
                  onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = '#9B2A3D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = loading ? 'rgba(123,26,45,0.5)' : '#7B1A2D'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}