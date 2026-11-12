import { format } from "date-fns";
import type { AuditCategory, AuditEvent } from "../types";

/** Server-side filter (the API's `category` param). */
export const CATEGORY_OPTIONS: { value: AuditCategory; label: string }[] = [
  { value: "access", label: "Access" },
  { value: "team", label: "Team" },
  { value: "config", label: "Config" },
  { value: "security", label: "Devices" },
  { value: "runtime", label: "Usage" },
];

/** Client-side filter over the loaded page (the API has no outcome param). */
export const OUTCOME_OPTIONS: { value: AuditEvent["outcome"]; label: string }[] = [
  { value: "success", label: "Success" },
  { value: "denied", label: "Denied" },
  { value: "error", label: "Error" },
];

/** Searches actor, action, target and where it happened. */
export const auditSearchFields = (e: AuditEvent) => [
  e.actor?.name,
  e.actor?.email,
  e.action,
  e.action.replaceAll(".", " ").replaceAll("_", " "),
  e.target,
  e.targetUser?.name,
  e.project?.name,
  e.environment?.name,
  e.resource?.name,
];

export const auditFilters = {
  outcome: (e: AuditEvent, value: string) => e.outcome === value,
};

/** Log timestamp: "13 Nov 14:02:11". */
export const logTime = (iso: string) => format(new Date(iso), "d MMM HH:mm:ss");
