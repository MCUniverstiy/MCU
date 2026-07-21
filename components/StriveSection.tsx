'use client';

import ScrollReveal from './ScrollReveal';
import SectionHeading from './SectionHeading';

const cards = [
  {
    title: 'Continuous Training',
    desc: 'Focus on upgrading wealth management and financial planning knowledge and skills.',
    img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
  },
  {
    title: 'On-going Improvement',
    desc: 'All courses are modified regularly to align to the trend and direction of the global economy.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    title: 'Implementation of Learning',
    desc: 'Emphasis is placed on the application of knowledge and realization of ideas.',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
  },
];

export default function StriveSection() {
  return (
    <section id="about" style={{ padding: '100px 0', background: '#fff' }}>
      <div className="container">
        <ScrollReveal>
          <SectionHeading subtitle="Our Commitment" title="What We Strive" />
        </ScrollReveal>

        <div
          className="grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}
        >
          {cards.map((card, i) => (
            <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
              <div className="strive-card">
                <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#e8e8ec' }}>
                  <img
                    src={card.img}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2A', marginBottom: 10 }}>{card.title}</h3>
                  <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}