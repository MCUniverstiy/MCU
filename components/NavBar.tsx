'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Logo from './Logo';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Departments', href: '/departments' },
  {
    label: 'Courses',
    href: '/courses',
    children: [{ label: 'Course Information', href: '/courses' }],
  },
  { label: 'Partnership', href: '/partnership' },
  {
    label: 'Membership',
    href: '/membership',
    children: [{ label: 'Join Club', href: '/membership#join' }],
  },
  { label: 'Contact', href: '/contact' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth state listener
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User'
    );
  };

  const getInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map((n: string) => n[0]) 
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? 'rgba(255,255,255,0.98)'
          : '#fff',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(0,0,0,0.06)'
          : 'none',
        boxShadow: scrolled
          ? '0 4px 30px rgba(0,0,0,0.08)'
          : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ height: 4, background: '#2EC4B6' }} />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: scrolled ? '10px 40px' : '16px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0 }}>
          <Logo size={scrolled ? 42 : 50} variant="dark" />
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          className="nav-links"
        >
          {navItems.map((item) => (
            <div key={item.label} style={{ position: 'relative' }}>
              <Link
                href={item.href}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: isActive(item.href) ? '#7B1A2D' : '#333',
                  padding: '8px 0',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none',
                  position: 'relative',
                }}
                className="nav-link"
              >
                {item.label}
                {item.children && (
                  <span style={{ marginLeft: 4, fontSize: 11 }}></span>
                )}
              </Link>
              {item.children && (
                <div className="nav-dropdown">
                  {item.children.map((child) => (
                    <Link key={child.label} href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Auth Section */}
          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                href="/login"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#444',
                  padding: '8px 18px',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  background: '#7B1A2D',
                  padding: '9px 22px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                Join now
              </Link>
            </div>
          ) : (
            /* Logged In User */
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 8px 6px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    'rgba(0,0,0,0.04)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#222',
                      lineHeight: 1,
                    }}
                  >
                    {getUserDisplayName()}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#888',
                      lineHeight: 1,
                      marginTop: 1,
                    }}
                  >
                    Member
                  </div>
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #7B1A2D, #5a1320)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(123,26,45,0.2)',
                  }}
                >
                  {getInitials()}
                </div>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: '#fff',
                    borderRadius: 14,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    minWidth: 200,
                    padding: '8px 0',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 20px',
                      borderBottom: '1px solid #f1f1f1',
                    }}
                  >
                    <div style={{ fontSize: 13, color: '#666' }}>
                      Signed in as
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#222',
                        marginTop: 2,
                      }}
                    >
                      {user.email}
                    </div>
                  </div>

                  <Link
                    href="/membership"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      fontSize: 14,
                      color: '#333',
                      textDecoration: 'none',
                    }}
                  >
                    My Membership
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 20px',
                      fontSize: 14,
                      color: '#c53030',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Shop Button */}
          <Link
            href="/shop"
            style={{
              fontSize: 14,
              fontWeight: 600,
              background: '#111',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            Shop
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
          }}
          aria-label="Toggle menu"
        >
          <div style={{ width: 24, height: 2, background: '#333', margin: '5px 0' }} />
          <div style={{ width: 24, height: 2, background: '#333', margin: '5px 0' }} />
          <div style={{ width: 24, height: 2, background: '#333', margin: '5px 0' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid #eee',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 500,
                color: isActive(item.href) ? '#7B1A2D' : '#333',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}

          {!user ? (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                textAlign: 'left',
                padding: '12px 0',
                color: '#c53030',
                background: 'none',
                border: 'none',
                fontSize: 15,
              }}
            >
              Log out
            </button>
          )}

          <Link href="/shop" onClick={() => setMobileOpen(false)}>
            Shop
          </Link>
        </div>
      )}
    </nav>
  );
}
