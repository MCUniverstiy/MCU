'use client';

import ScrollReveal from './ScrollReveal';
import SectionHeading from './SectionHeading';

const reasons = [
  'Rich experience in education and professional training',
  'Good and collaborative learning environment',
  'Practical financial planning skills',
  'Prompt response to global financial market',
  'Courses corresponding to current financial products',
];

export default function WhySection() {
  return (
    <section style={{ padding: '100px 0', background: '#F8F8FA' }}>
      <div className="container">
        <div
          className="grid-2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}
        >
          {/* Image */}
          <div>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 20, overflow: 'hidden', background: '#e8e8ec' }}>
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80"
                alt="Students learning"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <ScrollReveal>
              <SectionHeading subtitle="Advantages" title="Why You'll Choose Us" centered={false} />
            </ScrollReveal>

            <p style={{ fontSize: 17, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
              By choosing MCU Institute, you&apos;re not just enrolling in a program; you&apos;re joining a community dedicated to your financial success and lifelong learning.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reasons.map((reason, i) => (
                <ScrollReveal key={i} delay={i * 0.08} threshold={0.05}>
                  <div className="why-item">
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#E5A52E', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{reason}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}