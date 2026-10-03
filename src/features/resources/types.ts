export type ResourceKind = "mongodb" | "redis" | "http";

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

export type CreateResourceInput =
  | { kind: "mongodb" | "redis"; name: string; connectionUri: string }
  | {
      kind: "http";
      name: string;
      upstreamUrl: string;
      authScheme: "bearer" | "x-api-key" | "basic-password";
      apiKey: string;
      fakePrefix?: string;
      basePath?: string;
      redirectHosts?: string[];
    };
