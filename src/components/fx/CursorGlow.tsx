import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface CursorGlowProps {
  /** Diameter of the radial gradient in px. */
  size?: number;
  /** Center color of the radial gradient. */
  color?: string;
  className?: string;
}

/**
 * A soft, cursor-following radial glow. Hidden on touch devices and on screens
 * narrower than 768px. Respects `prefers-reduced-motion`.
 *
 * Use sparingly — best on landing/marketing pages, not inside dashboards.
 */
export function CursorGlow({
  size = 600,
  color = "rgba(255,255,255,0.04)",
  className,
}: CursorGlowProps) {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef<number | null>(null);

  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  // Smooth the position with a spring for a liquid feel.
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (min-width: 768px)");
    const update = () => setEnabled(mq.matches && !reduceMotion);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
        rafRef.current = null;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-[55] mix-blend-screen",
        className,
      )}
      style={{
        width: size,
        height: size,
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        background: `radial-gradient(circle at center, ${color} 0%, transparent 60%)`,
        willChange: "transform",
      }}
    />
  );
}

export default CursorGlow;
