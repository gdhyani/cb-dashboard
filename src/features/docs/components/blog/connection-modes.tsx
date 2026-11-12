import type { Hop } from "../../lib/env-types";
import { DiagramFrame } from "../diagram-frame";
import { HopStrip } from "./hop-strip";

const MODES: { title: string; sub: string; hops: Hop[] }[] = [
  {
    title: "Without cb",
    sub: "the real key sits in process.env on the laptop",
    hops: [
      {
        from: "Your app",
        to: "api.stripe.com",
        proto: "DNS, TCP :443, TLS, HTTP",
        note: "Bearer real key, straight from the laptop",
        side: "laptop",
        real: true,
      },
    ],
  },
  {
    title: "Layer 1: local URL",
    sub: "databases, SMTP, AWS endpoints, optional API base URLs",
    hops: [
      {
        from: "Your app",
        to: "cb agent",
        proto: "TCP 127.0.0.1:7402",
        note: "the URL in .env says so",
        side: "laptop",
      },
      {
        from: "cb agent",
        to: "cb gateway",
        proto: "WSS :443 /tunnel?layer=1",
        note: "one WebSocket per connection",
        side: "tunnel",
      },
      { from: "cb gateway", to: "the service", proto: "TCP + TLS", note: "real login", side: "provider", real: true },
    ],
  },
  {
    title: "Layer 2: same hostname",
    sub: "SDKs with a fixed host: Stripe, Razorpay, Google, Apple, Supabase",
    hops: [
      {
        from: "Your app",
        to: "cb agent",
        proto: "TCP 127.0.0.1:7421",
        note: "the preload redirects api.stripe.com:443",
        side: "laptop",
      },
      {
        from: "cb agent",
        to: "cb gateway",
        proto: "WSS :443 /tunnel?layer=2",
        note: "the app's TLS inside, untouched",
        side: "tunnel",
      },
      {
        from: "cb gateway",
        to: "api.stripe.com",
        proto: "HTTPS :443",
        note: "new verified TLS, real key",
        side: "provider",
        real: true,
      },
    ],
  },
];

/** FR-DOC-010: the direct path versus cb's two ways in. The amber hop is the only one with the real key. */
export function ConnectionModes() {
  return (
    <DiagramFrame caption="Without cb the real key leaves the laptop. With cb it only exists on the last hop, from the cb server.">
      <div className="flex flex-col gap-5">
        {MODES.map((m) => (
          <div key={m.title}>
            <p className="text-[13px] font-semibold text-foreground">{m.title}</p>
            <p className="mb-2 text-[11px] text-subtle">{m.sub}</p>
            <HopStrip hops={m.hops} />
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
