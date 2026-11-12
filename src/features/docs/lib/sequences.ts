/**
 * FR-DOC-010: protocol walk-throughs drawn by the blog's sequence diagrams. Each is checked against the adapter specs
 * (PRD §10.8, §10.10). Invariant (test-enforced): a step that carries a real secret never touches a laptop lane.
 */
export type SequenceLane = { label: string; sub?: string; side: "laptop" | "server" | "service" };
export type SequenceStep = { from: number; to: number; label: string; real?: boolean };
export type SequenceSpec = { lanes: SequenceLane[]; steps: SequenceStep[]; label: string; caption: string };

const app = (label: string): SequenceLane => ({ label, sub: "in your app", side: "laptop" });
const agent = (sub: string): SequenceLane => ({ label: "cb agent", sub, side: "laptop" });

export const SEQUENCES = {
  https: {
    lanes: [
      app("Stripe SDK"),
      { label: "cb preload", sub: "tls.connect patched", side: "laptop" },
      agent("127.0.0.1:74xx"),
      { label: "Gateway", sub: "TLS terminator", side: "server" },
      { label: "HTTP adapter", sub: "swap + redact", side: "server" },
      { label: "api.stripe.com", side: "service" },
    ],
    steps: [
      { from: 0, to: 1, label: "connect api.stripe.com:443" },
      { from: 1, to: 2, label: "redirected to the agent" },
      { from: 2, to: 3, label: "bytes over wss:// /tunnel" },
      { from: 3, to: 0, label: "leaf cert for api.stripe.com (org CA)" },
      { from: 0, to: 4, label: "Authorization: Bearer stand-in" },
      { from: 4, to: 5, label: "same request, real key", real: true },
      { from: 5, to: 4, label: "response" },
      { from: 4, to: 0, label: "response, real values redacted" },
    ],
    label:
      "An HTTPS call: the SDK connects, the preload redirects it to the agent, the gateway terminates TLS with a certificate from the org CA, checks the stand-in, sends the request with the real key, and redacts the response",
    caption: "Layer 2 (HTTPS APIs): the hostname never changes, and only the last hop carries the real key.",
  },
  postgres: {
    lanes: [
      app("pg driver"),
      agent("127.0.0.1:7401"),
      { label: "Postgres adapter", sub: "cb gateway", side: "server" },
      { label: "Postgres", sub: "Neon, RDS…", side: "service" },
    ],
    steps: [
      { from: 0, to: 1, label: "SSLRequest → N, then StartupMessage" },
      { from: 1, to: 2, label: "piped through the tunnel" },
      { from: 2, to: 0, label: "AuthenticationCleartextPassword" },
      { from: 0, to: 2, label: "password = this device's stand-in" },
      { from: 2, to: 3, label: "TLS + SCRAM-SHA-256, real password", real: true },
      { from: 3, to: 2, label: "AuthenticationOk, ParameterStatus…" },
      { from: 2, to: 0, label: "AuthenticationOk, then raw bytes" },
    ],
    label:
      "A Postgres login: the driver sends the stand-in as its password to cb's gateway over the tunnel; the gateway checks it, signs in to the real database with SCRAM-SHA-256 and the real password, then passes bytes through",
    caption:
      "Layer 1 (databases): the stand-in only travels laptop → cb. The real password never leaves the cb server.",
  },
  mysql: {
    lanes: [
      app("mysql2"),
      agent("127.0.0.1:7403"),
      { label: "MySQL adapter", sub: "cb gateway", side: "server" },
      { label: "MySQL", sub: "TiDB, Aiven…", side: "service" },
    ],
    steps: [
      { from: 0, to: 2, label: "TCP connect (through the tunnel)" },
      { from: 2, to: 3, label: "connect upstream first" },
      { from: 3, to: 2, label: "real server greeting (version, flags)" },
      { from: 2, to: 0, label: "mirrored greeting, cb's own scramble" },
      { from: 0, to: 2, label: "mysql_native_password over the stand-in" },
      { from: 2, to: 3, label: "TLS, caching_sha2_password, real password", real: true },
      { from: 3, to: 2, label: "OK" },
      { from: 2, to: 0, label: "OK, then raw bytes" },
    ],
    label:
      "A MySQL login: the gateway reads the real server's greeting first, mirrors it to the driver with its own challenge, checks the stand-in, then completes the real login upstream",
    caption:
      "MySQL: your driver sees the real server's version and features, but answers cb's challenge, not the database's.",
  },
  mongodb: {
    lanes: [
      app("MongoDB driver"),
      agent("127.0.0.1:7401"),
      { label: "MongoDB adapter", sub: "SCRAM server", side: "server" },
      { label: "Atlas primary", sub: "found via SRV", side: "service" },
    ],
    steps: [
      { from: 0, to: 2, label: "hello (monitoring, no auth)" },
      { from: 2, to: 0, label: "hello reply (auth hints stripped)" },
      { from: 0, to: 2, label: "saslStart SCRAM-SHA-256, stand-in" },
      { from: 2, to: 0, label: "saslContinue… done (stand-in proven)" },
      { from: 2, to: 3, label: "SRV lookup, TLS to the primary" },
      { from: 2, to: 3, label: "SCRAM-SHA-256 with the real user", real: true },
      { from: 0, to: 3, label: "your queries, piped" },
    ],
    label:
      "A MongoDB login: the gateway acts as a SCRAM server towards the driver and checks the stand-in, then resolves the real cluster, connects to the primary over TLS and signs in with the real user",
    caption:
      "MongoDB: the driver gets a plain local URL; the SRV lookup and TLS to the cluster happen on the cb server.",
  },
  redis: {
    lanes: [
      app("ioredis"),
      agent("127.0.0.1:7404"),
      { label: "Redis adapter", sub: "cb gateway", side: "server" },
      { label: "Redis", sub: "Redis Cloud, Upstash", side: "service" },
    ],
    steps: [
      { from: 0, to: 2, label: "TCP connect (through the tunnel)" },
      { from: 2, to: 3, label: "TLS for rediss://, AUTH real user", real: true },
      { from: 3, to: 2, label: "+OK" },
      { from: 0, to: 2, label: "AUTH cbu_… stand-in" },
      { from: 2, to: 0, label: "+OK (answered by cb)" },
      { from: 0, to: 3, label: "GET / SET …, piped" },
    ],
    label:
      "A Redis login: the gateway signs in upstream with the real password first, then answers the client's AUTH itself after checking the stand-in, and pipes commands",
    caption: "Redis: the client's AUTH never reaches the real server; cb answers it.",
  },
  webhook: {
    lanes: [
      app("Your webhook route"),
      agent("posts to your port"),
      { label: "cb ingress", sub: "verify + route", side: "server" },
      { label: "Stripe", side: "service" },
    ],
    steps: [
      { from: 0, to: 3, label: "create PaymentIntent (via the gateway, owner recorded)" },
      { from: 3, to: 2, label: "POST /api/hooks/<id>, signed with the real secret", real: true },
      { from: 2, to: 3, label: "200 at once (stored encrypted, 24 h)" },
      { from: 2, to: 1, label: "event stream: re-signed with this device's stand-in" },
      { from: 1, to: 0, label: "POST 127.0.0.1:<port>/api/webhooks, bytes unchanged" },
      { from: 0, to: 1, label: "constructEvent passes; 200" },
      { from: 1, to: 2, label: "ack" },
    ],
    label:
      "A Stripe webhook: Stripe signs the event with the real secret and sends it to cb; cb verifies it, finds the device whose test created the object, re-signs it with that device's stand-in and the agent posts it to the app",
    caption:
      "Webhooks: the real signing secret is used once, at cb's door. Each developer gets only the events their own tests caused.",
  },
  googleSa: {
    lanes: [
      app("firebase-admin"),
      agent("127.0.0.1:74xx"),
      { label: "google-sa adapter", sub: "cb gateway", side: "server" },
      { label: "Google OAuth", sub: "oauth2.googleapis.com", side: "service" },
      { label: "FCM", sub: "fcm.googleapis.com", side: "service" },
    ],
    steps: [
      { from: 0, to: 0, label: "reads the stand-in key file (0600)" },
      { from: 0, to: 2, label: "token request: assertion signed with the stand-in key" },
      { from: 2, to: 3, label: "same scope, assertion signed with the real key", real: true },
      { from: 3, to: 2, label: "real access token (kept on the server)", real: true },
      { from: 2, to: 0, label: "stand-in token ya29.cb_…" },
      { from: 0, to: 2, label: "send(): Bearer ya29.cb_…" },
      { from: 2, to: 4, label: "Bearer real token", real: true },
    ],
    label:
      "A Firebase call: the SDK signs a token request with a stand-in key, the gateway re-signs it with the real key, keeps the real access token and returns a stand-in token, then swaps the real token in on each API call",
    caption:
      "Service accounts: two swaps. The real key signs the assertion, and the real token never leaves the server.",
  },
  awsPresigned: {
    lanes: [
      app("S3 client"),
      { label: "Your browser", sub: "same machine", side: "laptop" },
      agent("127.0.0.1:7409"),
      { label: "aws adapter", sub: "SigV4 verify + sign", side: "server" },
      { label: "Amazon S3", side: "service" },
    ],
    steps: [
      { from: 0, to: 0, label: "presign PUT, stand-in key, endpoint 127.0.0.1:7409" },
      { from: 0, to: 1, label: "URL handed to the page" },
      { from: 1, to: 2, label: "PUT the file to the presigned URL" },
      { from: 2, to: 3, label: "through the tunnel" },
      { from: 3, to: 4, label: "signature checked, re-signed with the real key", real: true },
      { from: 4, to: 3, label: "200 ETag" },
      { from: 3, to: 1, label: "200" },
    ],
    label:
      "A presigned S3 upload: the URL is signed with the stand-in key and points at the local agent; the browser uploads to it, and the gateway checks the signature and re-signs with the real key before sending it to S3",
    caption: "Presigned URLs work in your browser on your machine, and nowhere else: they point at your local agent.",
  },
  oauth: {
    lanes: [
      { label: "Your browser", side: "laptop" },
      app("Auth.js"),
      agent("127.0.0.1:74xx"),
      { label: "oauth adapter", sub: "cb gateway", side: "server" },
      { label: "Google", side: "service" },
    ],
    steps: [
      { from: 0, to: 4, label: "consent screen (directly, not through cb)" },
      { from: 4, to: 0, label: "redirect back with ?code=…" },
      { from: 0, to: 1, label: "GET /api/auth/callback/google" },
      { from: 1, to: 3, label: "POST /token: code + client_secret stand-in" },
      { from: 3, to: 4, label: "same request, real client_secret", real: true },
      { from: 4, to: 3, label: "tokens" },
      { from: 3, to: 1, label: "tokens; the app signs the user in" },
    ],
    label:
      "A Google sign-in: the browser talks to Google directly; only the server's token exchange goes through cb, where the stand-in client secret is replaced with the real one",
    caption: "Sign-in: your users' browsers never touch cb. Only the server-side code exchange is redirected.",
  },
  apns: {
    lanes: [
      app("node-apn"),
      agent("127.0.0.1:74xx"),
      { label: "apns adapter", sub: "HTTP/2", side: "server" },
      { label: "Apple Push", sub: "api.push.apple.com", side: "service" },
    ],
    steps: [
      { from: 0, to: 0, label: "provider token signed with the stand-in .p8" },
      { from: 0, to: 2, label: "HTTP/2 POST /3/device/…, stand-in token" },
      { from: 2, to: 2, label: "token checked with the stand-in public key" },
      { from: 2, to: 3, label: "same push, token signed with the real key", real: true },
      { from: 3, to: 2, label: "200 apns-id" },
      { from: 2, to: 0, label: "200 apns-id" },
    ],
    label:
      "An Apple push: the library signs its provider token with a stand-in key; the gateway checks it and sends the push with a token signed by the real key",
    caption: "Apple Push: the real .p8 key signs on the cb server; tokens are cached for up to 50 minutes.",
  },
} satisfies Record<string, SequenceSpec>;

export type SequenceName = keyof typeof SEQUENCES;
