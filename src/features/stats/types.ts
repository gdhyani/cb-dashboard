export type ActivityCategory = "team" | "access" | "config" | "security" | "runtime";

export interface OrgStats {
  /** "org" for owners/admins; "me" for developers (own activity only). */
  scope: "org" | "me";
  days: { date: string; connections: number; denied: number; byCategory: Record<ActivityCategory, number> }[];
  connectionsByProject: { projectId: string; name: string; connections: number; daily: number[] }[];
  resourcesByKind: { kind: string; count: number }[];
  grants: { permanent: number; temporary: number };
}
