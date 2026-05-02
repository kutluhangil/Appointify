import { forwardRef, type ElementType, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AsProp<T extends ElementType> = { as?: T };

type GlassCardOwnProps = {
  children?: ReactNode;
  className?: string;
  /** Lift + inner glow on hover (cursor-pointer is the caller's job). */
  interactive?: boolean;
};

export type GlassCardProps<T extends ElementType = "div"> = AsProp<T> &
  GlassCardOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof GlassCardOwnProps | "as">;

/**
 * Glassmorphism wrapper used for premium surfaces (pricing tiles, hero
 * stat cards, modals). Polymorphic via the `as` prop.
 */
function GlassCardInner<T extends ElementType = "div">(
  { as, className, interactive, children, ...rest }: GlassCardProps<T>,
  ref: React.Ref<Element>,
) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      ref={ref}
      className={cn(
        "relative rounded-xl backdrop-blur-xl",
        "bg-white/[0.03] border border-white/[0.06]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        "transition-[box-shadow,border-color,transform] duration-300 ease-out",
        interactive &&
          "hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-12px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export const GlassCard = forwardRef(GlassCardInner) as <T extends ElementType = "div">(
  props: GlassCardProps<T> & { ref?: React.Ref<Element> },
) => JSX.Element;

export default GlassCard;
