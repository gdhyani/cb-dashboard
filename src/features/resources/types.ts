export type ResourceKind =
  | "postgres"
  | "mysql"
  | "mongodb"
  | "redis"
  | "smtp"
  | "http"
  | "oauth"
  | "aws"
  | "google-sa"
  | "apns"
  | "webhook";

export interface Resource {
  id: string;
  environmentId: string;
  kind: ResourceKind;
  name: string;
  config: Record<string, unknown>;
  credentialsSet: boolean;
  rotatedAt: string | null;
  disabled: boolean;
  brokeredFields: string[];
  createdAt: string;
  /** Webhook services: the URL to paste into the provider's webhook settings. */
  webhookUrl?: string;
}

/** Fields depend on the kind (see lib/kinds.ts); secrets are write-only. */
export type CreateResourceInput = { kind: ResourceKind; name: string } & Record<string, unknown>;
export type CredentialsInput = Record<string, unknown>;

/** J2: a named credential set; "default" is the resource's own credentials. */
export interface CredentialProfile {
  name: string;
  rotatedAt: string | null;
  isDefault: boolean;
}

/** §10.8 provider template (served by the backend as data). */
export interface Preset {
  id: string;
  name: string;
  category: "AI" | "Payments" | "Auth" | "Push" | "Storage" | "Email" | "Database";
  kind: ResourceKind;
  description: string;
  defaults: Record<string, unknown>;
  secretPlaceholder: string;
  variables: { key: string; field: string }[];
  plainVariables?: { key: string; hint: string }[];
}

export interface ResourceTestResult {
  ok: boolean;
  profile: string;
  latencyMs: number;
  message: string;
}
