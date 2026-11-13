"use client";

import { motion, useReducedMotion } from "motion/react";
import { DiagramFrame } from "../diagram-frame";
import { ArrowMarker, BOX_H, BOX_W, Box } from "../diagram-parts";

const REAL = "#fbbf24";
const STAND_IN = "#d4d4d4";
const NODES = [
  { x: 20, label: "Your app", sub: "reads a stand-in" },
  { x: 270, label: "cb agent", sub: "passes bytes through" },
  { x: 520, label: "cb gateway", sub: "checks it, signs in" },
  { x: 770, label: "The service", sub: "sees a normal login" },
];
const Y = 96;
const MID = Y + BOX_H / 2;
const HOPS = [
  { from: 0, label: "stand-in, on 127.0.0.1" },
  { from: 1, label: "stand-in, encrypted tunnel" },
  { from: 2, label: "real key", real: true },
];
const loop = { duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "linear" } as const;

/**
 * FR-DOC-010: the path of one request. The laptop side only ever carries the stand-in; the real key exists on the
 * last hop only, from the cb server to the service. The moving token swaps colour at the gateway.
 */
export function SecurePassageDiagram() {
  const still = useReducedMotion();
  const start = NODES[0].x + BOX_W - 14;
  const swap = NODES[2].x + BOX_W / 2;
  const end = NODES[3].x + 10;
  return (
    <DiagramFrame caption="Everything on your laptop is a stand-in. The real key travels one hop: cb server → service.">
      <svg
        role="img"
        aria-label="A request carries a stand-in from your app through the cb agent to the cb gateway, which uses the real key only on the last hop to the service"
        viewBox="0 0 980 250"
        className="w-full min-w-[680px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-passage" />
        <rect x={6} y={40} width={478} height={180} rx={14} fill="none" stroke="#525252" strokeDasharray="6 6" />
        <text x={22} y={64} fill="#a1a1a1" fontSize={12} fontWeight={600}>
          Your laptop
        </text>
        <rect x={500} y={40} width={230} height={180} rx={14} fill="none" stroke="#525252" />
        <text x={516} y={64} fill="#a1a1a1" fontSize={12} fontWeight={600}>
          cb server
        </text>
        {!still && (
          <g aria-hidden>
            <motion.circle
              cy={MID}
              r={6}
              fill={STAND_IN}
              initial={{ cx: start, opacity: 0 }}
              animate={{ cx: [start, swap, swap], opacity: [0, 1, 1, 0, 0] }}
              transition={{
                cx: { ...loop, times: [0, 0.6, 1] },
                opacity: { ...loop, times: [0, 0.04, 0.58, 0.6, 1] },
              }}
            />
            <motion.circle
              cy={MID}
              r={6}
              fill={REAL}
              initial={{ cx: swap, opacity: 0 }}
              animate={{ cx: [swap, swap, end, end], opacity: [0, 0, 1, 1, 0] }}
              transition={{
                cx: { ...loop, times: [0, 0.6, 0.95, 1] },
                opacity: { ...loop, times: [0, 0.6, 0.62, 0.95, 1] },
              }}
            />
          </g>
        )}
        {NODES.map((n) => (
          <Box key={n.label} x={n.x} y={Y} label={n.label} sub={n.sub} />
        ))}
        {HOPS.map((h) => {
          const x1 = NODES[h.from].x + BOX_W;
          const x2 = NODES[h.from + 1].x - 2;
          return (
            <g key={h.label}>
              <line
                x1={x1}
                y1={MID}
                x2={x2}
                y2={MID}
                stroke={h.real ? REAL : "#8f8f8f"}
                markerEnd="url(#arrow-passage)"
              />
              <text
                x={(x1 + x2) / 2}
                y={Y + BOX_H + 22}
                textAnchor="middle"
                fill={h.real ? REAL : "#a1a1a1"}
                fontSize={11}
              >
                {h.label}
              </text>
            </g>
          );
        })}
        <text x={490} y={244} textAnchor="middle" fill="#737373" fontSize={11}>
          The stand-in works only from this device, only through cb, and only while access is granted.
        </text>
      </svg>
    </DiagramFrame>
  );
}
