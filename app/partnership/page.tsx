'use client';

import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { BankIcon, BuildingIcon, GlobeIcon, GradCapIcon, UsersIcon, HandshakeIcon } from '@/components/Icons';
import React from 'react';

const partnerTypes = [
  {
    icon: BankIcon,
    title: 'Financial Institutions',
    desc: 'Banks, securities firms, and insurance companies partner with us to upskill their advisors and relationship managers with cutting-edge financial planning credentials.',
  },
  {
    icon: BuildingIcon,
    title: 'Corporate Employers',
    desc: 'HR departments and L&D teams use our programs as part of employee benefits packages, succession planning, and executive development tracks.',
  },
  {
    icon: GlobeIcon,
    title: 'Professional Associations',
    desc: 'Industry bodies and professional associations co-brand continuing education programs and CPD point schemes with our academic content.',
  },
  {
    icon: GradCapIcon,
    title: 'Academic Institutions',
    desc: 'Universities and polytechnics collaborate with us on credit recognition, dual-certification programs, and joint curriculum development.',
  },
  {
    icon: UsersIcon,
    title: 'Family Offices',
    desc: 'Single and multi-family offices engage us for proprietary education programs to prepare the next generation of principal family members.',
  },
  {
    icon: HandshakeIcon,
    title: 'Referral Partners',
    desc: 'Financial advisors, wealth managers, and independent professionals refer clients and earn commissions or CPD recognition for qualified referrals.',
  },
];

const benefits = [
  'Co-branded certificate programs',
  'Discounted group enrollment rates',
  'Priority scheduling and dedicated cohorts',
  'Joint marketing and event sponsorship',
  'CPD point accreditation support',
  'Access to faculty for speaking engagements',
  'Alumni network introductions',
  'Annual impact reporting',
];

export default function PartnershipPage() {
  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="Partnership Opportunities"
          subtitle="Collaborate With Us"
          description="Join a growing network of institutions that trust MCU Institute to elevate the financial literacy of their people."
          bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Who We Work With</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Partnership Models</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {partnerTypes.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.08} threshold={0.1}>
                <div style={{
                  padding: 32, borderRadius: 16, background: '#F8F8FA',
                  border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.background = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#F8F8FA'; }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: 'rgba(123,26,45,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <p.icon size={26} color="#7B1A2D" />
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 600, color: '#1A1A2A', marginBottom: 10 }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: '#F8F8FA' }}>
        <div className="container">
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 20, overflow: 'hidden', background: '#e8e8ec' }}>
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
                  alt="Partnership"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
            <div>
              <ScrollReveal>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Benefits</span>
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>What Partners Receive</h2>
                </div>
              </ScrollReveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {benefits.map((b, i) => (
                  <ScrollReveal key={i} delay={i * 0.06} threshold={0.05}>
                    <div className="why-item">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5A52E', flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{b}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #7B1A2D, rgba(123,26,45,0.87))', textAlign: 'center' }}>
        <div className="container">
          <ScrollReveal>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Become a Partner</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 480, margin: '0 auto 32px' }}>
              Reach out to our partnerships team to explore how we can create mutual value together.
            </p>
            <a href="/contact" className="btn-gold">Start the Conversation</a>
          </ScrollReveal>
        </div>
      </section>
    </SiteLayout>
  );
}