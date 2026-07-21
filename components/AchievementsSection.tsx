'use client';

import AnimatedCounter from './AnimatedCounter';
import ScrollReveal from './ScrollReveal';

const stats = [
  { value: 15, suffix: '+', label: 'International Rewards' },
  { value: 200, suffix: '+', label: 'Courses Completed' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { value: 45, suffix: '+', label: 'Certified Teachers' },
];

export default function AchievementsSection() {
  return (
    <section style={{
      padding: '80px 0',
      background: 'linear-gradient(135deg, #7B1A2D, rgba(123,26,45,0.87))',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Dot pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="achievements-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, textAlign: 'center' }}
        >
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#E5A52E', lineHeight: 1 }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 8, fontWeight: 500 }}>
                {stat.label}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
