interface SectionHeadingProps {
  subtitle: string;
  title: string;
  centered?: boolean;
}

export default function SectionHeading({ subtitle, title, centered = true }: SectionHeadingProps) {
  return (
    <div style={{ textAlign: centered ? 'center' : 'left', marginBottom: 56 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: centered ? 'center' : 'flex-start',
        marginBottom: 12,
      }}>
        <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#7B1A2D',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {subtitle}
        </span>
        {centered && <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />}
      </div>
      <h2
        className="section-heading"
        style={{
          fontSize: 38, fontWeight: 700, lineHeight: 1.2,
          letterSpacing: '-0.02em', color: '#1A1A2A',
        }}
      >
        {title}
      </h2>
    </div>
  );
}
