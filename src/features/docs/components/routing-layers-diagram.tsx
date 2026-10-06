import { DiagramFrame } from "./diagram-frame";
import { Arrow, ArrowMarker, BOX_H } from "./diagram-parts";

const ROWS = [
  { tag: "Layer 1", boxes: ["DATABASE_URL", "127.0.0.1:<port>", "cb gateway", "Database"] },
  { tag: "Layer 2", boxes: ["api.stripe.com", "preload redirect", "cb gateway (TLS)", "Stripe"] },
];
const W = 160;
const GAP = (880 - 70 - 4 * W) / 3;

export function RoutingLayersDiagram() {
  return (
    <DiagramFrame caption="Databases connect to a local port; HTTPS APIs keep their real host name and are redirected by the preload.">
      <svg
        role="img"
        aria-label="Two routing layers: Layer 1 local ports for databases, Layer 2 HTTPS hosts for APIs"
        viewBox="0 0 880 230"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-layers" />
        {ROWS.map((r, row) => {
          const y = 20 + row * 110;
          return (
            <g key={r.tag}>
              <text x={0} y={y + BOX_H / 2 + 4} fill="#a1a1a1" fontSize={11} fontWeight={600}>
                {r.tag}
              </text>
              {r.boxes.map((label, i) => {
                const x = 70 + i * (W + GAP);
                return (
                  <g key={label}>
                    <rect x={x} y={y} width={W} height={BOX_H} rx={8} fill="#0a0a0a" stroke="#3a3a3a" />
                    <text x={x + W / 2} y={y + 43} textAnchor="middle" fill="#ededed" fontSize={13} fontWeight={600}>
                      {label}
                    </text>
                    {i < 3 && <Arrow x1={x + W} x2={x + W + GAP - 2} y={y + BOX_H / 2} marker="arrow-layers" />}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
