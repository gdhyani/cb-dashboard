import { DiagramFrame } from "./diagram-frame";
import { Arrow, ArrowMarker, BOX_H, BOX_W, Box } from "./diagram-parts";

const BOXES = [
  { label: "Provider", sub: "Stripe, Razorpay" },
  { label: "cb backend", sub: "checks the real signature" },
  { label: "Your device", sub: "re-signed with your stand-in" },
  { label: "Your app", sub: "SDK verifies as usual" },
];
const GAP = (880 - BOXES.length * BOX_W) / (BOXES.length - 1);

export function WebhookFlowDiagram() {
  return (
    <DiagramFrame caption="One public URL for the whole team; each event goes to the device that caused it, signed with that device's stand-in.">
      <svg
        role="img"
        aria-label="Webhook delivery: the provider calls cb backend, which re-signs and sends the event to your device and app"
        viewBox="0 0 880 120"
        className="w-full min-w-[640px]"
        fontFamily="inherit"
      >
        <ArrowMarker id="arrow-hooks" />
        {BOXES.map((b, i) => {
          const x = i * (BOX_W + GAP);
          return (
            <g key={b.label}>
              <Box x={x} y={22} label={b.label} sub={b.sub} />
              {i < BOXES.length - 1 && (
                <Arrow x1={x + BOX_W} x2={x + BOX_W + GAP - 2} y={22 + BOX_H / 2} marker="arrow-hooks" />
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
