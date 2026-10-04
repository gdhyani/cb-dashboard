export type AuditCategory = "team" | "access" | "config" | "security" | "runtime";

export interface NamedRef {
  id: string;
  name: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  category: AuditCategory;
  outcome: "success" | "denied" | "error";
  actor: { id: string; name: string; email: string } | null;
  target: string | null;
  targetUser: NamedRef | null;
  project: NamedRef | null;
  environment: NamedRef | null;
  resource: (NamedRef & { kind: string }) | null;
  meta: Record<string, unknown>;
  createdAt: string;
}
