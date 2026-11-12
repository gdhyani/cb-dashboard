"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Hop } from "../../lib/env-types";

const SIDE_LABEL: Record<Hop["side"], string> = {
  laptop: "on your laptop",
  tunnel: "laptop ↔ cb server",
  server: "on the cb server",
  provider: "cb server → provider",
};

/**
 * FR-DOC-010: a path drawn as hops. Each hop names its protocol and port and what it carries; the one hop that carries
 * the real secret is amber. Stacks vertically on narrow screens.
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
            h.real ? "border-amber-300/60 bg-amber-300/[0.06]" : "border-[#2a2a2a] bg-[#0a0a0a]"
          }`}
        >
          {!still && (
            <motion.span
              aria-hidden
              className={`absolute top-0 left-0 h-0.5 w-1/3 ${h.real ? "bg-amber-300" : "bg-neutral-400"}`}
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
          <p className={`mt-1 font-mono text-[11.5px] ${h.real ? "text-amber-300" : "text-[#d4d4d4]"}`}>{h.proto}</p>
          <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>
        </li>
      ))}
    </ol>
  );
}
