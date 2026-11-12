"use client";

import { motion, useReducedMotion } from "motion/react";
import { DiagramFrame } from "../diagram-frame";
import { ArrowMarker } from "../diagram-parts";

const INPUTS = ["device id", "environment", "service"];
const OUTPUTS = [
  { device: "Laptop A", value: "sk_test_cb_7Hq2…f81", y: 52 },
  { device: "Laptop B", value: "sk_test_cb_Mx9d…04a", y: 132 },
];

/**
 * FR-DOC-010 (FR-CRY-002, S7): a stand-in is an HMAC of who is asking, keyed by a server-only secret. It carries no
 * information about the real key, differs per device, and a copied stand-in is refused on another device.
 */
export function StandInDiagram() {
  const still = useReducedMotion();
  return (
    <DiagramFrame caption="The stand-in is computed from who is asking, not from the real key, so it gives nothing away.">
      <svg
        role="img"
        aria-label="A stand-in is an HMAC of the device, environment and service under a server-only secret; each device gets its own, and a stand-in copied to another device is refused"
        viewBox="0 0 900 270"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-standin" />
        {INPUTS.map((label, i) => (
          <g key={label}>
            <rect x={10} y={40 + i * 46} width={150} height={34} rx={6} fill="#0a0a0a" stroke="#3a3a3a" />
            <text x={85} y={62 + i * 46} textAnchor="middle" fill="#ededed" fontSize={12}>
              {label}
            </text>
            <line x1={160} y1={57 + i * 46} x2={246} y2={103} stroke="#8f8f8f" markerEnd="url(#arrow-standin)" />
          </g>
        ))}
        <rect x={250} y={60} width={250} height={86} rx={10} fill="#0a0a0a" stroke="#6d6d6d" />
        <text x={375} y={92} textAnchor="middle" fill="#ededed" fontSize={14} fontWeight={600}>
          HMAC-SHA256
        </text>
        <text x={375} y={114} textAnchor="middle" fill="#a1a1a1" fontSize={11}>
          keyed by a secret only the cb server has
        </text>
        <text x={375} y={132} textAnchor="middle" fill="#a1a1a1" fontSize={11}>
          compared in constant time
        </text>
        {OUTPUTS.map((o, i) => (
          <g key={o.device}>
            <motion.line
              x1={500}
              y1={103}
              x2={600}
              y2={o.y + 17}
              stroke="#8f8f8f"
              strokeDasharray="5 5"
              markerEnd="url(#arrow-standin)"
              animate={still ? undefined : { strokeDashoffset: [0, -20] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: i * 0.3 }}
            />
            <rect x={604} y={o.y} width={280} height={34} rx={6} fill="#0a0a0a" stroke="#3a3a3a" />
            <text x={616} y={o.y + 22} fill="#a1a1a1" fontSize={11}>
              {o.device}
            </text>
            <text x={690} y={o.y + 22} fill="#ededed" fontSize={12} fontFamily="var(--font-geist-mono), monospace">
              {o.value}
            </text>
          </g>
        ))}
        <rect x={250} y={196} width={634} height={46} rx={8} fill="none" stroke="#7f1d1d" strokeDasharray="4 4" />
        <text x={266} y={224} fill="#fca5a5" fontSize={12}>
          Laptop A’s stand-in pasted on Laptop B → refused (wrong device)
        </text>
        <text x={10} y={226} fill="#737373" fontSize={11}>
          real key: not an input
        </text>
      </svg>
    </DiagramFrame>
  );
}
