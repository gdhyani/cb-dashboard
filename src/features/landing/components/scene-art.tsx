import { Bot, GitBranch, type LucideIcon, MemoryStick, Package, ScrollText, ShieldCheck } from "lucide-react";
import { scene } from "../content-story";

export type SceneMode = "without" | "with";

// Geometry (viewBox 600 × 580). Labels always sit on the OUTER side of a node and wires attach on the inner side,
// so no wire ever crosses text. Top readers: labels above. Bottom readers: labels below. The gateway sits under the
// developer-machine boundary with its label to the right.
export const VIEW = { w: 600, h: 580 };
export const CARD = { x: 120, y: 150, w: 360, h: 196 };
const R = 24;
type Reader = { id: string; x: number; y: number; side: "top" | "bottom"; icon: LucideIcon; from: [number, number] };
export const READERS: Reader[] = [
  { id: "npm", x: 90, y: 78, side: "top", icon: Package, from: [170, CARD.y] },
  { id: "ai", x: 300, y: 78, side: "top", icon: Bot, from: [300, CARD.y] },
  { id: "logs", x: 510, y: 78, side: "top", icon: ScrollText, from: [430, CARD.y] },
  { id: "dump", x: 90, y: 412, side: "bottom", icon: MemoryStick, from: [170, CARD.y + CARD.h] },
  { id: "git", x: 510, y: 412, side: "bottom", icon: GitBranch, from: [430, CARD.y + CARD.h] },
];
export const GATEWAY = { x: 300, y: 536 };
const BOUNDARY = 492;

/** A soft S-curve between two points (vertical tangents at both ends). */
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const ym = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${ym} ${x2} ${ym} ${x2} ${y2}`;
};
export const legPath = (r: Reader) => curve(r.from[0], r.from[1], r.x, r.side === "top" ? r.y + R : r.y - R);
export const gatewayPath = curve(300, CARD.y + CARD.h, GATEWAY.x, GATEWAY.y - R);

/**
 * One state of the hero scene, drawn statically: "without" (real keys, red, every reader has the key) or "with"
 * (placeholders, yellow, readers struck through as worthless, the gateway wire lit). The hero stacks both and reveals
 * "with" over "without" with a scan line driven by scroll.
 */
export function SceneArt({ mode }: { mode: SceneMode }) {
  const hot = mode === "without";
  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="lp-art" data-mode={mode} aria-hidden="true">
      <defs>
        <pattern id={`lp-dots-${mode}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="lp-art__dot" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width={VIEW.w - 1} height={VIEW.h - 1} rx="16" className="lp-art__bg" />
      <rect x="0" y="0" width={VIEW.w} height={VIEW.h} fill={`url(#lp-dots-${mode})`} />

      <line x1="0" x2={VIEW.w} y1={BOUNDARY} y2={BOUNDARY} className="lp-art__edge" />
      {/* Right-aligned: the top label stops at the centre wire (clear of the heap-dump verdict), the bottom one stops short of the gateway halo, in both states. */}
      <text x="288" y={BOUNDARY - 10} textAnchor="end" className="lp-art__edge-label">
        ▲ developer machine
      </text>
      <text x="240" y={BOUNDARY + 18} textAnchor="end" className="lp-art__edge-label">
        ▼ cb server
      </text>

      {READERS.map((r) => (
        <path key={r.id} d={legPath(r)} className="lp-art__leg" data-leg="" />
      ))}
      <path d={gatewayPath} className="lp-art__gateway-leg" />

      {READERS.map((r, i) => {
        const Icon = r.icon;
        const reader = scene.readers[i];
        const above = r.side === "top";
        const nameY = above ? r.y - R - 26 : r.y + R + 20;
        const verdictY = above ? r.y - R - 10 : r.y + R + 36;
        return (
          <g key={r.id} className="lp-art__reader">
            <circle cx={r.x} cy={r.y} r={R + 12} className="lp-art__halo" />
            <circle cx={r.x} cy={r.y} r={R} className="lp-art__node" />
            <Icon x={r.x - 11} y={r.y - 11} width={22} height={22} strokeWidth={1.6} className="lp-art__icon" />
            <text x={r.x} y={nameY} textAnchor="middle" className="lp-art__label">
              {reader?.label}
            </text>
            <text x={r.x} y={verdictY} textAnchor="middle" className="lp-art__verdict">
              {hot ? scene.reached : scene.worthless}
            </text>
          </g>
        );
      })}

      <g className="lp-art__gateway">
        <circle cx={GATEWAY.x} cy={GATEWAY.y} r={R + 12} className="lp-art__gateway-halo" />
        <circle cx={GATEWAY.x} cy={GATEWAY.y} r={R} className="lp-art__gateway-node" />
        <ShieldCheck
          x={GATEWAY.x - 11}
          y={GATEWAY.y - 11}
          width={22}
          height={22}
          strokeWidth={1.6}
          className="lp-art__icon"
        />
        <text x={GATEWAY.x + R + 12} y={GATEWAY.y - 2} className="lp-art__label">
          {scene.gateway}
        </text>
        <text x={GATEWAY.x + R + 12} y={GATEWAY.y + 14} className="lp-art__gateway-note">
          {hot ? "not involved" : "holds the real key"}
        </text>
      </g>

      <g className="lp-art__card">
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx="10" className="lp-art__card-bg" />
        <text x={CARD.x + 18} y={CARD.y + 30} className="lp-art__file">
          {scene.file}
        </text>
        <rect x={CARD.x + CARD.w - 120} y={CARD.y + 13} width="104" height="24" rx="4" className="lp-art__tag" />
        <text x={CARD.x + CARD.w - 68} y={CARD.y + 30} textAnchor="middle" className="lp-art__tag-text">
          {hot ? "real keys" : "placeholders"}
        </text>
        <line x1={CARD.x} x2={CARD.x + CARD.w} y1={CARD.y + 46} y2={CARD.y + 46} className="lp-art__rule" />
        {scene.keys.map((k, i) => (
          <g key={k.key}>
            <text x={CARD.x + 18} y={CARD.y + 72 + i * 44} className="lp-art__key">
              {k.key}
            </text>
            <text x={CARD.x + 18} y={CARD.y + 92 + i * 44} className="lp-art__value">
              {hot ? k.real : k.standIn}
            </text>
          </g>
        ))}
      </g>

      {READERS.map((r) => (
        <circle key={r.id} r="5.5" className="lp-art__pulse" data-pulse="" opacity="0" />
      ))}
    </svg>
  );
}
