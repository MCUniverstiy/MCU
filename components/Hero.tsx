'use client';

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ken Burns background */}
      <div style={{ position: 'absolute', inset: 0, animation: 'kenburns 25s ease-in-out infinite alternate' }}>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80"
          alt="Education"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to left, rgba(60,10,20,0.94) 0%, rgba(90,18,32,0.8) 40%, rgba(123,26,45,0.45) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1280, margin: '0 auto',
        padding: '160px 40px 120px',
        width: '100%',
        display: 'flex', justifyContent: 'flex-end',
      }}>
        <div style={{ maxWidth: 660, textAlign: 'left', animation: 'fadeInUp 0.8s ease-out' }}>
          <h1
            className="hero-title"
            style={{
              fontSize: 76, fontWeight: 700, color: '#fff',
              lineHeight: 1.08, letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}
          >
            MCU Institute
          </h1>
          <p style={{
            fontSize: 28, color: '#E5A52E', marginTop: 16,
            fontWeight: 600, fontStyle: 'italic', lineHeight: 1.3,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
            className="hero-tagline"
          >
            Nurture Your Future
          </p>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.8)',
            marginTop: 20, lineHeight: 1.7, maxWidth: 520,
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          }}>
            Comprehensive wealth management education and professional financial planning programs for tomorrow&apos;s leaders.
          </p>
          <div style={{ marginTop: 36, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="about" className="btn-gold">Read More →</a>
            <a href="courses" className="btn-ghost">Explore Courses</a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%',
        zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        animation: 'float 2s ease-in-out infinite alternate',
      }}>
        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Scroll
        </span>
        <div style={{
          width: 1, height: 30,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
        }} />
      </div>

      {/* Bottom teal accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4, background: '#2EC4B6', zIndex: 3,
      }} />
    </section>
  );
}