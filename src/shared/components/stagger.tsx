"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";

/**
 * The one list entrance used everywhere: a 4px slide-up with a small stagger.
 * Transform only — content is never invisible, so nothing flashes or hides.
 */
const enter = (index: number) => ({
  initial: { y: 4 },
  animate: { y: 0 },
  transition: { duration: 0.25, ease: [0.2, 0.7, 0.2, 1] as const, delay: Math.min(index, 12) * 0.03 },
});

export function StaggerItem({ index = 0, ...props }: { index?: number } & ComponentProps<typeof motion.li>) {
  return <motion.li {...enter(index)} {...props} />;
}

export function StaggerBlock({ index = 0, ...props }: { index?: number } & ComponentProps<typeof motion.div>) {
  return <motion.div {...enter(index)} {...props} />;
}
