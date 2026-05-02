import { cn } from "@/lib/utils";

export interface GrainOverlayProps {
  /** Opacity 0-1. Default 0.025 — barely perceptible. */
  intensity?: number;
  className?: string;
}

/**
 * Fixed-position SVG-noise overlay used to add film-grain texture across the
 * viewport. Renders above content but below modals/popovers.
 *
 * Heavy effect — only enabled on `(hover: hover)` + `min-width: 768px` to
 * keep mobile rendering crisp.
 */
export function GrainOverlay({ intensity = 0.025, className }: GrainOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[60] hidden md:[@media(hover:hover)]:block",
        "grain",
        className,
      )}
      style={{ opacity: intensity }}
    />
  );
}

export default GrainOverlay;
