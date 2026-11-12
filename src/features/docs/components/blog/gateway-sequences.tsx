import { SequenceDiagram, type SequenceLane, type SequenceStep } from "./sequence-diagram";

const HTTPS_LANES: SequenceLane[] = [
  { label: "Stripe SDK", sub: "in your app", side: "laptop" },
  { label: "cb preload", sub: "tls.connect patched", side: "laptop" },
  { label: "cb agent", sub: "127.0.0.1:74xx", side: "laptop" },
  { label: "Gateway", sub: "TLS terminator", side: "server" },
  { label: "HTTP adapter", sub: "swap + redact", side: "server" },
  { label: "api.stripe.com", side: "service" },
];

const HTTPS_STEPS: SequenceStep[] = [
  { from: 0, to: 1, label: "connect api.stripe.com:443" },
  { from: 1, to: 2, label: "redirected to the agent" },
  { from: 2, to: 3, label: "bytes over wss:// /tunnel" },
  { from: 3, to: 0, label: "leaf cert for api.stripe.com (org CA)" },
  { from: 0, to: 4, label: "Authorization: Bearer stand-in" },
  { from: 4, to: 5, label: "same request, real key", real: true },
  { from: 5, to: 4, label: "response" },
  { from: 4, to: 0, label: "response, real values redacted" },
];

/** FR-DOC-010: one HTTPS call (Layer 2), from the official SDK to the provider and back. */
export function HttpsPathSequence() {
  return (
    <SequenceDiagram
      lanes={HTTPS_LANES}
      steps={HTTPS_STEPS}
      label="An HTTPS call: the SDK connects, the preload redirects it to the agent, the gateway terminates TLS with a certificate from the org CA, checks the stand-in, sends the request with the real key, and redacts the response"
      caption="Layer 2 (HTTPS APIs): the hostname never changes, and only the last hop carries the real key."
    />
  );
}

const PG_LANES: SequenceLane[] = [
  { label: "pg driver", sub: "in your app", side: "laptop" },
  { label: "cb agent", sub: "127.0.0.1:7401", side: "laptop" },
  { label: "Postgres adapter", sub: "cb gateway", side: "server" },
  { label: "Postgres", sub: "Neon, RDS…", side: "service" },
];

const PG_STEPS: SequenceStep[] = [
  { from: 0, to: 1, label: "StartupMessage (user, database)" },
  { from: 1, to: 2, label: "piped through the tunnel" },
  { from: 2, to: 0, label: "AuthenticationCleartextPassword" },
  { from: 0, to: 2, label: "password = this device's stand-in" },
  { from: 2, to: 3, label: "TLS + SCRAM-SHA-256, real password", real: true },
  { from: 3, to: 2, label: "AuthenticationOk" },
  { from: 2, to: 0, label: "AuthenticationOk, then raw bytes" },
];

/** FR-DOC-010: a Postgres login (Layer 1): the gateway signs in upstream, then becomes a byte pipe. */
export function PostgresLoginSequence() {
  return (
    <SequenceDiagram
      lanes={PG_LANES}
      steps={PG_STEPS}
      label="A Postgres login: the driver sends the stand-in as its password to cb's gateway over the tunnel; the gateway checks it, signs in to the real database with SCRAM-SHA-256 and the real password, then passes bytes through"
      caption="Layer 1 (databases): the stand-in only travels laptop → cb. The real password never leaves the cb server."
    />
  );
}
