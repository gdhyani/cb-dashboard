import type { ResourceKind } from "@/features/resources";

/**
 * Unified Variables (PRD v1.26): every "What is this?" type, what it asks for, and how it maps to the API.
 * Field names are the backend's resource field names, so a draft maps to a request without translation.
 */

export type TypeId =
  | "plain"
  | "gen"
  | "visible"
  | "mongodb"
  | "postgres"
  | "mysql"
  | "redis"
  | "supabase"
  | "stripe"
  | "razorpay"
  | "webhook"
  | "ai"
  | "oauth"
  | "gcp"
  | "apns"
  | "aws"
  | "smtp"
  | "http";

/** A simple-icons slug, or "letter:XY" for a text badge. */
export type IconId = string;

export interface ProviderDef {
  id: string;
  name: string;
  presetId?: string;
  icon: IconId;
  placeholder: string;
  /** Extra key suggested for SDKs that read a base URL. */
  baseUrlKey: string;
  /** Greyed example in the Key field (never filled in, D2). */
  keyExample?: string;
}

export interface FieldDef {
  name: string;
  label: string;
  secret?: boolean;
  multiline?: boolean;
  select?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  defaultValue?: string;
  /** A message when the value is unusable (shown under the field; Save stays off). Empty values are not checked. */
  validate?: (value: string) => string | undefined;
  /** Only shown when another field has this value (e.g. authHeader when authScheme is "header"). */
  showWhen?: { field: string; equals: string };
  /** The value can also be chosen or dropped as a file (key files, CA certificates). */
  file?: { accept: string; maxBytes: number };
  /** Asked in the form but never sent to the service; it feeds a plain extra via defaultFrom. */
  formOnly?: boolean;
}

// Checks for uploaded key / certificate files. They name the problem, never the content (B4).
const PEM_CERT = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/;
const PEM_PRIVATE = /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/;
const looksJson = (v: string) => v.trimStart().startsWith("{");

export function checkServiceAccount(value: string): string | undefined {
  if (PEM_CERT.test(value)) return "This is a certificate, not a service-account key file.";
  let sa: Record<string, unknown>;
  try {
    sa = JSON.parse(value) as Record<string, unknown>;
  } catch {
    return "This isn't a JSON key file. Download it from Firebase → Project settings → Service accounts → Generate new private key.";
  }
  if (sa.type !== undefined && sa.type !== "service_account")
    return "This JSON is not a service-account key (its type is not service_account).";
  for (const field of ["project_id", "client_email", "private_key"])
    if (typeof sa[field] !== "string" || !sa[field]) return `The key file has no ${field}.`;
  return undefined;
}

export function checkCertificate(value: string): string | undefined {
  if (looksJson(value)) return "This is a JSON file, not a certificate.";
  if (PEM_PRIVATE.test(value))
    return "This file holds a private key. Use the provider's CA certificate (ca.pem) — never a private key.";
  if (!PEM_CERT.test(value)) return "This isn't a PEM certificate (-----BEGIN CERTIFICATE-----).";
  return undefined;
}

export function checkP8(value: string): string | undefined {
  if (PEM_CERT.test(value)) return "This is a certificate, not an Apple .p8 key.";
  if (!PEM_PRIVATE.test(value)) return "This isn't an Apple .p8 key (-----BEGIN PRIVATE KEY-----).";
  return undefined;
}

/** D3: database hosts whose certificates are signed by the provider's own CA (Aiven, DigitalOcean …). */
const PRIVATE_CA_HOSTS = /\.(aivencloud\.com|ondigitalocean\.com|db\.ondigitalocean\.com)$/i;
export function privateCaProvider(url: string): string | undefined {
  try {
    const host = new URL(url.trim()).hostname;
    if (!PRIVATE_CA_HOSTS.test(host)) return undefined;
    return /aivencloud/i.test(host) ? "Aiven" : "DigitalOcean";
  } catch {
    return undefined;
  }
}

export interface ExtraDef {
  suggestedKey: string;
  what: string;
  /** Brokered field of the service; omitted for a plain value the admin types. */
  field?: string;
  preticked?: boolean;
  placeholder?: string;
  /** A plain extra left empty takes this field's value (e.g. RAZORPAY_KEY_ID ← the Key ID). */
  defaultFrom?: string;
}

export type TypeGroup = "Basic" | "Databases" | "Payments" | "AI" | "Sign-in & push" | "Cloud & email" | "Other";

export interface TypeDef {
  id: TypeId;
  name: string;
  /** Used in titles: "Add <title> variable". */
  title: string;
  /** Greyed example in the Key field; a provider's own example wins (D2: never filled in). */
  keyExample: string;
  group: TypeGroup;
  desc: string;
  icon: IconId;
  kind?: ResourceKind;
  presetId?: string;
  providers?: ProviderDef[];
  /** What the provider choice is called ("Provider" unless set, e.g. "Service" for AWS). */
  providerLabel?: string;
  value?: FieldDef;
  /** Whether the real value must be typed: optional (Stripe webhook: Connect fills it) or none (cb makes it). */
  valueMode?: (provider?: string) => "required" | "optional" | "none";
  required: (provider?: string) => FieldDef[];
  extras: (provider?: string) => ExtraDef[];
  advanced: (provider?: string) => FieldDef[];
}

export const KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

/** D2: the admin's own name, just upper-cased and joined with underscores. */
export function normalizeKey(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

/** Mirrors the backend's MAIN_FIELD: the variable that carries a service's secret. */
export const MAIN_FIELD: Record<ResourceKind, string> = {
  mongodb: "url",
  redis: "url",
  postgres: "url",
  mysql: "url",
  smtp: "url",
  http: "key",
  oauth: "clientSecret",
  aws: "secretAccessKey",
  "google-sa": "credentialsJson",
  apns: "key",
  webhook: "secret",
};

const none = () => [];
const CA_CERT: FieldDef = {
  name: "caCert",
  label: "CA certificate (PEM)",
  multiline: true,
  optional: true,
  hint: "Only for self-hosted servers or providers that give you a CA file (Aiven, DigitalOcean).",
  validate: checkCertificate,
  file: { accept: ".pem,.crt,.cer", maxBytes: 32_000 },
};
const AUTH_SCHEME: FieldDef = {
  name: "authScheme",
  label: "How the key is sent",
  defaultValue: "bearer",
  select: [
    { value: "bearer", label: "Authorization: Bearer <key>" },
    { value: "x-api-key", label: "x-api-key header" },
    { value: "header", label: "Another header…" },
    { value: "basic-password", label: "Basic auth (key as password)" },
  ],
};
const AUTH_HEADER: FieldDef = {
  name: "authHeader",
  label: "Header name",
  placeholder: "x-goog-api-key",
  showWhen: { field: "authScheme", equals: "header" },
};
const BASIC_USER: FieldDef = {
  name: "basicUser",
  label: "Username",
  optional: true,
  hint: "Public part of Basic auth (often a key ID); the key above is the password.",
  showWhen: { field: "authScheme", equals: "basic-password" },
};

/** OQ9: headers the backend refuses (the key and transport headers are set by cb). */
const RESERVED_HEADERS = new Set([
  "authorization",
  "proxy-authorization",
  "x-api-key",
  "cookie",
  "host",
  "content-length",
  "transfer-encoding",
  "connection",
  "upgrade",
  "te",
  "keep-alive",
]);

/** "Name: value" per line → headers, or the first problem. */
export function parseHeaderLines(raw: string): { headers?: Record<string, string>; error?: string } {
  const headers: Record<string, string> = {};
  for (const line of raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)) {
    const i = line.indexOf(":");
    const name = line.slice(0, i).trim();
    if (i <= 0 || !/^[A-Za-z0-9][A-Za-z0-9-]{0,63}$/.test(name)) return { error: "Use one Name: value per line." };
    if (RESERVED_HEADERS.has(name.toLowerCase()))
      return { error: `${name} is set by cb — put keys in the value above.` };
    headers[name] = line.slice(i + 1).trim();
  }
  if (Object.keys(headers).length > 10) return { error: "At most 10 headers." };
  return { headers };
}

export const formatHeaderLines = (h: unknown): string =>
  h && typeof h === "object"
    ? Object.entries(h as Record<string, string>)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

const EXTRA_HEADERS: FieldDef = {
  name: "extraHeaders",
  label: "Extra headers",
  multiline: true,
  optional: true,
  placeholder: "OpenAI-Organization: org_123",
  hint: "Sent on every call, one Name: value per line. Not for keys — the key goes in the value above.",
  validate: (v) => parseHeaderLines(v).error,
};
const API_CA_CERT: FieldDef = {
  ...CA_CERT,
  hint: "Only for internal APIs that use a private certificate authority.",
};

const db = (
  id: TypeId,
  name: string,
  kind: ResourceKind,
  icon: IconId,
  placeholder: string,
  keyExample: string,
): TypeDef => ({
  id,
  name,
  title: name,
  keyExample,
  group: "Databases",
  desc: "connection URL",
  icon,
  kind,
  value: { name: "connectionUri", label: "Connection URL", secret: true, placeholder },
  required: none,
  extras: none,
  advanced: () => [CA_CERT],
});

export const AI_PROVIDERS: ProviderDef[] = [
  {
    id: "openai",
    name: "OpenAI",
    presetId: "openai",
    keyExample: "OPENAI_API_KEY",
    icon: "letter:AI",
    placeholder: "sk-proj-…",
    baseUrlKey: "OPENAI_BASE_URL",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    presetId: "anthropic",
    keyExample: "ANTHROPIC_API_KEY",
    icon: "anthropic",
    placeholder: "sk-ant-…",
    baseUrlKey: "ANTHROPIC_BASE_URL",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    presetId: "gemini",
    keyExample: "GEMINI_API_KEY",
    icon: "googlegemini",
    placeholder: "AIza…",
    baseUrlKey: "GEMINI_BASE_URL",
  },
  {
    id: "groq",
    name: "Groq",
    presetId: "groq",
    keyExample: "GROQ_API_KEY",
    icon: "letter:Gq",
    placeholder: "gsk_…",
    baseUrlKey: "GROQ_BASE_URL",
  },
  {
    id: "mistral",
    name: "Mistral",
    presetId: "mistral",
    keyExample: "MISTRAL_API_KEY",
    icon: "mistralai",
    placeholder: "the API key",
    baseUrlKey: "MISTRAL_BASE_URL",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    presetId: "openrouter",
    keyExample: "OPENROUTER_API_KEY",
    icon: "openrouter",
    placeholder: "sk-or-…",
    baseUrlKey: "OPENROUTER_BASE_URL",
  },
  {
    id: "custom",
    name: "Custom / self-hosted",
    keyExample: "LLM_API_KEY",
    icon: "letter:⌂",
    placeholder: "the key your server expects",
    baseUrlKey: "LLM_BASE_URL",
  },
];

export const OAUTH_PROVIDERS: ProviderDef[] = [
  {
    id: "google",
    name: "Google",
    presetId: "google-oauth",
    keyExample: "GOOGLE_CLIENT_SECRET",
    icon: "google",
    placeholder: "GOCSPX-…",
    baseUrlKey: "GOOGLE_CLIENT_ID",
  },
  {
    id: "github",
    name: "GitHub",
    presetId: "github-oauth",
    keyExample: "GITHUB_CLIENT_SECRET",
    icon: "github",
    placeholder: "the client secret",
    baseUrlKey: "GITHUB_CLIENT_ID",
  },
  {
    id: "custom",
    name: "Other (any OAuth provider)",
    keyExample: "OAUTH_CLIENT_SECRET",
    icon: "letter:ID",
    placeholder: "the client secret",
    baseUrlKey: "OAUTH_CLIENT_ID",
  },
];

const providerOf = (list: ProviderDef[], id?: string) => list.find((p) => p.id === id) ?? list[0];

/** D2: the greyed example in the Key field for this type and provider. A placeholder only — never typed in. */
export function keyExample(type: TypeId, provider?: string): string {
  const def = TYPES[type];
  return (def.providers && providerOf(def.providers, provider)?.keyExample) || def.keyExample;
}

/**
 * AWS: which API the key is for. cb sends each AWS variable's requests to one endpoint, so the choice fills the endpoint
 * (from the region) and suggests the variable the AWS SDK reads for that service's endpoint.
 */
// Amazon SQS is hidden for now (PRD v1.46); variables saved with it still show as "AWS · SQS" (group.ts).
export const AWS_SERVICES: ProviderDef[] = [
  { id: "s3", name: "Amazon S3", icon: "aws", placeholder: "the secret access key", baseUrlKey: "" },
  { id: "ses", name: "Amazon SES (email)", icon: "aws", placeholder: "the secret access key", baseUrlKey: "" },
  {
    id: "compatible",
    name: "S3-compatible (R2, MinIO, Backblaze)",
    icon: "aws",
    placeholder: "the secret access key",
    baseUrlKey: "",
  },
];
const AWS_HOST: Record<string, string> = { s3: "s3", ses: "email", sqs: "sqs" };
/** The AWS endpoint for a service in a region (S3-compatible storage has its own). */
export const awsEndpoint = (service: string | undefined, region: string) =>
  AWS_HOST[service ?? "s3"] ? `https://${AWS_HOST[service ?? "s3"]}.${region}.amazonaws.com` : undefined;
function awsEndpointExtras(p?: string): ExtraDef[] {
  const endpoint = (suggestedKey: string, what: string, preticked = true): ExtraDef => ({
    suggestedKey,
    what,
    field: "endpoint",
    preticked,
  });
  if (p === "ses")
    return [
      endpoint("AWS_ENDPOINT_URL_SESV2", "Endpoint for SESv2Client (a local URL set by cb)"),
      endpoint("AWS_ENDPOINT_URL_SES", "Endpoint for the classic SESClient", false),
    ];
  if (p === "sqs") return [endpoint("AWS_ENDPOINT_URL_SQS", "Endpoint for SQSClient (a local URL set by cb)")];
  if (p === "compatible") return [endpoint("AWS_ENDPOINT_URL", "Endpoint (a local URL set by cb)")];
  return [endpoint("AWS_ENDPOINT_URL_S3", "Endpoint for S3Client (a local URL set by cb)")];
}

/** FR-WH-001: where each provider shows the signing secret (and takes the URL). */
export const WEBHOOK_PROVIDERS: ProviderDef[] = [
  {
    id: "stripe",
    name: "Stripe",
    icon: "stripe",
    placeholder: "whsec_…",
    baseUrlKey: "",
    keyExample: "STRIPE_WEBHOOK_SECRET",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    icon: "razorpay",
    placeholder: "the secret you set on the webhook",
    baseUrlKey: "",
    keyExample: "RAZORPAY_WEBHOOK_SECRET",
  },
];

export const TYPES: Record<TypeId, TypeDef> = {
  plain: {
    id: "plain",
    name: "Plain value",
    title: "",
    keyExample: "NEXT_PUBLIC_APP_URL",
    group: "Basic",
    desc: "shown as-is",
    icon: "letter:Aa",
    value: { name: "value", label: "Value", placeholder: "value" },
    required: none,
    extras: none,
    advanced: none,
  },
  gen: {
    id: "gen",
    name: "Random secret",
    title: "random secret",
    keyExample: "SESSION_SECRET",
    group: "Basic",
    desc: "different per developer",
    icon: "secret",
    required: none,
    extras: none,
    advanced: none,
  },
  visible: {
    id: "visible",
    name: "Secret shown as-is",
    title: "secret shown as-is",
    keyExample: "LICENSE_KEY",
    group: "Basic",
    desc: "last resort",
    icon: "letter:!",
    value: { name: "value", label: "Value", secret: true },
    required: none,
    extras: none,
    advanced: none,
  },
  mongodb: db(
    "mongodb",
    "MongoDB",
    "mongodb",
    "mongodb",
    "mongodb+srv://user:password@cluster0.xxxx.mongodb.net/db",
    "MONGODB_URI",
  ),
  postgres: db(
    "postgres",
    "Postgres",
    "postgres",
    "postgresql",
    "postgresql://user:password@host:5432/db",
    "DATABASE_URL",
  ),
  mysql: db("mysql", "MySQL", "mysql", "mysql", "mysql://user:password@host:3306/db", "DATABASE_URL"),
  redis: db("redis", "Redis", "redis", "redis", "rediss://default:password@host:6379", "REDIS_URL"),
  supabase: {
    id: "supabase",
    name: "Supabase",
    title: "Supabase",
    keyExample: "SUPABASE_SECRET_KEY",
    group: "Databases",
    desc: "secret key + project URL",
    icon: "supabase",
    kind: "http",
    presetId: "supabase",
    value: {
      name: "apiKey",
      label: "Secret key",
      secret: true,
      placeholder: "sb_secret_…",
      validate: (v) =>
        v.startsWith("sb_publishable_")
          ? "That is the publishable key; paste the secret key (sb_secret_… or the service_role key)."
          : undefined,
    },
    required: () => [
      {
        name: "upstreamUrl",
        label: "Project URL",
        placeholder: "https://<project-ref>.supabase.co",
        validate: (v) =>
          /^https:\/\/[^\s/]+\/?$/.test(v) ? undefined : "Use your project URL, e.g. https://abcd.supabase.co",
        hint: "Supabase → Project Settings → API. The publishable key keeps working as it is.",
      },
    ],
    extras: () => [
      { suggestedKey: "SUPABASE_URL", what: "Project URL (public)", preticked: true, defaultFrom: "upstreamUrl" },
      {
        suggestedKey: "NEXT_PUBLIC_SUPABASE_URL",
        what: "Project URL for the browser (public)",
        defaultFrom: "upstreamUrl",
      },
      {
        suggestedKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        what: "Publishable key (public)",
        placeholder: "sb_publishable_…",
      },
    ],
    advanced: none,
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    title: "Stripe",
    keyExample: "STRIPE_SECRET_KEY",
    group: "Payments",
    desc: "secret key",
    icon: "stripe",
    kind: "http",
    presetId: "stripe",
    value: { name: "apiKey", label: "Secret key", secret: true, placeholder: "sk_live_… or sk_test_…" },
    required: none,
    extras: () => [
      {
        suggestedKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        what: "Publishable key (public)",
        placeholder: "pk_live_…",
      },
    ],
    advanced: none,
  },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    title: "Razorpay",
    keyExample: "RAZORPAY_KEY_SECRET",
    group: "Payments",
    desc: "key secret",
    icon: "razorpay",
    kind: "http",
    presetId: "razorpay",
    value: { name: "apiKey", label: "Key secret", secret: true },
    required: () => [
      {
        name: "basicUser",
        label: "Key ID",
        placeholder: "rzp_live_…",
        hint: "Public. Razorpay checks it together with the key secret.",
      },
    ],
    extras: () => [
      {
        suggestedKey: "RAZORPAY_KEY_ID",
        what: "Key ID (public) — same as above unless you type another",
        preticked: true,
        placeholder: "rzp_live_…",
        defaultFrom: "basicUser",
      },
    ],
    advanced: none,
  },
  webhook: {
    id: "webhook",
    name: "Webhook signing secret",
    title: "webhook",
    keyExample: "STRIPE_WEBHOOK_SECRET",
    group: "Payments",
    desc: "verifies payment webhooks",
    icon: "letter:WH",
    kind: "webhook",
    providers: WEBHOOK_PROVIDERS,
    value: {
      name: "signingSecret",
      label: "Signing secret",
      secret: true,
      optional: true,
      hint: "Leave empty and cb creates the webhook in Stripe for you after saving (Connect Stripe).",
      validate: (v) => (v.startsWith("whsec_") ? undefined : "A Stripe signing secret starts with whsec_."),
    },
    // Stripe: Connect fills it; Razorpay: cb makes the secret and shows it once after saving.
    valueMode: (p) => (p === "razorpay" ? "none" : "optional"),
    required: () => [
      {
        name: "path",
        label: "Path in your app",
        placeholder: "/api/webhooks/stripe",
        validate: (v) =>
          /^\/(?!\/)[^\s?#\\]*(\?[^\s#]*)?$/.test(v)
            ? undefined
            : "Start with /, e.g. /api/webhooks/stripe (no spaces).",
        hint: "cb posts each webhook here on the developer's machine, on the port their app listens on.",
      },
    ],
    extras: (p) =>
      p === "razorpay"
        ? []
        : [
            {
              suggestedKey: "STRIPE_THIN_WEBHOOK_SECRET",
              what: "Only if your app verifies thin events with their own env var",
              field: "thinSecret",
            },
          ],
    advanced: (p) =>
      p === "razorpay"
        ? []
        : [
            {
              name: "thinSigningSecret",
              label: "Thin events signing secret",
              secret: true,
              optional: true,
              placeholder: "whsec_…",
              validate: (v) => (v.startsWith("whsec_") ? undefined : "A Stripe signing secret starts with whsec_."),
              hint: "From a thin-events destination in Stripe that uses this same URL.",
            },
            {
              name: "thinPath",
              label: "Thin events path",
              optional: true,
              placeholder: "/api/webhooks/stripe-thin",
              validate: (v) => (v.startsWith("/") ? undefined : "Start with /, e.g. /api/webhooks/stripe-thin."),
              hint: "Only if your app takes thin events on a different route. Default: the path above.",
            },
          ],
  },
  ai: {
    id: "ai",
    name: "AI API key",
    title: "AI",
    keyExample: "OPENAI_API_KEY",
    group: "AI",
    desc: "OpenAI, Anthropic, Gemini, self-hosted…",
    icon: "letter:AI",
    kind: "http",
    providers: AI_PROVIDERS,
    value: { name: "apiKey", label: "API key", secret: true },
    required: (p) =>
      p === "custom"
        ? [
            {
              name: "upstreamUrl",
              label: "Base URL",
              placeholder: "http://10.0.4.12:8000/v1",
              hint: "Where your model server listens. Private IPs may use http://; cb's server must be able to reach it.",
            },
            {
              name: "model",
              label: "Model name",
              placeholder: "llama3.1:8b",
              hint: "The model your app asks the server for. Saved as a plain value; change it any time.",
              formOnly: true,
            },
            AUTH_SCHEME,
            AUTH_HEADER,
            BASIC_USER,
          ]
        : [],
    extras: (p) => [
      {
        suggestedKey: providerOf(AI_PROVIDERS, p)?.baseUrlKey ?? "LLM_BASE_URL",
        what:
          p === "custom" ? "Base URL your app calls (a local URL set by cb)" : "Base URL, only if your code reads one",
        field: "baseUrl",
        preticked: p === "custom",
      },
      ...(p === "custom"
        ? [
            {
              suggestedKey: "LLM_MODEL",
              what: "Model name (public) — the one above",
              preticked: true,
              defaultFrom: "model",
            },
          ]
        : []),
    ],
    advanced: (p) =>
      p === "custom"
        ? []
        : [
            {
              name: "upstreamUrl",
              label: "Different endpoint",
              optional: true,
              placeholder: "https://my-proxy.example.com",
              hint: "Azure OpenAI, a company proxy, or a regional endpoint instead of the default.",
            },
            EXTRA_HEADERS,
          ],
  },
  oauth: {
    id: "oauth",
    name: "Sign-in client secret",
    title: "sign-in",
    keyExample: "GOOGLE_CLIENT_SECRET",
    group: "Sign-in & push",
    desc: "Google, GitHub, any OAuth",
    icon: "letter:ID",
    kind: "oauth",
    providers: OAUTH_PROVIDERS,
    value: { name: "clientSecret", label: "Client secret", secret: true },
    required: (p) =>
      p === "custom"
        ? [{ name: "tokenUrl", label: "Token URL", placeholder: "https://auth.example.com/oauth/token" }]
        : [],
    extras: (p) => [
      { suggestedKey: providerOf(OAUTH_PROVIDERS, p)?.baseUrlKey ?? "OAUTH_CLIENT_ID", what: "Client ID (public)" },
    ],
    advanced: none,
  },
  gcp: {
    id: "gcp",
    name: "Google service account",
    title: "Google service account",
    keyExample: "FIREBASE_SERVICE_ACCOUNT",
    group: "Sign-in & push",
    desc: "Firebase, FCM, GCP",
    icon: "googlecloud",
    kind: "google-sa",
    value: {
      name: "serviceAccountJson",
      label: "Service account JSON",
      secret: true,
      multiline: true,
      validate: checkServiceAccount,
      file: { accept: ".json,application/json", maxBytes: 16_000 },
    },
    required: () => [
      {
        name: "readsAs",
        label: "Your app reads it as",
        defaultValue: "json",
        select: [
          { value: "json", label: "The whole JSON, in this variable" },
          { value: "privateKey", label: "Only the private key (PEM)" },
          { value: "file", label: "A file path (GOOGLE_APPLICATION_CREDENTIALS)" },
        ],
      },
    ],
    extras: () => [
      { suggestedKey: "FIREBASE_PROJECT_ID", what: "Project ID, read from the JSON", field: "projectId" },
      { suggestedKey: "FIREBASE_CLIENT_EMAIL", what: "Client email, read from the JSON", field: "clientEmail" },
    ],
    advanced: () => [
      {
        name: "redirectHosts",
        label: "Extra Google hosts",
        optional: true,
        placeholder: "firestore.googleapis.com:443",
        hint: "Comma-separated host:port, only if you call more than FCM and sign-in.",
      },
    ],
  },
  apns: {
    id: "apns",
    name: "Apple push key",
    title: "Apple push",
    keyExample: "APNS_KEY",
    group: "Sign-in & push",
    desc: "APNs .p8",
    icon: "apple",
    kind: "apns",
    value: {
      name: "privateKey",
      label: ".p8 key",
      secret: true,
      multiline: true,
      validate: checkP8,
      file: { accept: ".p8,.pem", maxBytes: 8_000 },
    },
    required: () => [
      { name: "keyId", label: "Key ID", placeholder: "ABC123DEFG" },
      { name: "teamId", label: "Team ID", placeholder: "DEF123GHIJ" },
    ],
    extras: () => [
      { suggestedKey: "APNS_KEY_ID", what: "Key ID", field: "keyId" },
      { suggestedKey: "APNS_TEAM_ID", what: "Team ID", field: "teamId" },
    ],
    advanced: none,
  },
  aws: {
    id: "aws",
    name: "AWS / S3-compatible",
    title: "AWS / S3-compatible",
    keyExample: "AWS_SECRET_ACCESS_KEY",
    group: "Cloud & email",
    desc: "S3, SES, R2…",
    icon: "aws",
    kind: "aws",
    presetId: "aws-s3",
    providers: AWS_SERVICES,
    providerLabel: "Service",
    value: { name: "secretAccessKey", label: "Secret access key", secret: true },
    required: (p) => [
      {
        name: "accessKeyId",
        label: "Access key ID",
        secret: true,
        placeholder: "AKIA…",
        hint: "The real one; cb needs it to sign requests.",
      },
      {
        name: "region",
        label: "Region",
        placeholder: p === "compatible" ? "auto" : "us-east-1",
        defaultValue: p === "compatible" ? "auto" : "us-east-1",
        hint: p === "compatible" ? "Cloudflare R2 uses auto." : undefined,
      },
      ...(p === "compatible"
        ? [
            {
              name: "endpoint",
              label: "Endpoint",
              placeholder: "https://<account>.r2.cloudflarestorage.com",
              validate: (v: string) =>
                /^https?:\/\/[^\s/]+/.test(v)
                  ? undefined
                  : "Use the storage's URL, e.g. https://<account>.r2.cloudflarestorage.com",
              hint: "Cloudflare R2, MinIO, Backblaze or any S3-compatible storage.",
            },
          ]
        : []),
    ],
    extras: (p) => [
      {
        suggestedKey: "AWS_ACCESS_KEY_ID",
        what: "Access key ID (stand-in), needed by AWS SDKs",
        field: "accessKeyId",
        preticked: true,
      },
      { suggestedKey: "AWS_REGION", what: "Region", field: "region" },
      ...awsEndpointExtras(p),
    ],
    advanced: none,
  },
  smtp: {
    id: "smtp",
    name: "Email (SMTP)",
    title: "SMTP",
    keyExample: "SMTP_URL",
    group: "Cloud & email",
    desc: "SendGrid, SES, Mailgun…",
    icon: "mail",
    kind: "smtp",
    value: {
      name: "connectionUri",
      label: "SMTP URL",
      secret: true,
      placeholder: "smtp://user:password@smtp.sendgrid.net:587",
    },
    required: none,
    extras: () => [
      { suggestedKey: "SMTP_HOST", what: "Host", field: "host" },
      { suggestedKey: "SMTP_PORT", what: "Port", field: "port" },
      { suggestedKey: "SMTP_USER", what: "Username (stand-in)", field: "user" },
      { suggestedKey: "SMTP_PASS", what: "Password (stand-in)", field: "password" },
    ],
    advanced: () => [CA_CERT],
  },
  http: {
    id: "http",
    name: "Other API key",
    title: "API key",
    keyExample: "API_KEY",
    group: "Other",
    desc: "anything without a preset",
    icon: "api",
    kind: "http",
    value: { name: "apiKey", label: "API key", secret: true },
    required: () => [
      {
        name: "upstreamUrl",
        label: "API base URL",
        placeholder: "https://api.example.com",
        hint: "Where your app's calls go.",
      },
      AUTH_SCHEME,
      AUTH_HEADER,
      BASIC_USER,
    ],
    extras: () => [{ suggestedKey: "API_BASE_URL", what: "Base URL, only if the SDK accepts one", field: "baseUrl" }],
    advanced: () => [
      {
        name: "redirectHosts",
        label: "More hosts to catch",
        optional: true,
        placeholder: "uploads.example.com:443",
        hint: "Comma-separated host:port, if the SDK also calls other hosts.",
      },
      EXTRA_HEADERS,
      API_CA_CERT,
    ],
  },
};

export const TYPE_GROUPS: { group: TypeGroup; ids: TypeId[] }[] = [
  { group: "Basic", ids: ["plain", "gen", "visible"] },
  { group: "Databases", ids: ["mongodb", "postgres", "mysql", "redis", "supabase"] },
  { group: "Payments", ids: ["stripe", "razorpay", "webhook"] },
  { group: "AI", ids: ["ai"] },
  { group: "Sign-in & push", ids: ["oauth", "gcp", "apns"] },
  { group: "Cloud & email", ids: ["aws", "smtp"] },
  { group: "Other", ids: ["http"] },
];

/** D4: one row above the table; a badge only sets the type (and provider). */
export const QUICK_ADD: { id: string; label: string; type: TypeId; provider?: string; icon: IconId }[] = [
  { id: "mongodb", label: "MongoDB", type: "mongodb", icon: "mongodb" },
  { id: "postgres", label: "Postgres", type: "postgres", icon: "postgresql" },
  { id: "redis", label: "Redis", type: "redis", icon: "redis" },
  { id: "supabase", label: "Supabase", type: "supabase", icon: "supabase" },
  { id: "stripe", label: "Stripe", type: "stripe", icon: "stripe" },
  { id: "openai", label: "OpenAI", type: "ai", provider: "openai", icon: "letter:AI" },
  { id: "anthropic", label: "Anthropic", type: "ai", provider: "anthropic", icon: "anthropic" },
  { id: "firebase", label: "Firebase", type: "gcp", icon: "firebase" },
  { id: "google", label: "Google sign-in", type: "oauth", provider: "google", icon: "google" },
  { id: "aws", label: "AWS S3", type: "aws", provider: "s3", icon: "aws" },
  { id: "ses", label: "Amazon SES", type: "aws", provider: "ses", icon: "aws" },
  { id: "smtp", label: "SMTP", type: "smtp", icon: "mail" },
  { id: "gen", label: "Random secret", type: "gen", icon: "secret" },
  { id: "http", label: "Other API", type: "http", icon: "api" },
];

/** D5: "Add MongoDB variable", "Add AI variable", "Add random secret"; plain → "Add variable". */
/** "View" is the read-only Edit dialog: no verb, e.g. "MongoDB variable". */
export function dialogTitle(verb: "Add" | "Edit" | "View", type: TypeId): string {
  const title =
    type === "plain"
      ? "variable"
      : type === "gen" || type === "visible"
        ? TYPES[type].title
        : `${TYPES[type].title} variable`;
  return verb === "View" ? title.charAt(0).toUpperCase() + title.slice(1) : `${verb} ${title}`;
}

export interface DraftExtra {
  suggestedKey: string;
  key: string;
  on: boolean;
  value?: string;
}

export interface DraftState {
  key: string;
  type: TypeId;
  provider?: string;
  /** The main value: a secret for protected types, the value itself for plain. */
  value: string;
  /** Required and advanced field values, by backend field name. */
  fields: Record<string, string>;
  extras: DraftExtra[];
  format?: string;
}

export type CreateRequest =
  | { endpoint: "variables"; body: Record<string, unknown> }
  | { endpoint: "services"; body: Record<string, unknown> };

export function initialExtras(type: TypeId, provider?: string): DraftExtra[] {
  return TYPES[type]
    .extras(provider)
    .map((e) => ({ suggestedKey: e.suggestedKey, key: e.suggestedKey, on: Boolean(e.preticked) }));
}

const hostList = (raw: string | undefined) =>
  (raw ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

/** Fields the admin filled for this type (required + advanced), minus UI-only ones and the hidden ones. */
function filledFields(def: TypeDef, d: DraftState): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of [...def.required(d.provider), ...def.advanced(d.provider)]) {
    if (f.name === "readsAs" || f.formOnly) continue;
    if (f.showWhen && (d.fields[f.showWhen.field] ?? "") !== f.showWhen.equals) continue;
    const v = (d.fields[f.name] ?? f.defaultValue ?? "").trim();
    if (v) out[f.name] = v;
  }
  return out;
}

/** The first validation message among these fields, if any (empty values are not checked). */
export function fieldError(defs: FieldDef[], values: Record<string, string>): string | undefined {
  for (const f of defs) {
    const v = (values[f.name] ?? "").trim();
    const msg = v && f.validate ? f.validate(v) : undefined;
    if (msg) return msg;
  }
  return undefined;
}

function valueSent(d: DraftState): boolean {
  const mode = TYPES[d.type].valueMode?.(d.provider) ?? "required";
  return mode === "required" || (mode === "optional" && Boolean(d.value));
}

/** Maps a finished draft to the API call: /variables for basic types, /services for anything with a service. */
export function buildCreateRequest(d: DraftState): CreateRequest {
  if (d.type === "plain") return { endpoint: "variables", body: { type: "plain", key: d.key, value: d.value } };
  if (d.type === "gen")
    return { endpoint: "variables", body: { type: "generated", key: d.key, format: d.format ?? "base64:32" } };
  if (d.type === "visible") return { endpoint: "variables", body: { type: "visible", key: d.key, value: d.value } };

  const def = TYPES[d.type];
  const valueField = def.value?.name ?? "apiKey";
  const fields = filledFields(def, d);
  // basePath has no form field; it is accepted when a caller (or a future .env import) provides it.
  const basePath = d.fields.basePath?.trim();
  const resource: Record<string, unknown> = {
    kind: def.kind,
    ...fields,
    ...(basePath ? { basePath } : {}),
    ...(fields.redirectHosts ? { redirectHosts: hostList(fields.redirectHosts) } : {}),
    // Optional values are sent only when typed; "none" (cb makes it) never, even if typed before a provider switch.
    ...(valueSent(d) ? { [valueField]: d.value } : {}),
  };
  let preset = def.presetId;
  let mainField: string | undefined;

  if (d.type === "ai") {
    const p = providerOf(AI_PROVIDERS, d.provider);
    preset = p?.presetId;
    if (p?.id === "custom") {
      resource.provider = "ai-custom";
      resource.authScheme ??= "bearer";
    }
  }
  if (d.type === "oauth") preset = providerOf(OAUTH_PROVIDERS, d.provider)?.presetId;
  if (d.type === "webhook") resource.provider = d.provider ?? "stripe";
  if (d.type === "gcp")
    mainField =
      d.fields.readsAs === "privateKey"
        ? "privateKey"
        : d.fields.readsAs === "file"
          ? "credentialsFile"
          : "credentialsJson";
  if (typeof fields.extraHeaders === "string")
    resource.extraHeaders = parseHeaderLines(fields.extraHeaders).headers ?? {};
  if (d.type === "aws") {
    const service = d.provider ?? "s3";
    const derived = fields.region ? awsEndpoint(service, fields.region) : undefined;
    if (derived) resource.endpoint = derived;
    if (service !== "compatible") resource.awsService = service;
  }
  if (
    (d.type === "http" || d.type === "supabase") &&
    typeof fields.upstreamUrl === "string" &&
    fields.upstreamUrl.startsWith("https://")
  ) {
    // SDKs with a fixed host are caught by host (Layer 2); the base-URL extra covers the rest.
    const host = `${new URL(fields.upstreamUrl).hostname}:443`;
    const extra = Array.isArray(resource.redirectHosts) ? (resource.redirectHosts as string[]) : [];
    resource.redirectHosts = [...new Set([host, ...extra])];
  }

  const defs = def.extras(d.provider);
  const extras = d.extras
    .filter((e) => e.on && e.key.trim())
    .flatMap((e): ({ key: string; field: string } | { key: string; value: string })[] => {
      const ed = defs.find((x) => x.suggestedKey === e.suggestedKey);
      if (!ed) return [];
      if (ed.field) return [{ key: e.key, field: ed.field }];
      const value = e.value?.trim() || (ed.defaultFrom ? (d.fields[ed.defaultFrom] ?? "").trim() : "");
      return [{ key: e.key, value }];
    });

  const body: Record<string, unknown> = { key: d.key, test: true, resource, extras };
  if (preset) body.preset = preset;
  if (mainField) body.mainField = mainField;
  return { endpoint: "services", body };
}
