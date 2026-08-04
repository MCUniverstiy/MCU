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

const defaultCategories = ['All', 'Financial Planning', 'Wealth Management', 'Family Office', 'Executive'];

type SortOption = 'recommended' | 'name-asc' | 'price-asc' | 'price-desc';

function deriveCategories(courses: CourseItem[]) {
  return ['All', ...new Set(courses.map((course) => course.cat).filter(Boolean))];
}

function compareCoursePrices(a: CourseItem, b: CourseItem, direction: 'asc' | 'desc') {
  if (a.price === undefined) return b.price === undefined ? 0 : 1;
  if (b.price === undefined) return -1;
  return direction === 'asc' ? a.price - b.price : b.price - a.price;
}

function inferCategory(value: string) {
  const text = value.toLowerCase();
  if (text.includes('financial') || text.includes('planning')) return 'Financial Planning';
  if (text.includes('wealth') || text.includes('management')) return 'Wealth Management';
  if (text.includes('family') || text.includes('office')) return 'Family Office';
  if (text.includes('executive') || text.includes('ceo')) return 'Executive';
  return 'Other';
}

const catColor: Record<string, string> = {
  'Financial Planning': '#2EC4B6',
  'Wealth Management': '#7B1A2D',
  'Family Office': '#E5A52E',
  'Executive': '#E5A52E',
};

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [loading, setLoading] = useState(true);

  // Enrollment / Stripe checkout state
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState<'success' | 'cancelled' | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [tierName, setTierName] = useState<string | null>(null);

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
            category,
            price,
            description,
            duration,
            level,
            format,
            image_url,
            instructors (
              firstname,
              lastname
            )
          `);

        if (!error) {
          const mapped: CourseItem[] = (data ?? []).map((c: Record<string, unknown>) => {
            const instructor = c.instructors as { firstname?: string; lastname?: string } | null;
            const instructorName = instructor ? `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim() : undefined;
            return {
              courseid: c.courseid as number,
              title: (c.coursename as string) || 'Untitled Course',
              cat: (c.category as string) || inferCategory((c.coursetype as string) || ''),
              desc: (c.description as string) || 'Professional development course.',
              duration: (c.duration as string) || '10 weeks',
              level: (c.level as string) || 'Professional',
              format: (c.format as string) || 'Hybrid',
              img: (c.image_url as string) || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
              price: typeof c.price === 'number' ? c.price : undefined,
              instructorName,
            };
          });
          setCoursesList(mapped);
        }
      } catch (err) {
        console.warn('Unable to load courses:', err);
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
          .select('membershiptiers(membname, tiers, discountrate)')
          .eq('id', user.id)
          .single();

        if (profile) {
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

  // Handle the redirect back from Stripe Checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('checkout');
    if (result !== 'success' && result !== 'cancelled') return;

    window.history.replaceState({}, '', '/courses');
    const noticeTimer = setTimeout(() => setCheckoutNotice(result), 0);

    if (result !== 'success') return () => clearTimeout(noticeTimer);

    // The webhook that activates the enrollment lands within moments of the
    // redirect — poll briefly so the "✓ Enrolled" badge appears on its own.
    const supabase = createClient();
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('courseid')
          .eq('user_id', user.id);
        if (enrollments) {
          setEnrolledCourseIds(enrollments.map((e: { courseid: number }) => e.courseid));
        }
      }
      if (attempts >= 5) clearInterval(timer);
    }, 2000);

    return () => {
      clearTimeout(noticeTimer);
      clearInterval(timer);
    };
  }, []);

  const getFinalPrice = (price?: number) =>
    price !== undefined ? Math.round(price * (1 - discountRate) * 100) / 100 : undefined;

  const handleOpenEnrollModal = async (course: CourseItem) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.assign('/login?redirect=/courses');
      return;
    }

    setSelectedCourse(course);
    setCheckoutError('');
    setIsModalOpen(true);
  };

  const handleStartCheckout = async () => {
    if (!selectedCourse?.courseid) return;

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'course', courseid: selectedCourse.courseid }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        // Hand over to Stripe's hosted checkout — enrollment is activated by
        // the webhook after the payment really clears.
        window.location.href = data.url;
        return;
      }

      if (res.ok && data.free) {
        // Free course: enrolled directly, no payment needed.
        setEnrolledCourseIds((prev) => [...prev, selectedCourse.courseid!]);
        setIsModalOpen(false);
        setCheckoutNotice('success');
        return;
      }

      setCheckoutError(
        data.error === 'already_enrolled'
          ? 'You are already enrolled in this course.'
          : data.error || 'Unable to start checkout. Please try again.',
      );
    } catch {
      setCheckoutError('Network error — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = loading ? defaultCategories : deriveCategories(coursesList);
  const filteredCourses = selectedCategory === 'All'
    ? coursesList
    : coursesList.filter((course) => course.cat === selectedCategory);
  const displayedCourses = [...filteredCourses];

  if (sortBy === 'name-asc') {
    displayedCourses.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  } else if (sortBy === 'price-asc') {
    displayedCourses.sort((a, b) => compareCoursePrices(a, b, 'asc'));
  } else if (sortBy === 'price-desc') {
    displayedCourses.sort((a, b) => compareCoursePrices(a, b, 'desc'));
  }

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
          {checkoutNotice && (
            <div style={{
              maxWidth: 640, margin: '0 auto 40px', padding: '16px 22px', borderRadius: 14,
              background: checkoutNotice === 'success' ? 'rgba(46,196,182,0.12)' : 'rgba(229,165,46,0.12)',
              border: `1px solid ${checkoutNotice === 'success' ? 'rgba(46,196,182,0.4)' : 'rgba(229,165,46,0.4)'}`,
              fontSize: 14, color: '#1A1A2A', lineHeight: 1.6,
            }}>
              {checkoutNotice === 'success'
                ? '✅ Payment received! Your enrollment is being activated — the “✓ Enrolled” badge will appear on your course within a few seconds. If this course runs on Google Classroom, an invitation email is on its way too — accept it to access your class materials.'
                : 'Checkout was cancelled — no payment was taken. You can enroll anytime.'}
            </div>
          )}
          <ScrollReveal>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#555' }}>
                Category
                <select
                  aria-label="Category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  style={{
                    padding: '10px 16px', borderRadius: 30, border: '1.5px solid rgba(0,0,0,0.15)',
                    background: '#fff', color: '#1A1A2A', cursor: 'pointer', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#555' }}>
                Sort by
                <select
                  aria-label="Sort by"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  style={{
                    padding: '10px 16px', borderRadius: 30, border: '1.5px solid rgba(0,0,0,0.15)',
                    background: '#fff', color: '#1A1A2A', cursor: 'pointer', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
                  }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              Loading courses from Supabase...
            </div>
          ) : displayedCourses.length === 0 ? (
            <ScrollReveal>
              <div style={{
                maxWidth: 760, margin: '0 auto', padding: '64px 24px', textAlign: 'center',
                background: '#F8F8FA', border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: 18,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">📚</div>
                <h2 style={{ fontSize: 25, fontWeight: 700, color: '#1A1A2A', marginBottom: 10 }}>
                  {coursesList.length === 0
                    ? 'No courses available right now'
                    : `No courses in "${selectedCategory}" yet`}
                </h2>
                <p style={{ maxWidth: 520, margin: '0 auto 24px', fontSize: 15, color: '#666', lineHeight: 1.7 }}>
                  {coursesList.length === 0
                    ? 'We’re preparing new programs. Please check back soon or contact us to discuss your learning goals.'
                    : 'We’re adding new programs regularly. Try another category or contact us for help finding the right course.'}
                </p>
                <a href="/contact" className="btn-gold">Contact Us</a>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid-3 equal-height-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, alignItems: 'stretch' }}>
              {displayedCourses.map((course, i) => (
                <ScrollReveal key={course.courseid || i} delay={i * 0.06} threshold={0.1} style={{ height: '100%' }}>
                  <div className="strive-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

      {/* STRIPE COURSE CHECKOUT MODAL */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'rgba(123,26,45,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B1A2D',
                fontWeight: 700, fontSize: 18,
              }}>
                🔒
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A' }}>Secure Checkout</h3>
                <p style={{ fontSize: 13, color: '#666' }}>Powered by Stripe · enrollment activates once payment clears</p>
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

            {checkoutError && (
              <div style={{
                fontSize: 13, color: '#8A1C1C', background: 'rgba(196,30,58,0.08)', padding: '12px 14px',
                borderRadius: 10, marginBottom: 16, border: '1px solid rgba(196,30,58,0.25)', lineHeight: 1.5,
              }}>
                {checkoutError}
              </div>
            )}

            <button
              onClick={handleStartCheckout}
              disabled={isProcessing}
              style={{
                width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600,
                background: isProcessing ? '#999' : '#7B1A2D', color: '#fff', border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {isProcessing
                ? 'Redirecting to Stripe…'
                : `Pay HK$${getFinalPrice(selectedCourse.price)?.toLocaleString() ?? ''} Securely →`}
            </button>

            <div style={{
              fontSize: 12, color: '#888', background: 'rgba(46,196,182,0.08)', padding: '10px 14px',
              borderRadius: 8, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>🛡️</span>
              <span>You&apos;ll be handed over to <strong>Stripe Checkout</strong> — any tax is calculated from your billing address, and your card details never touch our servers.</span>
            </div>
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