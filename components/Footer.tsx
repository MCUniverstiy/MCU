'use client';

import Link from 'next/link';
import Logo from './Logo';
import { InstagramIcon, FacebookIcon, LinkedInIcon } from './Icons';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Departments', href: '/departments' },
  { label: 'Courses', href: '/courses' },
  { label: 'Partnership', href: '/partnership' },
];
const programs = [
  { label: 'Membership', href: '/membership' },
  { label: 'Join Club', href: '/membership#join' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
  { label: 'Shop', href: '/shop' },
];
const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/mcuinstitute', icon: InstagramIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/mcuinstitute', icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/mcu-institute/', icon: LinkedInIcon },
];

export default function Footer() {
  return (
    <footer id="contact" style={{ background: '#1A1A2A', padding: '64px 0 0' }}>
      <div className="container">
        <div
          className="footer-grid"
          style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48 }}
        >
          <div>
            <Logo size={200} variant="light" />
            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7, marginTop: 16, maxWidth: 280,
            }}>
              Nurturing the future of financial planning through comprehensive education and professional development.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: 14, fontWeight: 600, color: '#fff',
              marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Quick Links
            </h4>
            {quickLinks.map((l) => (
              <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{
              fontSize: 14, fontWeight: 600, color: '#fff',
              marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Programs
            </h4>
            {programs.map((l) => (
              <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{
              fontSize: 14, fontWeight: 600, color: '#fff',
              marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Contact
            </h4>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
              25/F, 88 Lockhart Road,<br />Wanchai, Hong Kong
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
              +(852) 2383 3232
            </p>
            <a
              href="mailto:info@mcuinstitute.com"
              style={{ fontSize: 14, color: '#E5A52E', marginTop: 4, display: 'block' }}
            >
              info@mcuinstitute.com
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            &copy; 2026 MCU Institute Limited. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service'].map((l) => (
              <span
                key={l}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 4, background: '#2EC4B6' }} />
      </div>
    </footer>
  );
}