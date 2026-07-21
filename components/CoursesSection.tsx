'use client';

import PhotoBanner from './PhotoBanner';
import ScrollReveal from './ScrollReveal';

const courses = [
  {
    title: 'Professional Financial Planning Program',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  },
  {
    title: 'CEO Wealth Management Program',
    img: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&q=80',
  },
  {
    title: 'Family Office Wealth Management Program',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
  },
  {
    title: 'Professional Family Office Consultant Program',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
  },
];

export default function CoursesSection() {
  return (
    <section id="courses">
      <PhotoBanner
        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80"
        title="Popular Courses"
        subtitle="Programs"
        height={280}
      />
      <div style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div
            className="grid-4"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}
          >
            {courses.map((course, i) => (
              <ScrollReveal key={i} delay={i * 0.08} threshold={0.1}>
                <div className="course-card">
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: '#e8e8ec', overflow: 'hidden' }}>
                      <img
                        src={course.img}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                    }} />
                  </div>
                  <div style={{ padding: '20px 20px 24px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2A', lineHeight: 1.4 }}>
                      {course.title}
                    </h3>
                    <span className="learn-more">Learn More →</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}