import { DiagramFrame } from "./diagram-frame";
import { Arrow, ArrowMarker, BOX_H, BOX_W, Box } from "./diagram-parts";

const BOXES = [
  { label: "Your app", sub: "sends the stand-in" },
  { label: "cb agent", sub: "tunnels the bytes" },
  { label: "cb gateway", sub: "verifies, injects real" },
  { label: "Service", sub: "sees the real login" },
];
const LABELS = ["Stand-in", "Encrypted tunnel", "Real credential"];
const GAP = (880 - BOXES.length * BOX_W) / (BOXES.length - 1);

export function RequestFlowDiagram() {
  return (
    <DiagramFrame caption="The stand-in only works through cb; the real credential is added at the last hop.">
      <svg
        role="img"
        aria-label="Request flow: the app sends a stand-in, the gateway verifies it and uses the real credential"
        viewBox="0 0 880 120"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-flow" />
        {BOXES.map((b, i) => {
          const x = i * (BOX_W + GAP);
          return (
            <g key={b.label}>
              <Box x={x} y={30} label={b.label} sub={b.sub} />
              {i < BOXES.length - 1 && (
                <Arrow
                  x1={x + BOX_W}
                  x2={x + BOX_W + GAP - 2}
                  y={30 + BOX_H / 2}
                  marker="arrow-flow"
                  label={LABELS[i]}
                />
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
