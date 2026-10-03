export interface AuditEvent {
  id: string;
  action: string;
  outcome: "success" | "denied" | "error";
  actor: { id: string; name: string; email: string } | null;
  target: string | null;
  projectId: string | null;
  environmentId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}
