import { DiagramFrame } from "./diagram-frame";
import { Arrow, ArrowMarker, BOX_H, BOX_W, Box } from "./diagram-parts";

const BOXES = [
  { label: "Your app", sub: "stand-in env vars" },
  { label: "cb agent", sub: "local listeners" },
  { label: "cb gateway", sub: "checks access, swaps credential" },
  { label: "Real service", sub: "Postgres, Stripe, OpenAI…" },
];
const GAP = (880 - BOXES.length * BOX_W) / (BOXES.length - 1);

export function ArchitectureDiagram() {
  return (
    <DiagramFrame caption="Your app talks to local stand-ins; only the gateway ever holds the real credential.">
      <svg
        role="img"
        aria-label="cb architecture: your app, the cb agent, the cb gateway and the real service"
        viewBox="0 0 880 120"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-arch" />
        {BOXES.map((b, i) => {
          const x = i * (BOX_W + GAP);
          return (
            <g key={b.label}>
              <Box x={x} y={22} label={b.label} sub={b.sub} />
              {i < BOXES.length - 1 && (
                <Arrow x1={x + BOX_W} x2={x + BOX_W + GAP - 2} y={22 + BOX_H / 2} marker="arrow-arch" />
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
