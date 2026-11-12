"use client";

import { motion, useReducedMotion } from "motion/react";
import { DiagramFrame } from "../diagram-frame";

const CX = 450;
const CY = 170;
const DESTINATIONS = [
  { label: "Git history", sub: "one wrong commit", x: 120, y: 50 },
  { label: "AI coding agent", sub: "reads every file", x: 450, y: 30 },
  { label: "npm install script", sub: "runs as you", x: 780, y: 50 },
  { label: "Screen share, logs", sub: "printed by accident", x: 120, y: 290 },
  { label: "Old laptop, backups", sub: "copies that outlive you", x: 450, y: 310 },
  { label: "Former teammate", sub: "still has the file", x: 780, y: 290 },
];

/** FR-DOC-010: where a real value in a `.env` file ends up. Dots travel outward from the file to each place. */
export function LeakMapDiagram() {
  const still = useReducedMotion();
  return (
    <DiagramFrame caption="A real key in a .env file is only as safe as every place that file, and the person, ever goes.">
      <svg
        role="img"
        aria-label="A .env file with a real key leaks to git history, AI coding agents, npm install scripts, screen shares and logs, old laptops and backups, and former teammates"
        viewBox="0 0 900 350"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        {DESTINATIONS.map((d, i) => (
          <g key={d.label}>
            <line x1={CX} y1={CY} x2={d.x} y2={d.y} stroke="#3a3a3a" />
            {!still && (
              <motion.circle
                r={4}
                fill="#fbbf24"
                aria-hidden
                initial={{ cx: CX, cy: CY, opacity: 0 }}
                animate={{ cx: [CX, d.x], cy: [CY, d.y], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, delay: i * 0.4, ease: "easeOut" }}
              />
            )}
          </g>
        ))}
        <rect x={CX - 130} y={CY - 38} width={260} height={76} rx={10} fill="#0a0a0a" stroke="#6d6d6d" />
        <text x={CX - 112} y={CY - 10} fill="#a1a1a1" fontSize={12} fontFamily="var(--font-geist-mono), monospace">
          .env
        </text>
        <text x={CX - 112} y={CY + 16} fill="#fbbf24" fontSize={12} fontFamily="var(--font-geist-mono), monospace">
          STRIPE_SECRET_KEY=sk_live_••••
        </text>
        {DESTINATIONS.map((d) => (
          <g key={`${d.label}-box`} data-testid="leak-destination">
            <rect x={d.x - 95} y={d.y - 24} width={190} height={48} rx={8} fill="#0a0a0a" stroke="#3a3a3a" />
            <text x={d.x} y={d.y - 3} textAnchor="middle" fill="#ededed" fontSize={13} fontWeight={600}>
              {d.label}
            </text>
            <text x={d.x} y={d.y + 14} textAnchor="middle" fill="#a1a1a1" fontSize={11}>
              {d.sub}
            </text>
          </g>
        ))}
      </svg>
    </DiagramFrame>
  );
}
