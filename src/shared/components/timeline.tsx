"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  time: string;
  /** Lane index: events on the same entity share a lane, like branches in a git graph. */
  lane?: number;
  emphasis?: "normal" | "warning";
}

const LANE_WIDTH = 14;

/** Monochrome git-graph style history: one vertical rail per lane, a node per event. */
export function Timeline({ items, lanes = 1 }: { items: TimelineItem[]; lanes?: number }) {
  const width = Math.max(1, lanes) * LANE_WIDTH + 8;
  const rails = Array.from({ length: Math.max(1, lanes) }, (_, l) => l * LANE_WIDTH + 6);
  return (
    <ol className="relative flex flex-col">
      {items.map((item, index) => {
        const lane = Math.min(item.lane ?? 0, lanes - 1);
        return (
          <motion.li
            key={item.id}
            initial={{ x: -4 }}
            animate={{ x: 0 }}
            transition={{ delay: Math.min(index, 12) * 0.02 }}
            className="relative flex gap-4"
          >
            {/* Rail column: the svg fills the row's height (an svg without a height would default to 150px). */}
            <div className="relative shrink-0 self-stretch" style={{ width }} aria-hidden="true">
              <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                {rails.map((x) => (
                  <line key={x} x1={x} x2={x} y1={0} y2="100%" stroke="var(--color-border)" strokeWidth={1} />
                ))}
                <circle
                  cx={lane * LANE_WIDTH + 6}
                  cy={18}
                  r={4}
                  fill={item.emphasis === "warning" ? "var(--color-destructive)" : "var(--color-background)"}
                  stroke={item.emphasis === "warning" ? "var(--color-destructive)" : "var(--color-foreground)"}
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
              <div className="min-w-0 text-sm">{item.title}</div>
              <div className="flex items-baseline gap-3 font-mono text-xs text-subtle">
                {item.meta}
                <span>{item.time}</span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
