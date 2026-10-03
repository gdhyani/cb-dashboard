export type CheckState = "up" | "down";

export interface Health {
  status: "ok" | "degraded";
  uptimeSec: number;
  version: string;
  checks: Record<string, CheckState>;
}
