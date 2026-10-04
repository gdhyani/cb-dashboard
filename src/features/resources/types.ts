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
  | "apns";

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
