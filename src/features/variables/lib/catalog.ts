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
  | "stripe"
  | "razorpay"
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
  /** Only shown when another field has this value (e.g. authHeader when authScheme is "header"). */
  showWhen?: { field: string; equals: string };
}

export interface ExtraDef {
  suggestedKey: string;
  what: string;
  /** Brokered field of the service; omitted for a plain value the admin types. */
  field?: string;
  preticked?: boolean;
  placeholder?: string;
}

export type TypeGroup = "Basic" | "Databases" | "Payments" | "AI" | "Sign-in & push" | "Cloud & email" | "Other";

export interface TypeDef {
  id: TypeId;
  name: string;
  /** Used in titles: "Add <title> variable". */
  title: string;
  group: TypeGroup;
  desc: string;
  icon: IconId;
  kind?: ResourceKind;
  presetId?: string;
  providers?: ProviderDef[];
  value?: FieldDef;
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
};

const none = () => [];
const CA_CERT: FieldDef = {
  name: "caCert",
  label: "CA certificate (PEM)",
  multiline: true,
  optional: true,
  hint: "Only for self-hosted servers or providers that give you a CA file (Aiven, DigitalOcean).",
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

const db = (id: TypeId, name: string, kind: ResourceKind, icon: IconId, placeholder: string): TypeDef => ({
  id,
  name,
  title: name,
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
    icon: "letter:AI",
    placeholder: "sk-proj-…",
    baseUrlKey: "OPENAI_BASE_URL",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    presetId: "anthropic",
    icon: "anthropic",
    placeholder: "sk-ant-…",
    baseUrlKey: "ANTHROPIC_BASE_URL",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    presetId: "gemini",
    icon: "googlegemini",
    placeholder: "AIza…",
    baseUrlKey: "GEMINI_BASE_URL",
  },
  { id: "groq", name: "Groq", presetId: "groq", icon: "letter:Gq", placeholder: "gsk_…", baseUrlKey: "GROQ_BASE_URL" },
  {
    id: "mistral",
    name: "Mistral",
    presetId: "mistral",
    icon: "mistralai",
    placeholder: "the API key",
    baseUrlKey: "MISTRAL_BASE_URL",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    presetId: "openrouter",
    icon: "openrouter",
    placeholder: "sk-or-…",
    baseUrlKey: "OPENROUTER_BASE_URL",
  },
  {
    id: "custom",
    name: "Custom / self-hosted",
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
    icon: "google",
    placeholder: "GOCSPX-…",
    baseUrlKey: "GOOGLE_CLIENT_ID",
  },
  {
    id: "github",
    name: "GitHub",
    presetId: "github-oauth",
    icon: "github",
    placeholder: "the client secret",
    baseUrlKey: "GITHUB_CLIENT_ID",
  },
  {
    id: "custom",
    name: "Other (any OAuth provider)",
    icon: "letter:ID",
    placeholder: "the client secret",
    baseUrlKey: "OAUTH_CLIENT_ID",
  },
];

const providerOf = (list: ProviderDef[], id?: string) => list.find((p) => p.id === id) ?? list[0];

export const TYPES: Record<TypeId, TypeDef> = {
  plain: {
    id: "plain",
    name: "Plain value",
    title: "",
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
    group: "Basic",
    desc: "different per developer",
    icon: "letter:✱",
    required: none,
    extras: none,
    advanced: none,
  },
  visible: {
    id: "visible",
    name: "Secret shown as-is",
    title: "secret shown as-is",
    group: "Basic",
    desc: "last resort",
    icon: "letter:!",
    value: { name: "value", label: "Value", secret: true },
    required: none,
    extras: none,
    advanced: none,
  },
  mongodb: db("mongodb", "MongoDB", "mongodb", "mongodb", "mongodb+srv://user:password@cluster0.xxxx.mongodb.net/db"),
  postgres: db("postgres", "Postgres", "postgres", "postgresql", "postgresql://user:password@host:5432/db"),
  mysql: db("mysql", "MySQL", "mysql", "mysql", "mysql://user:password@host:3306/db"),
  redis: db("redis", "Redis", "redis", "redis", "rediss://default:password@host:6379"),
  stripe: {
    id: "stripe",
    name: "Stripe",
    title: "Stripe",
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
    group: "Payments",
    desc: "key secret",
    icon: "razorpay",
    kind: "http",
    presetId: "razorpay",
    value: { name: "apiKey", label: "Key secret", secret: true },
    required: none,
    extras: () => [
      { suggestedKey: "RAZORPAY_KEY_ID", what: "Key ID (public)", preticked: true, placeholder: "rzp_live_…" },
    ],
    advanced: none,
  },
  ai: {
    id: "ai",
    name: "AI API key",
    title: "AI",
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
            AUTH_SCHEME,
            AUTH_HEADER,
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
          ],
  },
  oauth: {
    id: "oauth",
    name: "Sign-in client secret",
    title: "sign-in",
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
    group: "Sign-in & push",
    desc: "Firebase, FCM, GCP",
    icon: "googlecloud",
    kind: "google-sa",
    value: { name: "serviceAccountJson", label: "Service account JSON", secret: true, multiline: true },
    required: () => [
      {
        name: "readsAs",
        label: "Your app reads it as",
        defaultValue: "json",
        select: [
          { value: "json", label: "The whole JSON, in this variable" },
          { value: "privateKey", label: "Only the private key (PEM)" },
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
    group: "Sign-in & push",
    desc: "APNs .p8",
    icon: "apple",
    kind: "apns",
    value: { name: "privateKey", label: ".p8 key", secret: true, multiline: true },
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
    group: "Cloud & email",
    desc: "secret access key",
    icon: "letter:S3",
    kind: "aws",
    presetId: "aws-s3",
    value: { name: "secretAccessKey", label: "Secret access key", secret: true },
    required: () => [
      {
        name: "accessKeyId",
        label: "Access key ID",
        secret: true,
        placeholder: "AKIA…",
        hint: "The real one; cb needs it to sign requests.",
      },
      { name: "region", label: "Region", placeholder: "us-east-1", defaultValue: "us-east-1" },
    ],
    extras: () => [
      {
        suggestedKey: "AWS_ACCESS_KEY_ID",
        what: "Access key ID (stand-in), needed by AWS SDKs",
        field: "accessKeyId",
        preticked: true,
      },
      { suggestedKey: "AWS_REGION", what: "Region", field: "region" },
      { suggestedKey: "AWS_ENDPOINT_URL", what: "Endpoint (a local URL set by cb)", field: "endpoint" },
    ],
    advanced: () => [
      {
        name: "endpoint",
        label: "Custom endpoint",
        optional: true,
        placeholder: "https://<account>.r2.cloudflarestorage.com",
        hint: "Cloudflare R2, MinIO, Backblaze or any S3-compatible storage.",
      },
    ],
  },
  smtp: {
    id: "smtp",
    name: "Email (SMTP)",
    title: "SMTP",
    group: "Cloud & email",
    desc: "SendGrid, SES, Mailgun…",
    icon: "letter:@",
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
    group: "Other",
    desc: "anything without a preset",
    icon: "letter:{}",
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
    ],
  },
};

export const TYPE_GROUPS: { group: TypeGroup; ids: TypeId[] }[] = [
  { group: "Basic", ids: ["plain", "gen", "visible"] },
  { group: "Databases", ids: ["mongodb", "postgres", "mysql", "redis"] },
  { group: "Payments", ids: ["stripe", "razorpay"] },
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
  { id: "stripe", label: "Stripe", type: "stripe", icon: "stripe" },
  { id: "openai", label: "OpenAI", type: "ai", provider: "openai", icon: "letter:AI" },
  { id: "anthropic", label: "Anthropic", type: "ai", provider: "anthropic", icon: "anthropic" },
  { id: "firebase", label: "Firebase", type: "gcp", icon: "firebase" },
  { id: "google", label: "Google sign-in", type: "oauth", provider: "google", icon: "google" },
  { id: "aws", label: "AWS S3", type: "aws", icon: "letter:S3" },
  { id: "smtp", label: "SMTP", type: "smtp", icon: "letter:@" },
  { id: "gen", label: "Random secret", type: "gen", icon: "letter:✱" },
  { id: "http", label: "Other API", type: "http", icon: "letter:{}" },
];

/** D5: "Add MongoDB variable", "Add AI variable", "Add random secret"; plain → "Add variable". */
export function dialogTitle(verb: "Add" | "Edit", type: TypeId): string {
  if (type === "plain") return `${verb} variable`;
  if (type === "gen" || type === "visible") return `${verb} ${TYPES[type].title}`;
  return `${verb} ${TYPES[type].title} variable`;
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
    if (f.name === "readsAs") continue;
    if (f.showWhen && (d.fields[f.showWhen.field] ?? "") !== f.showWhen.equals) continue;
    const v = (d.fields[f.name] ?? f.defaultValue ?? "").trim();
    if (v) out[f.name] = v;
  }
  return out;
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
    [valueField]: d.value,
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
  if (d.type === "gcp") mainField = d.fields.readsAs === "privateKey" ? "privateKey" : "credentialsJson";
  if (d.type === "aws" && !fields.endpoint && fields.region)
    resource.endpoint = `https://s3.${fields.region}.amazonaws.com`;
  if (d.type === "http" && typeof fields.upstreamUrl === "string" && fields.upstreamUrl.startsWith("https://")) {
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
      return ed.field ? [{ key: e.key, field: ed.field }] : [{ key: e.key, value: e.value ?? "" }];
    });

  const body: Record<string, unknown> = { key: d.key, test: true, resource, extras };
  if (preset) body.preset = preset;
  if (mainField) body.mainField = mainField;
  return { endpoint: "services", body };
}
