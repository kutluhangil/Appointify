import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface GradientMeshProps {
  className?: string;
  /** Overall opacity multiplier of the mesh. Default 0.4. */
  opacity?: number;
}

interface Blob {
  className: string;
  color: string;
  /** Animated translate range in % of own size. */
  ax: [number, number];
  ay: [number, number];
  duration: number;
}

const blobs: Blob[] = [
  {
    className: "top-[-15%] left-[-10%] h-[55vw] w-[55vw]",
    // deep purple
    color: "rgba(42, 26, 74, 0.9)",
    ax: [-6, 6],
    ay: [-4, 8],
    duration: 22,
  },
  {
    className: "bottom-[-20%] right-[-10%] h-[60vw] w-[60vw]",
    // deep blue
    color: "rgba(15, 31, 61, 0.9)",
    ax: [8, -6],
    ay: [4, -6],
    duration: 28,
  },
  {
    className: "top-[20%] right-[10%] h-[40vw] w-[40vw]",
    // charcoal warm
    color: "rgba(26, 26, 26, 0.85)",
    ax: [-4, 4],
    ay: [6, -4],
    duration: 26,
  },
  {
    className: "bottom-[10%] left-[15%] h-[35vw] w-[35vw]",
    // muted indigo accent
    color: "rgba(30, 20, 55, 0.7)",
    ax: [5, -5],
    ay: [-5, 5],
    duration: 30,
  },
];

/**
 * Animated multi-blob gradient backdrop for hero sections. The blobs slowly
 * drift via Framer Motion. Respects `prefers-reduced-motion`.
 */
export function GradientMesh({ className, opacity = 0.4 }: GradientMeshProps) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ opacity }}
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full", b.className)}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, transparent 65%)`,
            filter: "blur(80px)",
            willChange: "transform",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [`${b.ax[0]}%`, `${b.ax[1]}%`, `${b.ax[0]}%`],
                  y: [`${b.ay[0]}%`, `${b.ay[1]}%`, `${b.ay[0]}%`],
                }
          }
          transition={{
            duration: b.duration,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

export default GradientMesh;
