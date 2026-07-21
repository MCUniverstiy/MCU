interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  bgImage?: string;
}

export default function PageHero({
  title,
  subtitle,
  description,
  bgImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80',
}: PageHeroProps) {
  return (
    <section style={{ position: 'relative', height: 400, overflow: 'hidden', marginTop: 0 }}>
      {/* Ken Burns bg */}
      <div style={{ position: 'absolute', inset: 0, animation: 'kenburns 20s ease-in-out infinite alternate' }}>
        <img
          src={bgImage}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(60,10,20,0.92) 0%, rgba(123,26,45,0.75) 50%, rgba(123,26,45,0.4) 100%)',
      }} />
      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        maxWidth: 1200, margin: '0 auto', padding: '0 40px 56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 32, height: 2, background: '#E5A52E' }} />
          <span style={{
            fontSize: 13, fontWeight: 600, color: '#E5A52E',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {subtitle}
          </span>
        </div>
        <h1 style={{
          fontSize: 52, fontWeight: 700, color: '#fff',
          lineHeight: 1.1, letterSpacing: '-0.02em',
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          maxWidth: 700,
        }}
          className="hero-title"
        >
          {title}
        </h1>
        {description && (
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.75)',
            marginTop: 16, lineHeight: 1.7, maxWidth: 560,
          }}>
            {description}
          </p>
        )}
      </div>
      {/* Teal bottom accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#2EC4B6', zIndex: 3 }} />
    </section>
  );
}