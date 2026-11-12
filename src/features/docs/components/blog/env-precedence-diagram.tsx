"use client";

import { motion, useReducedMotion } from "motion/react";
import { DiagramFrame } from "../diagram-frame";

const STEPS = [
  { name: "Process environment", sub: "exported in the shell, set by CI or the host" },
  { name: ".env.development.local", sub: "your machine only, never committed" },
  { name: ".env.local", sub: "your machine only (skipped when NODE_ENV=test)" },
  { name: ".env.development", sub: "shared defaults for this mode" },
  { name: ".env", sub: "shared defaults for every mode" },
];

/**
 * FR-DOC-010: Next.js looks a variable up in this order during `next dev` and uses the first place that defines it.
 * A highlight walks down the ladder and stops at the match.
 */
export function EnvPrecedenceDiagram() {
  const still = useReducedMotion();
  return (
    <DiagramFrame caption="next dev: the first place that defines a name wins. Later files only fill in what is missing.">
      <div
        role="img"
        aria-label="The order Next.js reads environment variables in development: process environment, then .env.development.local, .env.local, .env.development, and .env last"
        className="relative flex flex-col gap-2"
      >
        {STEPS.map((s, i) => (
          <div
            key={s.name}
            data-testid="precedence-step"
            className="relative flex items-baseline gap-4 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3"
            style={{ marginLeft: `${i * 1.25}rem` }}
          >
            {!still && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg border border-amber-300/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.1,
                  delay: i * 0.9,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: STEPS.length * 0.9 - 1.1,
                }}
              />
            )}
            <span className="font-mono text-[13px] text-foreground">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
