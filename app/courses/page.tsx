'use client';

import { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { createClient } from '@/lib/supabase/client';

interface CourseItem {
  courseid?: number;
  cat: string;
  img: string;
  title: string;
  level: string;
  duration: string;
  format: string;
  desc: string;
  price?: number;
  instructorName?: string;
}

const fallbackCourses: CourseItem[] = [
  {
    cat: 'Financial Planning',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    title: 'Professional Financial Planning Program',
    level: 'Foundation – Advanced',
    duration: '12 weeks',
    format: 'Hybrid',
    desc: 'A comprehensive curriculum covering all aspects of personal and corporate financial planning, aligned with CFP global standards.',
  },
  {
    cat: 'Wealth Management',
    img: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&q=80',
    title: 'CEO Wealth Management Program',
    level: 'Executive',
    duration: '8 weeks',
    format: 'Classroom',
    desc: 'Tailored for CEOs and senior executives who need a strategic perspective on personal and corporate wealth preservation.',
  },
  {
    cat: 'Family Office',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    title: 'Family Office Wealth Management Program',
    level: 'Intermediate – Advanced',
    duration: '16 weeks',
    format: 'Hybrid',
    desc: 'Deep-dive into family office structures, governance models, investment policy statements, and succession planning.',
  },
  {
    cat: 'Family Office',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    title: 'Professional Family Office Consultant Program',
    level: 'Advanced',
    duration: '20 weeks',
    format: 'Online',
    desc: 'For professional advisors serving family offices — covers legal, tax, investment, and relationship management complexities.',
  },
];

const categories = ['All', 'Financial Planning', 'Wealth Management', 'Family Office', 'Executive'];

const catColor: Record<string, string> = {
  'Financial Planning': '#2EC4B6',
  'Wealth Management': '#7B1A2D',
  'Family Office': '#E5A52E',
  'Executive': '#E5A52E',
};

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<CourseItem[]>(fallbackCourses);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('courses')
          .select(`
            courseid,
            coursename,
            coursetype,
            price,
            description,
            instructors (
              firstname,
              lastname
            )
          `);

        if (!error && data && data.length > 0) {
          const mapped: CourseItem[] = data.map((c: Record<string, unknown>) => {
            const instructor = c.instructors as { firstname?: string; lastname?: string } | null;
            const instructorName = instructor ? `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim() : undefined;
            return {
              courseid: c.courseid as number,
              title: (c.coursename as string) || 'Untitled Course',
              cat: (c.coursetype as string) || 'General',
              desc: (c.description as string) || 'Professional development course.',
              duration: '10 weeks',
              level: 'Professional',
              format: 'Hybrid',
              img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
              price: c.price as number,
              instructorName,
            };
          });
          setCoursesList(mapped);
        }
      } catch (err) {
        console.warn('Using default course list:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const filteredCourses = selectedCategory === 'All'
    ? coursesList
    : coursesList.filter((c) => c.cat === selectedCategory);

  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="All Courses & Programs"
          subtitle="Programs"
          description="From foundation certificates to executive masterclasses — find the program that matches your career stage and goals."
          bgImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
              {categories.map((cat) => (
                <span
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    background: selectedCategory === cat ? '#7B1A2D' : 'transparent',
                    color: selectedCategory === cat ? '#fff' : '#666',
                    border: `1.5px solid ${selectedCategory === cat ? '#7B1A2D' : 'rgba(0,0,0,0.12)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              Loading courses from Supabase...
            </div>
          ) : (
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
              {filteredCourses.map((course, i) => (
                <ScrollReveal key={course.courseid || i} delay={i * 0.06} threshold={0.1}>
                  <div className="strive-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '100%', aspectRatio: '16/9', background: '#e8e8ec', overflow: 'hidden' }}>
                        <img
                          src={course.img}
                          alt={course.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ position: 'absolute', top: 16, left: 16 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#fff', padding: '4px 12px',
                          borderRadius: 20, background: catColor[course.cat] || '#7B1A2D',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {course.cat}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '24px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2A', lineHeight: 1.4, marginBottom: 10 }}>{course.title}</h3>
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, flex: 1 }}>{course.desc}</p>
                      
                      {course.instructorName && (
                        <div style={{ fontSize: 12, color: '#7B1A2D', fontWeight: 600, marginTop: 8 }}>
                          Instructor: {course.instructorName}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2A', marginTop: 2 }}>{course.duration}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2A', marginTop: 2 }}>{course.format}</div>
                        </div>
                        {course.price !== undefined && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', marginTop: 2 }}>
                              {course.price === 0 ? 'Free' : `HK$${course.price}`}
                            </div>
                          </div>
                        )}
                      </div>
                      <a
                        href="/contact"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20,
                          fontSize: 13, fontWeight: 600, color: '#E5A52E', transition: 'gap 0.2s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.gap = '10px'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.gap = '6px'; }}
                      >
                        Enquire Now →
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#F8F8FA' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Custom Programs</p>
                <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em', marginBottom: 16 }}>Need a Tailored Program?</h2>
                <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7 }}>
                  We design bespoke corporate training programs for financial institutions, wealth management firms, and family offices across Asia.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <a href="/contact" className="btn-gold">Enquire About Corporate Training</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </SiteLayout>
  );
}
