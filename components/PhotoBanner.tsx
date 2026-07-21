'use client';

import ScrollReveal from './ScrollReveal';

interface PhotoBannerProps {
  src: string;
  title: string;
  subtitle?: string;
  height?: number;
}

export default function PhotoBanner({ src, title, subtitle, height = 340 }: PhotoBannerProps) {
  return (
    <ScrollReveal threshold={0.1}>
      <div style={{ position: 'relative', height, overflow: 'hidden' }}>
        {/* Ken Burns image */}
        <div style={{ position: 'absolute', inset: 0, animation: 'kenburns 20s ease-in-out infinite alternate' }}>
          <img
            src={src}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(123,26,45,0.85) 0%, rgba(123,26,45,0.6) 50%, rgba(0,0,0,0.3) 100%)',
        }} />
        {/* Text */}
        <div style={{
          position: 'relative', zIndex: 1, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 1200, margin: '0 auto', padding: '0 40px',
        }}>
          {subtitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 2, background: '#E5A52E' }} />
              <span style={{
                fontSize: 13, fontWeight: 600, color: '#E5A52E',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {subtitle}
              </span>
            </div>
          )}
          <h2
            className="section-heading"
            style={{
              fontSize: 42, fontWeight: 700, color: '#fff',
              lineHeight: 1.2, letterSpacing: '-0.02em', maxWidth: 600,
            }}
          >
            {title}
          </h2>
        </div>
      </div>
    </ScrollReveal>
  );
}
