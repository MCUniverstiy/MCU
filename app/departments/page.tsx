'use client';

import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { ChartIcon, BriefcaseIcon, ColumnsIcon, LightbulbIcon } from '@/components/Icons';
import React from 'react';

const departments = [
  {
    icon: ChartIcon,
    color: '#7B1A2D',
    name: 'Financial Planning',
    tagline: 'Foundation of Wealth',
    desc: 'Our flagship department covers personal and corporate financial planning, budgeting, retirement strategy, and risk management. Students gain CFP-aligned competencies and real-world case analysis skills.',
    courses: ['Personal Financial Planning', 'Corporate Finance', 'Retirement Planning', 'Insurance & Risk Management'],
  },
  {
    icon: BriefcaseIcon,
    color: '#7B1A2D',
    name: 'Wealth Management',
    tagline: 'Growing & Protecting Assets',
    desc: 'Focused on high-net-worth client servicing, portfolio construction, alternative investments, and cross-border estate planning. Ideal for banking professionals and private client advisors.',
    courses: ['Portfolio Management', 'Alternative Investments', 'Cross-Border Tax Planning', 'Estate & Succession'],
  },
  {
    icon: ColumnsIcon,
    color: '#7B1A2D',
    name: 'Family Office',
    tagline: 'Multi-Generational Wealth',
    desc: 'Dedicated to the unique needs of family offices — governance structures, family constitution design, philanthropic strategy, and next-generation wealth education.',
    courses: ['Family Office Governance', 'Philanthropic Planning', 'Next-Gen Wealth', 'Family Constitution Design'],
  },
  {
    icon: LightbulbIcon,
    color: '#7B1A2D',
    name: 'Executive Leadership',
    tagline: 'For Senior Professionals',
    desc: 'Short-format executive programs for C-suite leaders — CEO financial literacy, board-level investment governance, and corporate treasury management designed around busy schedules.',
    courses: ['CEO Financial Literacy', 'Board Governance', 'Corporate Treasury', 'M&A for Executives'],
  },
];

export default function DepartmentsPage() {
  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="Our Departments"
          subtitle="Academic Faculties"
          description="Four specialized departments covering every dimension of financial education, from personal planning to family office governance."
          bgImage="https://mcuinstitute.com/wp-content/uploads/2025/04/pexels-armin-rimoldi-5553065-scaled.jpg"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Explore</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Academic Departments</h2>
              <p style={{ fontSize: 16, color: '#666', marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>Each department is led by industry practitioners and academics with deep domain expertise.</p>
            </div>
          </ScrollReveal>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {departments.map((dept, i) => (
              <ScrollReveal key={i} delay={i * 0.08} threshold={0.1}>
                <div style={{
                  borderRadius: 16, overflow: 'hidden', background: '#fff',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ height: 6, background: dept.color }} />
                  <div style={{ padding: 32 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 14,
                      background: dept.color + '12', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', marginBottom: 20,
                    }}>
                      <dept.icon size={28} color={dept.color} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: dept.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{dept.tagline}</p>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>{dept.name}</h3>
                    <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>{dept.desc}</p>
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Key Courses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {dept.courses.map((c, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#555' }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #7B1A2D, rgba(123,26,45,0.87))', textAlign: 'center' }}>
        <div className="container">
          <ScrollReveal>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Find Your Department</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
              Not sure which department is right for you? Our advisors will help you chart the best learning path.
            </p>
            <a href="/contact" className="btn-gold">Get in Touch</a>
          </ScrollReveal>
        </div>
      </section>
    </SiteLayout>
  );
}