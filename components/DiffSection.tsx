'use client';

import PhotoBanner from './PhotoBanner';
import ScrollReveal from './ScrollReveal';
import { BookIcon, GradCapIcon, TrophyIcon } from './Icons';

const items = [
  {
    title: 'Learn at Your Own Pace',
    desc: 'Flexible scheduling allows you to progress through material at a speed that suits your lifestyle and commitments.',
    icon: BookIcon,
    color: '#7B1A2D',
  },
  {
    title: 'Structured Flexibility',
    desc: 'Our programs combine rigorous academic structure with the freedom to customize your own learning path.',
    icon: GradCapIcon,
    color: '#7B1A2D',
  },
  {
    title: 'Best Practice Experience',
    desc: 'Learn from real-world case studies and industry practitioners who bring decades of expertise to the classroom.',
    icon: TrophyIcon,
    color: '#7B1A2D',
  },
];

export default function DiffSection() {
  return (
    <section id="diff">
      <PhotoBanner
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
        title="What Makes Us Different"
        subtitle="Our Approach"
        height={300}
      />
      <div style={{ padding: '80px 0', background: '#F8F8FA' }}>
        <div className="container">
          <div
            className="grid-3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}
          >
            {items.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
                <div
                  className="diff-card"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = item.color + '44';
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(0,0,0,0.05)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: item.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <item.icon size={26} color={item.color} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2A', marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}