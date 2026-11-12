"use client";

import { motion, useReducedMotion } from "motion/react";
import type { SequenceLane, SequenceStep } from "../../lib/sequences";
import { DiagramFrame } from "../diagram-frame";

const LANE_W = 150;
const TOP = 70;
const ROW = 46;
const REAL = "#fbbf24";
const ZONE: Record<SequenceLane["side"], string> = { laptop: "Your laptop", server: "cb server", service: "Provider" };

/**
 * FR-DOC-010: a sequence diagram. Lanes are grouped by where they run (laptop, cb server, provider); steps are
 * arrows top to bottom, and a dot replays them in order. Steps that carry the real key are amber.
 */
export function SequenceDiagram({
  lanes,
  steps,
  caption,
  label,
}: {
  lanes: SequenceLane[];
  steps: SequenceStep[];
  caption: string;
  label: string;
}) {
  const still = useReducedMotion();
  const width = lanes.length * LANE_W + 40;
  const height = TOP + steps.length * ROW + 40;
  const laneX = (i: number) => 20 + i * LANE_W + LANE_W / 2;
  const zones = (["laptop", "server", "service"] as const)
    .map((side) => ({ side, idx: lanes.flatMap((l, i) => (l.side === side ? [i] : [])) }))
    .filter((z) => z.idx.length > 0);
  const per = 1.1;
  return (
    <DiagramFrame caption={caption}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: Math.min(width, 720) }}
        fontFamily="inherit"
      >
        <defs>
          <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0L10 5L0 10z" fill="#8f8f8f" />
          </marker>
          <marker
            id="seq-arrow-real"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10z" fill={REAL} />
          </marker>
        </defs>
        {zones.map((z) => {
          const x = 20 + z.idx[0] * LANE_W + 4;
          const w = z.idx.length * LANE_W - 8;
          return (
            <g key={z.side}>
              <rect
                x={x}
                y={4}
                width={w}
                height={height - 10}
                rx={12}
                fill="none"
                stroke="#3f3f3f"
                strokeDasharray={z.side === "laptop" ? "6 6" : undefined}
              />
              <text x={x + 12} y={22} fill="#8a8a8a" fontSize={11} fontWeight={600}>
                {ZONE[z.side]}
              </text>
            </g>
          );
        })}
        {lanes.map((l, i) => (
          <g key={l.label}>
            <rect
              x={laneX(i) - 64}
              y={30}
              width={128}
              height={l.sub ? 38 : 30}
              rx={7}
              fill="#0a0a0a"
              stroke="#3a3a3a"
            />
            <text x={laneX(i)} y={46} textAnchor="middle" fill="#ededed" fontSize={12} fontWeight={600}>
              {l.label}
            </text>
            {l.sub && (
              <text x={laneX(i)} y={60} textAnchor="middle" fill="#8a8a8a" fontSize={9.5}>
                {l.sub}
              </text>
            )}
            <line x1={laneX(i)} y1={72} x2={laneX(i)} y2={height - 14} stroke="#2a2a2a" />
          </g>
        ))}
        {steps.map((s, i) => {
          const y = TOP + 26 + i * ROW;
          const x1 = laneX(s.from);
          const x2 = laneX(s.to);
          const dir = x2 > x1 ? 1 : -1;
          return (
            <g key={`${s.from}-${s.to}-${s.label}`} data-testid="sequence-step">
              {s.from === s.to ? (
                <path
                  d={`M${x1} ${y - 8} h26 v16 h-20`}
                  fill="none"
                  stroke={s.real ? REAL : "#8f8f8f"}
                  markerEnd={`url(#${s.real ? "seq-arrow-real" : "seq-arrow"})`}
                />
              ) : (
                <line
                  x1={x1}
                  y1={y}
                  x2={x2 - dir * 6}
                  y2={y}
                  stroke={s.real ? REAL : "#8f8f8f"}
                  markerEnd={`url(#${s.real ? "seq-arrow-real" : "seq-arrow"})`}
                />
              )}
              <text
                x={s.from === s.to ? x1 + 32 : (x1 + x2) / 2}
                y={s.from === s.to ? y + 4 : y - 7}
                textAnchor={s.from === s.to ? "start" : "middle"}
                fill={s.real ? REAL : "#bdbdbd"}
                fontSize={10.5}
              >
                {s.label}
              </text>
              {!still && (
                <motion.circle
                  aria-hidden
                  r={5}
                  cy={y}
                  fill={s.real ? REAL : "#e5e5e5"}
                  initial={{ cx: x1, opacity: 0 }}
                  animate={{ cx: [x1, x1, x2, x2], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: per,
                    times: [0, 0.1, 0.85, 1],
                    delay: i * per,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: (steps.length - 1) * per,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
