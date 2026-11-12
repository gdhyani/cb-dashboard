import { StaggerBlock } from "@/shared/components/stagger";
import { DiagramFrame } from "../diagram-frame";

type Layer = { label: string; detail: string; tone?: "real" | "app" };
type HopLayers = { hop: string; where: string; layers: Layer[] };

const LAYER1: HopLayers[] = [
  {
    hop: "app → agent",
    where: "loopback, never leaves the machine",
    layers: [
      { label: "IP 127.0.0.1", detail: "loopback interface" },
      { label: "TCP :7402", detail: "the agent's listener" },
      { label: "Postgres wire bytes", detail: "StartupMessage, stand-in password", tone: "app" },
    ],
  },
  {
    hop: "agent → cb server",
    where: "the internet",
    layers: [
      { label: "TCP :443", detail: "to the cb server" },
      { label: "TLS", detail: "agent ↔ cb server, certificate verified" },
      { label: "WebSocket binary frame", detail: "GET /tunnel?layer=1, bearer token" },
      { label: "Postgres wire bytes", detail: "exactly as the app sent them", tone: "app" },
    ],
  },
  {
    hop: "cb server → database",
    where: "the internet or a private network",
    layers: [
      { label: "TCP :5432", detail: "to the real host" },
      { label: "TLS", detail: "verify-full, system roots or the service's CA" },
      { label: "Postgres wire bytes", detail: "SCRAM-SHA-256 with the real password", tone: "real" },
    ],
  },
];

const LAYER2: HopLayers[] = [
  {
    hop: "app → agent",
    where: "loopback, never leaves the machine",
    layers: [
      { label: "IP 127.0.0.1", detail: "redirected by the preload" },
      { label: "TCP :7421", detail: "the agent's listener for api.stripe.com:443" },
      { label: "TLS (app ↔ gateway)", detail: "SNI api.stripe.com, org CA trusted for this connection" },
      { label: "HTTP request", detail: "Authorization: Bearer stand-in", tone: "app" },
    ],
  },
  {
    hop: "agent → cb server",
    where: "the internet",
    layers: [
      { label: "TCP :443", detail: "to the cb server" },
      { label: "TLS (agent ↔ cb server)", detail: "outer tunnel encryption" },
      { label: "WebSocket binary frame", detail: "GET /tunnel?layer=2&host=api.stripe.com" },
      { label: "TLS (app ↔ gateway)", detail: "the app's own encryption, untouched by the agent" },
      { label: "HTTP request", detail: "still the stand-in", tone: "app" },
    ],
  },
  {
    hop: "cb server → provider",
    where: "the internet",
    layers: [
      { label: "TCP :443", detail: "to api.stripe.com, resolved on the server" },
      { label: "TLS", detail: "a new connection, Stripe's certificate verified" },
      { label: "HTTP request", detail: "Authorization: Bearer real key", tone: "real" },
    ],
  },
];

function Nest({ layers, depth = 0 }: { layers: Layer[]; depth?: number }) {
  const [outer, ...inner] = layers;
  if (!outer) return null;
  const tone =
    outer.tone === "real"
      ? "border-amber-300/70 bg-amber-300/[0.07]"
      : outer.tone === "app"
        ? "border-emerald-300/50 bg-emerald-300/[0.05]"
        : "border-[#333] bg-[#0b0b0b]";
  return (
    <StaggerBlock
      index={depth}
      data-testid="packet-layer"
      data-label={outer.label}
      className={`rounded-md border p-2 ${tone}`}
    >
      <p className={`font-mono text-[11.5px] ${outer.tone === "real" ? "text-amber-300" : "text-foreground"}`}>
        {outer.label}
      </p>
      <p className="text-[10.5px] text-muted-foreground">{outer.detail}</p>
      {inner.length > 0 && (
        <div className="mt-2">
          <Nest layers={inner} depth={depth + 1} />
        </div>
      )}
    </StaggerBlock>
  );
}

/**
 * FR-DOC-010: what is inside each hop, as nested layers (outermost first). Layer 2 shows the app's TLS travelling
 * inside the tunnel's TLS; the real secret only appears in the last hop's innermost layer.
 */
export function PacketLayers({ mode }: { mode: "layer1" | "layer2" }) {
  const hops = mode === "layer1" ? LAYER1 : LAYER2;
  return (
    <DiagramFrame
      caption={
        mode === "layer1"
          ? "Layer 1 (a database): the same Postgres bytes, wrapped differently on each hop. Only the last hop has the real password."
          : "Layer 2 (an HTTPS API): on the tunnel hop, the app's TLS rides inside cb's TLS. The agent never opens the app's TLS."
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {hops.map((h) => (
          <fieldset key={h.hop} aria-label={h.hop} className="min-w-0">
            <legend className="text-[13px] font-semibold text-foreground">{h.hop}</legend>
            <p className="mb-2 text-[11px] text-subtle">{h.where}</p>
            <Nest layers={h.layers} />
          </fieldset>
        ))}
      </div>
    </DiagramFrame>
  );
}
