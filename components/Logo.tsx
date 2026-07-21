'use client';

import Image from 'next/image';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 48, variant = 'dark' }: LogoProps) {
  // variant='dark' → used on white/light backgrounds (navbar)
  //   uses transparent PNG so the logo's own colors show through
  // variant='light' → used on dark backgrounds (footer)
  //   uses the full-color logo with name
  const height = Math.round(size * 1.0);
  const src = variant === 'light' ? '/logo-full.jpg' : '/logo.png';

  return (
    <Image
      src={src}
      alt="MCU Institute"
      width={size}
      height={height}
      priority
      style={{
        objectFit: 'contain',
        transition: 'all 0.3s',
      }}
    />
  );
}