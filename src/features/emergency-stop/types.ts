export type StopScope = "org" | "environment" | "resource" | "user" | "device";

/** An emergency stop (backend: kill switch). */
export interface EmergencyStop {
  id: string;
  scope: StopScope;
  targetId: string | null;
  targetLabel: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  clearedAt: string | null;
}
