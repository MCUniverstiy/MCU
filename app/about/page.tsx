'use client';

import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import AchievementsSection from '@/components/AchievementsSection';
import OrgChart from '@/components/OrgChart';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/SectionHeading';
import { TargetIcon, EyeIcon, LightbulbIcon } from '@/components/Icons';

const values = [
  { icon: TargetIcon, title: 'Mission', desc: 'To provide world-class financial education that empowers individuals and organizations to achieve sustainable wealth management success.' },
  { icon: EyeIcon, title: 'Vision', desc: 'To be the leading financial education institution in Asia, recognized globally for our innovative curriculum and outstanding graduate outcomes.' },
  { icon: LightbulbIcon, title: 'Innovation', desc: 'We continuously evolve our programs to reflect real-world market conditions, integrating emerging financial technologies and methodologies.' },
];

const team = [
  { name: 'Dr. Raymond Chan', role: 'Chief Executive Officer', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Ms. Sarah Lam', role: 'Academic Director', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'Mr. David Wong', role: 'Head of Curriculum', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
];

const timeline = [
  { year: '2010', event: 'MCU Institute founded in Wanchai, Hong Kong, with a focus on professional financial planning.' },
  { year: '2014', event: 'Launched the first CEO Wealth Management Program, attracting senior executives across Asia.' },
  { year: '2017', event: 'Expanded to include Family Office programs, becoming a pioneer in HK private wealth education.' },
  { year: '2020', event: 'Introduced hybrid online-classroom learning formats to serve a global student base.' },
  { year: '2023', event: 'Received 15+ international awards for excellence in financial professional education.' },
  { year: '2025', event: 'Celebrated 200+ completed courses and 98% student satisfaction, with 45+ certified faculty.' },
];

export default function AboutPage() {
  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="About MCU Institute"
          subtitle="Our Story"
          description="A pioneering institution dedicated to transforming financial education in Hong Kong and beyond since 2010."
          bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What We Stand For</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Our Mission &amp; Values</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
                <div style={{
                  padding: 36, borderRadius: 16, background: '#F8F8FA',
                  border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; el.style.background = '#fff'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.background = '#F8F8FA'; }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 14,
                    background: 'rgba(123,26,45,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <v.icon size={32} color="#7B1A2D" />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>{v.title}</h3>
                  <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <AchievementsSection />

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Milestones</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Our Journey</h2>
            </div>
          </ScrollReveal>
          <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, background: 'rgba(123,26,45,0.12)' }} />
            {timeline.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08} threshold={0.1}>
                <div style={{ display: 'flex', gap: 40, marginBottom: 40, position: 'relative', paddingLeft: 64 }}>
                  <div style={{
                    position: 'absolute', left: 12, top: 4, width: 24, height: 24, borderRadius: '50%',
                    background: '#7B1A2D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5A52E' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#E5A52E', letterSpacing: '0.05em' }}>{item.year}</span>
                    <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginTop: 4 }}>{item.event}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: '#F8F8FA' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Leadership</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Meet the Team</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, maxWidth: 860, margin: '0 auto' }}>
            {team.map((member, i) => (
              <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '4px solid rgba(123,26,45,0.15)', background: '#ddd' }}>
                    <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2A' }}>{member.name}</h3>
                  <p style={{ fontSize: 14, color: '#7B1A2D', fontWeight: 500, marginTop: 4 }}>{member.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <SectionHeading subtitle="Governance" title="Organization Structure" />
          </ScrollReveal>
          <ScrollReveal delay={0.1} threshold={0.05}>
            <div className="org-chart-scroll">
              <OrgChart />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </SiteLayout>
  );
}