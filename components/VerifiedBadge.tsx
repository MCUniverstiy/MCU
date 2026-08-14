'use client';

interface VerifiedBadgeProps {
  /** 'onLight' for white/light backgrounds, 'onDark' for maroon/dark backgrounds */
  variant?: 'onLight' | 'onDark';
  label?: string;
}

/**
 * Trust badge shown across the site: "Verified · Est. 2025".
 * Used in the navbar, about hero, and footer to signal a verified institution.
 */
export default function VerifiedBadge({
  variant = 'onLight',
  label = 'Verified · Est. 2025',
}: VerifiedBadgeProps) {
  const isDark = variant === 'onDark';
  const blue = '#1D9BF0';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px 4px 6px',
        borderRadius: 999,
        border: `1px solid ${isDark ? 'rgba(77,186,245,0.5)' : 'rgba(29,155,240,0.35)'}`,
        background: isDark ? 'rgba(29,155,240,0.16)' : 'rgba(29,155,240,0.10)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={blue}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M10.6 15.6l-3.2-3.2-1.4 1.4 4.6 4.6 8-8-1.4-1.4-6.6 6.6z" fill="#fff" />
      </svg>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isDark ? '#7CC4F5' : blue,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </span>
  );
}
