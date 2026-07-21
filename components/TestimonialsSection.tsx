'use client';

import ScrollReveal from './ScrollReveal';
import SectionHeading from './SectionHeading';

const testimonials = [
  {
    name: 'Fiona',
    location: 'London',
    quote: 'Love the flexibility',
    body: 'Happy with the flexibility of the lesson as we can choose online or classroom learning.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  },
  {
    name: 'John',
    location: 'Hong Kong',
    quote: 'Excellent Course',
    body: 'The courses are brilliant! I really learn some practical knowledge to help me solve real-life problems.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    name: 'Carol',
    location: 'New Zealand',
    quote: 'Fantastic quality',
    body: 'I really appreciate the quality of the learning materials and the teaching team.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
];

export default function TestimonialsSection() {
  return (
    <section style={{ padding: '100px 0', background: '#fff' }}>
      <div className="container">
        <ScrollReveal>
          <SectionHeading subtitle="Testimonials" title="What People Are Saying" />
        </ScrollReveal>

        <div
          className="grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}
        >
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1} threshold={0.1}>
              <div className="testimonial-card">
                <div style={{ fontSize: 14, color: '#E5A52E', letterSpacing: 2, marginBottom: 16 }}>★★★★★</div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2A', marginBottom: 8 }}>
                  &ldquo;{t.quote}&rdquo;
                </h4>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 20 }}>{t.body}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0, background: '#ddd',
                  }}>
                    <img
                      src={t.img}
                      alt={t.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2A' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}