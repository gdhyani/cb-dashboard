"use client";

import { motion, useReducedMotion } from "motion/react";
import { DiagramFrame } from "../diagram-frame";

const CX = 450;
const CY = 165;
const READERS = [
  { label: "Child processes", sub: "get a full copy at start", x: 120, y: 45 },
  { label: "ps / Activity Monitor", sub: "same user can list it", x: 450, y: 25 },
  { label: "/proc/<pid>/environ", sub: "Linux, same user", x: 780, y: 45 },
  { label: "Debugger, heap dump", sub: "reads memory directly", x: 120, y: 285 },
  { label: "Crash and error reports", sub: "often attach the environment", x: 450, y: 305 },
  { label: "console.log(process.env)", sub: "one line in a log", x: 780, y: 285 },
];

/** FR-DOC-010: an environment is plain text in a process; these are the everyday ways it is read. */
export function EnvVisibilityDiagram() {
  const still = useReducedMotion();
  return (
    <DiagramFrame caption="Environment variables are not hidden: they are plain strings in the process, readable in many ordinary ways.">
      <svg
        role="img"
        aria-label="A running Node process's environment can be read by child processes, process listings, /proc on Linux, debuggers and heap dumps, crash reports, and logs"
        viewBox="0 0 900 340"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        {READERS.map((r, i) => (
          <g key={r.label}>
            <line x1={CX} y1={CY} x2={r.x} y2={r.y} stroke="#3a3a3a" strokeDasharray="4 5" />
            {!still && (
              <motion.circle
                r={4}
                fill="#d4d4d4"
                aria-hidden
                initial={{ cx: CX, cy: CY, opacity: 0 }}
                animate={{ cx: [CX, r.x], cy: [CY, r.y], opacity: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.37, ease: "easeOut" }}
              />
            )}
          </g>
        ))}
        <rect x={CX - 150} y={CY - 44} width={300} height={88} rx={10} fill="#0a0a0a" stroke="#6d6d6d" />
        <text x={CX - 132} y={CY - 16} fill="#ededed" fontSize={13} fontWeight={600}>
          node server.js
        </text>
        <text x={CX - 132} y={CY + 6} fill="#a1a1a1" fontSize={11} fontFamily="var(--font-geist-mono), monospace">
          PORT=3000
        </text>
        <text x={CX - 132} y={CY + 24} fill="#fbbf24" fontSize={11} fontFamily="var(--font-geist-mono), monospace">
          DATABASE_URL=postgres://app:••••@db…
        </text>
        {READERS.map((r) => (
          <g key={`${r.label}-box`} data-testid="env-reader">
            <rect x={r.x - 105} y={r.y - 24} width={210} height={48} rx={8} fill="#0a0a0a" stroke="#3a3a3a" />
            <text x={r.x} y={r.y - 3} textAnchor="middle" fill="#ededed" fontSize={12} fontWeight={600}>
              {r.label}
            </text>
            <text x={r.x} y={r.y + 14} textAnchor="middle" fill="#a1a1a1" fontSize={11}>
              {r.sub}
            </text>
          </g>
        ))}
      </svg>
    </DiagramFrame>
  );
}
