/**
 * Appointify — Framer Motion presets
 *
 * Centralized motion vocabulary so animations stay consistent across pages.
 * All durations are tuned for "premium minimalist" feel:
 *  - Micro interactions: 150-200ms
 *  - UI surface transitions: 250-400ms
 *  - Hero / page reveals: 500-800ms
 *
 * Easing reference:
 *  - [0.22, 1, 0.36, 1]   → easeOutQuint  (default for entries)
 *  - [0.4, 0, 0.2, 1]     → easeInOut    (state changes)
 *  - [0.16, 1, 0.3, 1]    → easeOutExpo  (hero reveals)
 */

import type { Variants, Transition } from "framer-motion";

// ---------- shared easing tokens ------------------------------------------
export const easing = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
};

// ---------- transitions ----------------------------------------------------
const baseTransition: Transition = {
  duration: 0.4,
  ease: easing.out,
};

// ---------- viewport for scroll triggers -----------------------------------
export const viewport = {
  once: true,
  margin: "-15% 0px",
} as const;

// ---------- variants -------------------------------------------------------
const page: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing.out } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.25, ease: easing.inOut } },
};

const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing.out } },
};

const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easing.inOut } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: easing.inOut } },
};

const modal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: easing.out },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.18, ease: easing.inOut },
  },
};

const tab: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: easing.out } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: easing.inOut } },
};

const tooltip: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: easing.out } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: easing.inOut } },
};

const cardHover: Variants = {
  rest: { y: 0, scale: 1, transition: baseTransition },
  hover: {
    y: -2,
    scale: 1.005,
    transition: { duration: 0.25, ease: easing.out },
  },
};

const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: 0.15, ease: easing.out } },
  tap: { scale: 0.97, transition: { duration: 0.08, ease: easing.inOut } },
};

const heroReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easing.expo },
  },
};

const counter: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing.out } },
};

// ---------- export ---------------------------------------------------------
export const motionPresets = {
  page,
  staggerParent,
  staggerChild,
  overlay,
  modal,
  tab,
  tooltip,
  cardHover,
  buttonPress,
  heroReveal,
  counter,
} as const;

export type MotionPresetName = keyof typeof motionPresets;
export default motionPresets;
