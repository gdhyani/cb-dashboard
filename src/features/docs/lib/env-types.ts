/**
 * FR-DOC-010: every kind of env value cb supports, as the blog's type explorer shows it. Values follow the connector
 * docs ("What your app sees"), which follow the code; ports are examples from the agent's 7400–7999 range.
 *
 * Invariant (test-enforced): no hop on the laptop side, and no hop inside the tunnel, ever carries a real secret.
 * The one exception is "Shown as-is", whose env line is the real value by design.
 */

export type EnvKind = "plain" | "generated" | "stand-in" | "real";
export type Mode = "local" | "layer1" | "layer2" | "ingress";
export type Side = "laptop" | "tunnel" | "server" | "provider";

export type EnvLine = { key: string; value: string; kind: EnvKind };
export type Hop = { from: string; to: string; proto: string; note: string; side: Side; real?: boolean };

export type EnvType = {
  id: string;
  group: string;
  name: string;
  lines: EnvLine[];
  mode: Mode;
  hops: Hop[];
  /** What happens to the value, in one or two sentences. */
  how: string;
  /** Where the real value lives. */
  realLives: string;
  /** Providers verified end to end with a real account (PRD §17.4), or empty. */
  verified: string[];
};

export const MODE_LABEL: Record<Mode, string> = {
  local: "Local value: no traffic through cb",
  layer1: "Layer 1: a local URL points at the agent",
  layer2: "Layer 2: the real hostname is redirected",
  ingress: "Ingress: the provider calls cb, cb calls your app",
};

const LOOPBACK_TUNNEL: Hop = {
  from: "cb agent",
  to: "cb gateway",
  proto: "WSS to the cb server, port 443",
  note: "TLS; your bytes ride in WebSocket frames, unchanged",
  side: "tunnel",
};

const layer1 = (port: number, what: string, upstream: Hop): Hop[] => [
  { from: "Your app", to: "cb agent", proto: `TCP 127.0.0.1:${port}`, note: what, side: "laptop" },
  LOOPBACK_TUNNEL,
  upstream,
];

const layer2 = (host: string, port: number, upstream: Omit<Hop, "from" | "side" | "real">): Hop[] => [
  {
    from: "Your app",
    to: "cb agent",
    proto: `TCP 127.0.0.1:${port} (redirected)`,
    note: `the app's own TLS, SNI ${host}`,
    side: "laptop",
  },
  { ...LOOPBACK_TUNNEL, note: "the app's TLS travels inside, untouched" },
  { from: "cb gateway", side: "provider", real: true, ...upstream },
];

export const ENV_TYPES: EnvType[] = [
  // Local values
  {
    id: "port",
    group: "Local values",
    name: "Port number",
    lines: [{ key: "PORT", value: "3000", kind: "plain" }],
    mode: "local",
    hops: [],
    how: "Delivered as is. cb never routes your app's own server; webhooks find the port your app really listens on.",
    realLives: "In the app, by design (not a secret)",
    verified: [],
  },
  {
    id: "flag",
    group: "Local values",
    name: "Feature flag",
    lines: [{ key: "ENABLE_CHECKOUT_V2", value: "true", kind: "plain" }],
    mode: "local",
    hops: [],
    how: "Change it in the dashboard and every developer's `cb run` restarts the app with the new value within seconds.",
    realLives: "In the app, by design (not a secret)",
    verified: [],
  },
  {
    id: "public",
    group: "Local values",
    name: "Public URL or browser value",
    lines: [{ key: "NEXT_PUBLIC_APP_URL", value: "http://localhost:3000", kind: "plain" }],
    mode: "local",
    hops: [],
    how: "Delivered as is and baked into the browser bundle by the framework. The dashboard warns if a protected key has a browser prefix.",
    realLives: "In the app and the browser bundle (public)",
    verified: [],
  },
  {
    id: "random",
    group: "Local values",
    name: "Random secret",
    lines: [
      { key: "AUTH_SECRET", value: "q7Vx…= (base64:32)", kind: "generated" },
      { key: "JWT_SECRET", value: "9f2c4a…e81d (hex:64)", kind: "generated" },
    ],
    mode: "local",
    hops: [],
    how: "Made by cb for each developer and environment, the same on all their devices, different for everyone else. For secrets only your own app checks.",
    realLives: "Nowhere shared: there is no team value",
    verified: [],
  },
  {
    id: "visible",
    group: "Local values",
    name: "Secret shown as-is",
    lines: [{ key: "LEGACY_SIGNING_KEY", value: "the real value", kind: "real" }],
    mode: "local",
    hops: [],
    how: "The one exception: the real value reaches developers' apps. A last resort, marked with a warning everywhere.",
    realLives: "On the cb server, and on every laptop with access",
    verified: [],
  },
  // Databases
  {
    id: "postgres",
    group: "Databases",
    name: "PostgreSQL",
    lines: [
      {
        key: "DATABASE_URL",
        value: "postgresql://cbu_ab12cd34:…@127.0.0.1:7402/app?sslmode=disable",
        kind: "stand-in",
      },
    ],
    mode: "layer1",
    hops: layer1(7402, "Postgres wire protocol, stand-in password", {
      from: "cb gateway",
      to: "Postgres",
      proto: "TCP + TLS (verified), port 5432",
      note: "SCRAM-SHA-256 or MD5 with the real user",
      side: "provider",
      real: true,
    }),
    how: "The gateway asks your driver for its password, checks the stand-in, logs in to the real database itself and then copies bytes.",
    realLives: "cb server only, encrypted",
    verified: ["Neon"],
  },
  {
    id: "mysql",
    group: "Databases",
    name: "MySQL",
    lines: [{ key: "DATABASE_URL", value: "mysql://cbu_ab12cd34:…@127.0.0.1:7403/app", kind: "stand-in" }],
    mode: "layer1",
    hops: layer1(7403, "MySQL handshake mirrored from the real server", {
      from: "cb gateway",
      to: "MySQL",
      proto: "TCP + TLS when the URL asks, port 3306",
      note: "caching_sha2_password with the real password",
      side: "provider",
      real: true,
    }),
    how: "The gateway reads the real server's greeting first, mirrors it to your driver with its own challenge, checks the stand-in, then signs in for real.",
    realLives: "cb server only, encrypted",
    verified: ["TiDB Cloud", "Aiven (private CA)"],
  },
  {
    id: "mongodb",
    group: "Databases",
    name: "MongoDB",
    lines: [
      {
        key: "MONGODB_URI",
        value: "mongodb://cbu_ab12cd34:…@127.0.0.1:7401/shop?directConnection=true&authSource=admin",
        kind: "stand-in",
      },
    ],
    mode: "layer1",
    hops: layer1(7401, "MongoDB OP_MSG, SCRAM with the stand-in", {
      from: "cb gateway",
      to: "MongoDB primary",
      proto: "TCP + TLS, port 27017 (SRV looked up here)",
      note: "SCRAM-SHA-256 or SHA-1 with the real user",
      side: "provider",
      real: true,
    }),
    how: "Your driver gets a plain local URL even for mongodb+srv. The gateway acts as a SCRAM server towards it, resolves the real cluster and signs in to the primary.",
    realLives: "cb server only, encrypted",
    verified: ["MongoDB Atlas"],
  },
  {
    id: "redis",
    group: "Databases",
    name: "Redis",
    lines: [{ key: "REDIS_URL", value: "redis://cbu_ab12cd34:…@127.0.0.1:7404", kind: "stand-in" }],
    mode: "layer1",
    hops: layer1(7404, "RESP, AUTH with the stand-in", {
      from: "cb gateway",
      to: "Redis",
      proto: "TCP, plus TLS for rediss://",
      note: "AUTH with the real user and password",
      side: "provider",
      real: true,
    }),
    how: "The gateway signs in upstream first, answers your client's AUTH itself after checking the stand-in, then copies bytes.",
    realLives: "cb server only, encrypted",
    verified: ["Redis Cloud", "Upstash"],
  },
  {
    id: "supabase",
    group: "Databases",
    name: "Supabase",
    lines: [
      { key: "SUPABASE_SECRET_KEY", value: "sb_secret_cb_…", kind: "stand-in" },
      { key: "SUPABASE_URL", value: "https://abcd.supabase.co", kind: "plain" },
      { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: "sb_publishable_…", kind: "plain" },
    ],
    mode: "layer2",
    hops: layer2("abcd.supabase.co", 7405, {
      to: "abcd.supabase.co",
      proto: "HTTPS, port 443",
      note: "apikey and Authorization both swapped",
    }),
    how: "The project URL stays real and is redirected. The SDK sends the key in two headers; both are swapped. The public publishable key passes through untouched.",
    realLives: "cb server only, encrypted",
    verified: ["Supabase"],
  },
  // APIs over HTTPS
  {
    id: "stripe",
    group: "Payment and AI APIs",
    name: "Stripe API key",
    lines: [
      { key: "STRIPE_SECRET_KEY", value: "sk_test_cb_…", kind: "stand-in" },
      { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", value: "pk_test_…", kind: "plain" },
    ],
    mode: "layer2",
    hops: layer2("api.stripe.com", 7421, {
      to: "api.stripe.com",
      proto: "HTTPS, port 443",
      note: "Authorization: Bearer with the real key",
    }),
    how: "The SDK keeps calling api.stripe.com. The gateway ends the app's TLS with a certificate from your organisation's CA, swaps the key and opens its own verified TLS to Stripe.",
    realLives: "cb server only, encrypted",
    verified: ["Stripe"],
  },
  {
    id: "razorpay",
    group: "Payment and AI APIs",
    name: "Razorpay API key",
    lines: [
      { key: "RAZORPAY_KEY_ID", value: "rzp_test_…", kind: "plain" },
      { key: "RAZORPAY_KEY_SECRET", value: "cb_…", kind: "stand-in" },
    ],
    mode: "layer2",
    hops: layer2("api.razorpay.com", 7422, {
      to: "api.razorpay.com",
      proto: "HTTPS, port 443",
      note: "Basic auth with the real key secret",
    }),
    how: "Razorpay uses Basic auth: the public key ID stays real and the gateway replaces the password part.",
    realLives: "cb server only, encrypted",
    verified: ["Razorpay"],
  },
  {
    id: "ai",
    group: "Payment and AI APIs",
    name: "AI provider key",
    lines: [
      { key: "OPENAI_API_KEY", value: "sk-cb-…", kind: "stand-in" },
      { key: "OPENAI_BASE_URL", value: "http://127.0.0.1:7406/v1 (optional)", kind: "stand-in" },
    ],
    mode: "layer2",
    hops: layer2("api.openai.com", 7406, {
      to: "api.openai.com",
      proto: "HTTPS, port 443, streamed",
      note: "Bearer (or x-api-key) with the real key",
    }),
    how: "Works on the default host, or through a local base URL if your code reads one. Streaming answers (SSE, chunked) pass straight through.",
    realLives: "cb server only, encrypted",
    verified: ["OpenAI", "Gemini", "Groq", "OpenRouter"],
  },
  {
    id: "api",
    group: "Payment and AI APIs",
    name: "Any other API key",
    lines: [
      { key: "ACME_API_KEY", value: "cb_…", kind: "stand-in" },
      { key: "API_BASE_URL", value: "http://127.0.0.1:7411 (optional)", kind: "stand-in" },
    ],
    mode: "layer2",
    hops: layer2("api.acme.com", 7411, {
      to: "api.acme.com",
      proto: "HTTPS, port 443",
      note: "the header you chose, with the real key",
    }),
    how: "Choose the header (Bearer, Basic, x-api-key or any name) and the hosts; it can also carry a private CA and extra non-secret headers.",
    realLives: "cb server only, encrypted",
    verified: ["Clerk", "Resend"],
  },
  // Webhooks
  {
    id: "stripe-webhook",
    group: "Payment webhooks",
    name: "Stripe webhook secret",
    lines: [{ key: "STRIPE_WEBHOOK_SECRET", value: "whsec_cb_…", kind: "stand-in" }],
    mode: "ingress",
    hops: [
      {
        from: "Stripe",
        to: "cb ingress",
        proto: "HTTPS POST /api/hooks/<service>",
        note: "signed with the real secret, checked here",
        side: "provider",
        real: true,
      },
      {
        from: "cb server",
        to: "cb agent",
        proto: "event stream (HTTPS, server-sent events)",
        note: "only to the device that caused the event, re-signed",
        side: "tunnel",
      },
      {
        from: "cb agent",
        to: "Your app",
        proto: "HTTP POST 127.0.0.1:<your port>/<path>",
        note: "bytes unchanged; constructEvent passes with the stand-in",
        side: "laptop",
      },
    ],
    how: "One public cb URL per provider. cb checks Stripe's signature, finds whose test created the object and signs the event again for that developer.",
    realLives: "cb server only, encrypted",
    verified: ["Stripe snapshot and thin events", "Connect Stripe"],
  },
  {
    id: "razorpay-webhook",
    group: "Payment webhooks",
    name: "Razorpay webhook secret",
    lines: [{ key: "RAZORPAY_WEBHOOK_SECRET", value: "cb_…", kind: "stand-in" }],
    mode: "ingress",
    hops: [
      {
        from: "Razorpay",
        to: "cb ingress",
        proto: "HTTPS POST /api/hooks/<service>",
        note: "HMAC with the real secret, checked here",
        side: "provider",
        real: true,
      },
      {
        from: "cb server",
        to: "cb agent",
        proto: "event stream (HTTPS, server-sent events)",
        note: "to the device that made the payment, re-signed",
        side: "tunnel",
      },
      {
        from: "cb agent",
        to: "Your app",
        proto: "HTTP POST 127.0.0.1:<your port>/<path>",
        note: "validateWebhookSignature passes with the stand-in",
        side: "laptop",
      },
    ],
    how: "cb can make the signing secret for you, or set up the webhook in Razorpay itself with Connect.",
    realLives: "cb server only, encrypted",
    verified: ["Razorpay", "Connect Razorpay"],
  },
  // Cloud and email
  {
    id: "s3",
    group: "Cloud and email",
    name: "AWS S3 (and presigned URLs)",
    lines: [
      { key: "AWS_ACCESS_KEY_ID", value: "AKIACB…", kind: "stand-in" },
      { key: "AWS_SECRET_ACCESS_KEY", value: "40-character stand-in", kind: "stand-in" },
      { key: "AWS_REGION", value: "ap-southeast-1", kind: "plain" },
      { key: "AWS_ENDPOINT_URL_S3", value: "http://127.0.0.1:7409", kind: "stand-in" },
    ],
    mode: "layer1",
    hops: layer1(7409, "HTTP signed with SigV4 using the stand-in key", {
      from: "cb gateway",
      to: "s3.<region>.amazonaws.com",
      proto: "HTTPS, port 443",
      note: "signature checked, then re-signed with the real key",
      side: "provider",
      real: true,
    }),
    how: "The AWS SDK signs with the stand-in pair; the gateway checks that signature and signs again with the real one. Presigned links point at the local listener, so they work on your machine only.",
    realLives: "cb server only, encrypted",
    verified: ["AWS S3"],
  },
  {
    id: "ses",
    group: "Cloud and email",
    name: "AWS SES",
    lines: [
      { key: "AWS_ACCESS_KEY_ID", value: "AKIACB…", kind: "stand-in" },
      { key: "AWS_ENDPOINT_URL_SESV2", value: "http://127.0.0.1:7412", kind: "stand-in" },
    ],
    mode: "layer1",
    hops: layer1(7412, "SESv2 API call, SigV4 with the stand-in", {
      from: "cb gateway",
      to: "email.<region>.amazonaws.com",
      proto: "HTTPS, port 443",
      note: "re-signed with the real key",
      side: "provider",
      real: true,
    }),
    how: "Same re-signing as S3. Choosing the SES service fills the endpoint and the variable the AWS SDK reads.",
    realLives: "cb server only, encrypted",
    verified: ["AWS SES"],
  },
  {
    id: "smtp",
    group: "Cloud and email",
    name: "SMTP email",
    lines: [{ key: "SMTP_URL", value: "smtp://cbu_ab12cd34:…@127.0.0.1:7410", kind: "stand-in" }],
    mode: "layer1",
    hops: layer1(7410, "SMTP, AUTH PLAIN or LOGIN with the stand-in", {
      from: "cb gateway",
      to: "smtp.provider.com",
      proto: "SMTP with STARTTLS or TLS",
      note: "real login, then the message is relayed",
      side: "provider",
      real: true,
    }),
    how: "The gateway speaks SMTP to your mailer, checks the stand-in login and relays the message with the real one, returning the provider's reply code.",
    realLives: "cb server only, encrypted",
    verified: ["Resend SMTP"],
  },
  // Sign-in, key files and push
  {
    id: "signin",
    group: "Sign-in, key files and push",
    name: "Google or GitHub sign-in secret",
    lines: [
      { key: "AUTH_GOOGLE_ID", value: "1234567890-abc.apps.googleusercontent.com", kind: "plain" },
      { key: "AUTH_GOOGLE_SECRET", value: "cb-…", kind: "stand-in" },
    ],
    mode: "layer2",
    hops: layer2("oauth2.googleapis.com", 7425, {
      to: "oauth2.googleapis.com",
      proto: "HTTPS, port 443",
      note: "client_secret replaced on the token call only",
    }),
    how: "The browser's sign-in pages go to Google directly. Only your server's token exchange is redirected, and only its client_secret is swapped.",
    realLives: "cb server only, encrypted",
    verified: ["Google", "GitHub"],
  },
  {
    id: "firebase",
    group: "Sign-in, key files and push",
    name: "Firebase service account (key file)",
    lines: [
      {
        key: "GOOGLE_APPLICATION_CREDENTIALS",
        value: "~/.cb/fake/…/GOOGLE_APPLICATION_CREDENTIALS.json",
        kind: "stand-in",
      },
      { key: "FIREBASE_PROJECT_ID", value: "acme-shop", kind: "plain" },
    ],
    mode: "layer2",
    hops: layer2("oauth2.googleapis.com", 7423, {
      to: "Google OAuth, then fcm.googleapis.com",
      proto: "HTTPS, port 443",
      note: "real assertion for a real token, swapped on each call",
    }),
    how: "The agent writes a stand-in key file (0600) with a key made for this device. Google token requests get a stand-in token; the real token is swapped in on every API call.",
    realLives: "cb server only, encrypted (file store)",
    verified: ["Firebase / FCM"],
  },
  {
    id: "apns",
    group: "Sign-in, key files and push",
    name: "Apple Push key (.p8)",
    lines: [
      { key: "APNS_KEY", value: "-----BEGIN PRIVATE KEY----- … (stand-in)", kind: "stand-in" },
      { key: "APNS_KEY_ID", value: "ABC123DEFG", kind: "plain" },
    ],
    mode: "layer2",
    hops: layer2("api.push.apple.com", 7424, {
      to: "api.push.apple.com",
      proto: "HTTP/2 over TLS, port 443",
      note: "provider token re-signed with the real key",
    }),
    how: "Your push library signs its provider token with the stand-in P-256 key; the gateway checks it and sends a token signed with the real key.",
    realLives: "cb server only, encrypted (file store)",
    verified: [],
  },
];

export const ENV_TYPE_GROUPS = [...new Set(ENV_TYPES.map((t) => t.group))];
