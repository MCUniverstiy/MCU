'use client';

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  style = {},
  delay = 0,
  threshold = 0.15,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('visible');
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
