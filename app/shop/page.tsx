'use client';

import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { TruckIcon, LockIcon, ReturnIcon, ChatIcon } from '@/components/Icons';

const products = [
  {
    title: 'CFP Exam Preparation Bundle',
    cat: 'Study Pack',
    price: 'HK$1,280',
    img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
    badge: 'Bestseller',
    badgeColor: '#E5A52E',
    desc: 'Comprehensive study pack including textbook, practice exams, flash cards, and 6-month online portal access.',
  },
  {
    title: 'Wealth Management Handbook',
    cat: 'Textbook',
    price: 'HK$480',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    desc: 'The core reference text used across our Wealth Management programs, authored by MCU faculty.',
  },
  {
    title: 'Family Office Blueprint',
    cat: 'Digital Guide',
    price: 'HK$320',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    badge: 'New',
    badgeColor: '#2EC4B6',
    desc: 'A practical digital guide on structuring, governing, and operating a single-family office in Asia.',
  },
  {
    title: 'Online Course Access — 1 Year',
    cat: 'Subscription',
    price: 'HK$3,600',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80',
    badge: 'Most Popular',
    badgeColor: '#7B1A2D',
    desc: 'Unlimited access to all self-paced online courses for 12 months. Includes certificates of completion.',
  },
  {
    title: 'Executive Finance Masterclass',
    cat: 'Online Course',
    price: 'HK$2,200',
    img: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&q=80',
    desc: 'On-demand video masterclass for executives covering corporate finance, M&A basics, and treasury management.',
  },
  {
    title: 'Financial Planning Case Studies',
    cat: 'Case Book',
    price: 'HK$240',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    desc: '50 real-world financial planning case studies used in MCU classroom sessions — ideal for self-study.',
  },
  {
    title: 'Certificate Frame & Engraving',
    cat: 'Accessory',
    price: 'HK$380',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    desc: 'Premium A4 certificate frame with MCU branding and optional name engraving on a brass plate.',
  },
];

const shopInfo = [
  { icon: TruckIcon, title: 'Free Delivery', desc: 'On all physical orders over HK$500' },
  { icon: LockIcon, title: 'Secure Checkout', desc: 'SSL encrypted payment processing' },
  { icon: ReturnIcon, title: '14-Day Returns', desc: 'For unopened physical products' },
  { icon: ChatIcon, title: 'Support', desc: 'Mon\u2013Fri 9am\u20136pm HKT' },
];

export default function ShopPage() {
  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="MCU Institute Shop"
          subtitle="Resources & Materials"
          description="Study materials, course access packages, and professional resources to support your learning journey."
          bgImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80"
        />
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#999', marginRight: 4 }}>Filter:</span>
            {['All', 'Study Pack', 'Textbook', 'Digital Guide', 'Online Course', 'Subscription', 'Accessory'].map((cat) => (
              <span
                key={cat}
                style={{
                  padding: '6px 16px', borderRadius: 30, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: cat === 'All' ? '#7B1A2D' : 'transparent',
                  color: cat === 'All' ? '#fff' : '#666',
                  border: `1.5px solid ${cat === 'All' ? '#7B1A2D' : 'rgba(0,0,0,0.1)'}`,
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section style={{ padding: '80px 0', background: '#F8F8FA' }}>
        <div className="container">
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28 }}>
            {products.map((product, i) => (
              <ScrollReveal key={i} delay={i * 0.05} threshold={0.1}>
                <div style={{
                  borderRadius: 16, background: '#fff', overflow: 'hidden',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06)', transition: 'all 0.3s',
                  display: 'flex', flexDirection: 'column',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: '#e8e8ec', overflow: 'hidden' }}>
                      <img
                        src={product.img}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
                    {product.badge && (
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: product.badgeColor, color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      {product.cat}
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2A', lineHeight: 1.4, marginBottom: 8, flex: 1 }}>
                      {product.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{product.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A' }}>{product.price}</span>
                      <button
                        style={{
                          padding: '8px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                          background: '#E5A52E', color: '#fff', border: 'none', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(229,165,46,0.35)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }} className="achievements-grid">
            {shopInfo.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08} threshold={0.1}>
                <div style={{ marginBottom: 12 }}><item.icon size={32} color="#7B1A2D" /></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2A', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{item.desc}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}