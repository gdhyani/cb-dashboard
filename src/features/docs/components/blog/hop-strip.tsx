"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/shared/hooks/use-reduced-motion";
import type { Hop } from "../../lib/env-types";

const SIDE_LABEL: Record<Hop["side"], string> = {
  laptop: "on your laptop",
  tunnel: "laptop ↔ cb server",
  server: "on the cb server",
  provider: "cb server → provider",
};

/**
 * FR-DOC-010: a path drawn as hops. Each hop names its protocol and port and what it carries; the one hop that carries
 * the real secret is red (`hot`). Stacks vertically on narrow screens.
 */
export function HopStrip({ hops }: { hops: Hop[] }) {
  const still = useReducedMotion();
  return (
    <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {hops.map((h, i) => (
        <li
          key={`${h.from}-${h.to}-${h.proto}`}
          data-testid="hop"
          data-real={String(Boolean(h.real))}
          data-side={h.side}
          className={`relative flex-1 overflow-hidden rounded-lg border px-3 py-2.5 ${
            h.real ? "border-hot/60 bg-hot-soft" : "border-border-strong bg-card"
          }`}
        >
          {!still && (
            <motion.span
              aria-hidden
              className={`absolute top-0 left-0 h-0.5 w-1/3 ${h.real ? "bg-hot" : "bg-subtle"}`}
              initial={{ x: "-100%" }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 1.6,
                delay: i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: hops.length * 0.5,
              }}
            />
          )}
          <p className="text-[11px] text-subtle">{SIDE_LABEL[h.side]}</p>
          <p className="mt-1 text-[13px] font-medium text-foreground">
            {h.from} → {h.to}
          </p>
          <p className={`mt-1 font-mono text-[11.5px] ${h.real ? "text-hot" : "text-muted-foreground"}`}>{h.proto}</p>
          <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>
        </li>
      ))}
    </ol>
  );
}
