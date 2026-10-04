import type { ResourceKind } from "../types";

export interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "select" | "list" | "multiline" | "secret" | "secret-multiline";
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  mono?: boolean;
}

export interface KindSpec {
  label: string;
  /** One line under the type picker: what the gateway does with it. */
  description: string;
  namePlaceholder: string;
  /** Non-secret settings, visible to admins after save. */
  settings: FieldSpec[];
  /** Write-only credentials (FR-UI-001); also what a credential profile holds. */
  secrets: FieldSpec[];
  summary: (config: Record<string, unknown>) => string;
}

const uri = (placeholder: string): FieldSpec[] => [
  { name: "connectionUri", label: "Real connection URI", type: "secret", placeholder },
];
/** Public CA certificate for self-hosted or private-CA servers; trusted for this resource only. */
const caField: FieldSpec = {
  name: "caCert",
  label: "CA certificate (optional)",
  type: "multiline",
  optional: true,
  mono: true,
  placeholder: "-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----",
  hint: "Only for servers whose certificate isn't from a public CA (self-hosted, Aiven, DigitalOcean). Public, not a secret.",
};
const hostSummary = (c: Record<string, unknown>) =>
  [c.host, c.database].filter((v) => v !== undefined && v !== "").join(" · ");
const upstreamField: FieldSpec = {
  name: "upstreamUrl",
  label: "Private endpoint (optional)",
  type: "text",
  optional: true,
  mono: true,
  hint: "Send redirected traffic here instead of the provider's own host.",
};
const redirectsField = (placeholder: string): FieldSpec => ({
  name: "redirectHosts",
  label: "Redirect hosts (optional)",
  type: "list",
  optional: true,
  mono: true,
  placeholder,
  hint: "host:443, comma separated. Defaults to the provider's hosts.",
});

export const KINDS: Record<ResourceKind, KindSpec> = {
  postgres: {
    label: "PostgreSQL",
    description: "Apps get a fake URL; the gateway signs in with SCRAM using the real user.",
    namePlaceholder: "orders-db",
    settings: [caField],
    secrets: uri("postgresql://user:password@host:5432/db?sslmode=require"),
    summary: hostSummary,
  },
  mysql: {
    label: "MySQL",
    description: "Fake URL for the app; the gateway authenticates upstream with the real user.",
    namePlaceholder: "legacy-db",
    settings: [caField],
    secrets: uri("mysql://user:password@host:3306/db?ssl=true"),
    summary: hostSummary,
  },
  mongodb: {
    label: "MongoDB",
    description: "Fake URL for the app; SCRAM-SHA-256 upstream with the real user.",
    namePlaceholder: "main-db",
    settings: [caField],
    secrets: uri("mongodb+srv://user:password@cluster0.example.mongodb.net/db"),
    summary: hostSummary,
  },
  redis: {
    label: "Redis",
    description: "Fake AUTH for the app; the real password or ACL user is used upstream.",
    namePlaceholder: "cache",
    settings: [caField],
    secrets: uri("redis://user:password@host:6379/0"),
    summary: hostSummary,
  },
  smtp: {
    label: "SMTP",
    description: "Fake SMTP login for the app; real AUTH over STARTTLS upstream.",
    namePlaceholder: "mailer",
    settings: [caField],
    secrets: uri("smtp://user:password@smtp.provider.com:587"),
    summary: (c) => String(c.host ?? ""),
  },
  http: {
    label: "HTTP API key",
    description: "Stripe, OpenAI and other key-based APIs. The fake key is swapped for the real one.",
    namePlaceholder: "payments-api",
    settings: [
      {
        name: "upstreamUrl",
        label: "Upstream URL",
        type: "text",
        mono: true,
        placeholder: "https://api.provider.com",
        hint: "https only.",
      },
      {
        name: "authScheme",
        label: "Auth header",
        type: "select",
        defaultValue: "bearer",
        options: [
          { value: "bearer", label: "Authorization: Bearer" },
          { value: "x-api-key", label: "x-api-key" },
          { value: "basic-password", label: "Basic (password)" },
        ],
      },
      { name: "fakePrefix", label: "Fake key prefix", type: "text", mono: true, defaultValue: "cb_", optional: true },
      { name: "basePath", label: "Base path (optional)", type: "text", mono: true, optional: true, placeholder: "/v1" },
      redirectsField("api.stripe.com:443"),
    ],
    secrets: [{ name: "apiKey", label: "Real API key", type: "secret", placeholder: "sk_live_…" }],
    summary: (c) => String(c.upstreamUrl ?? ""),
  },
  oauth: {
    label: "OAuth client",
    description: "Google, GitHub and other OAuth apps. The client secret is swapped at the token endpoint.",
    namePlaceholder: "google-sign-in",
    settings: [
      {
        name: "tokenUrl",
        label: "Token endpoint",
        type: "text",
        mono: true,
        placeholder: "https://oauth2.googleapis.com/token",
      },
      upstreamField,
      redirectsField("oauth2.googleapis.com:443"),
    ],
    secrets: [{ name: "clientSecret", label: "Real client secret", type: "secret", placeholder: "GOCSPX-…" }],
    summary: (c) => String(c.tokenUrl ?? ""),
  },
  aws: {
    label: "AWS / S3",
    description: "S3, R2 and other SigV4 services. Requests are re-signed with the real keys, presigned URLs too.",
    namePlaceholder: "uploads",
    settings: [
      {
        name: "region",
        label: "Region",
        type: "text",
        mono: true,
        placeholder: "eu-west-1",
        defaultValue: "us-east-1",
      },
      {
        name: "endpoint",
        label: "Endpoint",
        type: "text",
        mono: true,
        placeholder: "https://s3.eu-west-1.amazonaws.com",
      },
    ],
    secrets: [
      { name: "accessKeyId", label: "Real access key ID", type: "secret", placeholder: "AKIA…" },
      { name: "secretAccessKey", label: "Real secret access key", type: "secret" },
    ],
    summary: (c) => [c.endpoint, c.region].filter(Boolean).join(" · "),
  },
  "google-sa": {
    label: "Firebase / Google service account",
    description: "Firebase Admin and FCM. Each device gets its own fake key; tokens are minted with the real one.",
    namePlaceholder: "firebase",
    settings: [upstreamField, redirectsField("oauth2.googleapis.com:443, fcm.googleapis.com:443")],
    secrets: [
      {
        name: "serviceAccountJson",
        label: "Service-account JSON key",
        type: "secret-multiline",
        placeholder: '{ "type": "service_account", "project_id": "…", "private_key": "…" }',
      },
    ],
    summary: (c) => [c.projectId, c.clientEmail].filter(Boolean).join(" · "),
  },
  apns: {
    label: "Apple Push (APNs)",
    description: "Token-based APNs. Apps sign with a fake .p8; the gateway re-signs with the team key.",
    namePlaceholder: "apple-push",
    settings: [
      { name: "keyId", label: "Key ID", type: "text", mono: true, placeholder: "ABC123DEFG" },
      { name: "teamId", label: "Team ID", type: "text", mono: true, placeholder: "TEAM456XYZ" },
      upstreamField,
    ],
    secrets: [
      {
        name: "privateKey",
        label: "Real .p8 key",
        type: "secret-multiline",
        placeholder: "-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----",
      },
    ],
    summary: (c) => [c.keyId && `key ${c.keyId}`, c.teamId && `team ${c.teamId}`].filter(Boolean).join(" · "),
  },
  webhook: {
    label: "Webhook signing secret",
    description: "Providers post to cb; each developer's app gets the webhooks it caused, signed with its stand-in.",
    namePlaceholder: "stripe-webhooks",
    settings: [
      { name: "path", label: "Path in your app", type: "text", mono: true, placeholder: "/api/webhooks/stripe" },
    ],
    secrets: [{ name: "signingSecret", label: "Signing secret", type: "secret", placeholder: "whsec_…" }],
    summary: (c) => [c.provider, c.path].filter(Boolean).join(" · "),
  },
};

export const KIND_ORDER = Object.keys(KINDS) as ResourceKind[];

export const initialValues = (fields: FieldSpec[]) =>
  Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""])) as Record<string, string>;

/** Form values → request body: lists split, empty optional fields dropped. */
export function toBody(fields: FieldSpec[], values: Record<string, string>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = (values[f.name] ?? "").trim();
    if (!raw && f.optional) continue;
    body[f.name] =
      f.type === "list" ? raw.split(/[\s,]+/).filter(Boolean) : f.type.startsWith("secret") ? values[f.name] : raw;
  }
  return body;
}

export const isComplete = (fields: FieldSpec[], values: Record<string, string>) =>
  fields.every((f) => f.optional || (values[f.name] ?? "").trim() !== "");
