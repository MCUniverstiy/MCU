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

  // Enrollment / mock payment state
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [tierName, setTierName] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Student Account');

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

  // Load current user's membership discount + already-enrolled courses
  useEffect(() => {
    async function loadUserContext() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, membershiptiers(membname, tiers, discountrate)')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.first_name || profile.last_name) {
            setCardName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
          }
          const tierObj = profile.membershiptiers as unknown as { membname?: string; tiers?: string; discountrate?: number } | null;
          if (tierObj) {
            setDiscountRate(Number(tierObj.discountrate) || 0);
            setTierName(tierObj.membname || tierObj.tiers || null);
          }
        }

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('courseid')
          .eq('user_id', user.id);

        if (enrollments) {
          setEnrolledCourseIds(enrollments.map((e: { courseid: number }) => e.courseid));
        }
      } catch {
        // Not logged in or tables missing — ignore
      }
    }

    loadUserContext();
  }, []);

  const getFinalPrice = (price?: number) =>
    price !== undefined ? Math.round(price * (1 - discountRate) * 100) / 100 : undefined;

  const handleOpenEnrollModal = async (course: CourseItem) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login?redirect=/courses';
      return;
    }

    setSelectedCourse(course);
    setPaymentSuccess(false);
    setEnrollmentId(null);
    setIsModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.courseid) return;

    setIsProcessing(true);

    try {
      // Simulate real bank processing delay
      await new Promise((res) => setTimeout(res, 1500));

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Insert enrollment record linked by courseid + user UUID
      const { data: inserted, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          courseid: selectedCourse.courseid,
          paymentstatus: 'Paid',
        })
        .select('enrollmentid')
        .single();

      if (error) {
        throw error;
      }

      if (inserted?.enrollmentid) setEnrollmentId(inserted.enrollmentid);
      setEnrolledCourseIds((prev) => [...prev, selectedCourse.courseid!]);
      setPaymentSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Payment execution failed: ' + msg);
    } finally {
      setIsProcessing(false);
    }
  };

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
                      {course.courseid && enrolledCourseIds.includes(course.courseid) ? (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20,
                          fontSize: 13, fontWeight: 700, color: '#2EC4B6',
                        }}>
                          ✓ Enrolled
                        </div>
                      ) : course.courseid ? (
                        <button
                          onClick={() => handleOpenEnrollModal(course)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20,
                            fontSize: 13, fontWeight: 600, color: '#E5A52E', transition: 'gap 0.2s',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.gap = '10px'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.gap = '6px'; }}
                        >
                          Enroll Now →
                        </button>
                      ) : (
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
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MOCK COURSE PAYMENT MODAL */}
      {isModalOpen && selectedCourse && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
            padding: 36, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative', animation: 'fadeIn 0.2s ease-out',
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
                fontSize: 22, color: '#999', cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,196,182,0.15)',
                  color: '#2EC4B6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, margin: '0 auto 20px',
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2A', marginBottom: 10 }}>
                  Enrollment Successful!
                </h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
                  You are now enrolled in <strong>{selectedCourse.title}</strong>.
                </p>

                <div style={{
                  background: '#F8F8FA', borderRadius: 12, padding: '16px 20px', textAlign: 'left',
                  fontSize: 13, color: '#444', marginBottom: 28, border: '1px solid #EEE'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Enrollment ID:</span>
                    <strong>#{enrollmentId ?? '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Course ID:</span>
                    <strong>#{selectedCourse.courseid}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Payment Status:</span>
                    <strong style={{ color: '#2EC4B6' }}>Paid — saved to `enrollments`</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Amount Paid:</span>
                    <strong>
                      HK${getFinalPrice(selectedCourse.price)?.toLocaleString()}
                      {discountRate > 0 && (
                        <span style={{ color: '#2EC4B6' }}> ({(discountRate * 100).toFixed(0)}% off)</span>
                      )}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 30, background: '#7B1A2D',
                    color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                  }}
                >
                  Continue Browsing Courses
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'rgba(123,26,45,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B1A2D',
                    fontWeight: 700, fontSize: 18,
                  }}>
                    💳
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A' }}>Course Checkout</h3>
                    <p style={{ fontSize: 13, color: '#666' }}>Enrollment saved to Supabase `enrollments`</p>
                  </div>
                </div>

                <div style={{
                  background: '#F8F8FA', borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #EEE',
                }}>
                  <div style={{ paddingRight: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>SELECTED COURSE</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2A', marginTop: 2 }}>
                      {selectedCourse.title}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {discountRate > 0 && selectedCourse.price !== undefined && (
                      <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
                        HK${selectedCourse.price.toLocaleString()}
                      </div>
                    )}
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#7B1A2D' }}>
                      HK${getFinalPrice(selectedCourse.price)?.toLocaleString()}
                    </div>
                    {discountRate > 0 && (
                      <div style={{ fontSize: 11, color: '#2EC4B6', fontWeight: 600 }}>
                        {tierName} Member −{(discountRate * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Cardholder Name</label>
                    <input
                      type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                        border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Card Number (Mock Test Card)</label>
                    <input
                      type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                        border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Expiry Date</label>
                      <input
                        type="text" required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                          border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>CVC</label>
                      <input
                        type="text" required value={cardCvc} onChange={(e) => setCardCvc(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                          border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    fontSize: 12, color: '#888', background: 'rgba(229,165,46,0.1)', padding: '10px 14px',
                    borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>💡</span>
                    <span>This is a <strong>mock payment sandbox</strong>. No real credit card will be charged.</span>
                  </div>

                  <button
                    type="submit" disabled={isProcessing}
                    style={{
                      width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600,
                      background: isProcessing ? '#999' : '#7B1A2D', color: '#fff', border: 'none',
                      cursor: isProcessing ? 'not-allowed' : 'pointer', marginTop: 12, transition: 'all 0.2s',
                    }}
                  >
                    {isProcessing
                      ? 'Processing Payment & Enrolling...'
                      : `Pay HK$${getFinalPrice(selectedCourse.price)?.toLocaleString() ?? ''} & Enroll`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

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