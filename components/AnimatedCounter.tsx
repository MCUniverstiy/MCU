'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

export default function AnimatedCounter({ end, suffix = '', duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const st = performance.now();
          const anim = (now: number) => {
            const prog = Math.min((now - st) / duration, 1);
            setCount(Math.round((1 - Math.pow(1 - prog, 3)) * end));
            if (prog < 1) requestAnimationFrame(anim);
          };
          requestAnimationFrame(anim);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}
