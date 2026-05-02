import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface AnimatedCounterProps {
  /** Target numeric value the counter animates to. */
  value: number;
  /** Animation duration in ms. Default 1500. */
  duration?: number;
  /** Number of decimal places to render. Default 0. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts from 0 → value when scrolled into view. Skips animation entirely
 * when the user prefers reduced motion.
 */
export function AnimatedCounter({
  value,
  duration = 1500,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let started = false;
    let raf: number | null = null;

    const animate = () => {
      const start = performance.now();
      const from = 0;
      const to = value;

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutExpo(t);
        setDisplay(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [value, duration, reduce]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
