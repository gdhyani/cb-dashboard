import {
  Building2,
  Database,
  FolderPlus,
  Globe,
  KeyRound,
  Laptop,
  Layers,
  type LucideIcon,
  MonitorX,
  Play,
  Plug,
  Power,
  PowerOff,
  ShieldCheck,
  ShieldOff,
  Unplug,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";
import type { ReactNode } from "react";
import { KINDS } from "@/features/resources";
import type { AuditEvent } from "../types";

const KIND_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(KINDS).map(([kind, spec]) => [kind, spec.label]),
);

const B = ({ children }: { children: ReactNode }) => (
  <strong className="font-medium text-foreground">{children}</strong>
);

export interface Described {
  icon: LucideIcon;
  text: ReactNode;
  /** Draws the eye: revocations, kills, denials. */
  alert?: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function bytes(n: unknown): string {
  const v = Number(n ?? 0);
  return v < 1024 ? `${v} B` : v < 1_048_576 ? `${(v / 1024).toFixed(1)} KB` : `${(v / 1_048_576).toFixed(1)} MB`;
}

/** Turns one audit event into a plain-English sentence (J8). */
export function describe(e: AuditEvent): Described {
  const who = <B>{e.actor?.name ?? "System"}</B>;
  const target = e.targetUser?.name ?? e.target ?? "someone";
  const env = e.environment ? <B>{e.environment.name}</B> : "an environment";
  const resource = e.resource ? (
    <>
      <B>{e.resource.name}</B> <span className="text-subtle">({KIND_LABEL[e.resource.kind] ?? e.resource.kind})</span>
    </>
  ) : (
    "a service"
  );
  const denied = e.outcome !== "success";

  switch (e.action) {
    case "org.created":
      return {
        icon: Building2,
        text: (
          <>
            {who} created the organization <B>{target}</B>
          </>
        ),
      };
    case "member.invited":
      return {
        icon: UserPlus,
        text: (
          <>
            {who} invited <B>{target}</B>
          </>
        ),
      };
    case "member.joined":
      return {
        icon: UserCheck,
        text: (
          <>
            {who} joined as {str(e.meta.role) || "member"}
          </>
        ),
      };
    case "member.role_changed":
      return {
        icon: UserCog,
        text: (
          <>
            {who} changed <B>{target}</B>’s role from {str(e.meta.from)} to <B>{str(e.meta.to)}</B>
          </>
        ),
      };
    case "member.removed":
      return {
        icon: UserMinus,
        text: (
          <>
            {who} removed <B>{target}</B> from the organization
          </>
        ),
        alert: true,
      };
    case "project.created":
      return {
        icon: FolderPlus,
        text: (
          <>
            {who} created project <B>{target}</B>
          </>
        ),
      };
    case "project.updated":
      return {
        icon: FolderPlus,
        text: (
          <>
            {who} updated project <B>{target}</B>
          </>
        ),
      };
    case "project.deleted":
      return {
        icon: FolderPlus,
        text: (
          <>
            {who} deleted project <B>{target}</B>
          </>
        ),
        alert: true,
      };
    case "environment.created":
      return {
        icon: Layers,
        text: (
          <>
            {who} added environment <B>{target}</B>
          </>
        ),
      };
    case "environment.renamed":
      return {
        icon: Layers,
        text: (
          <>
            {who} renamed an environment to <B>{target}</B>
          </>
        ),
      };
    case "environment.deleted":
      return {
        icon: Layers,
        text: (
          <>
            {who} deleted environment <B>{target}</B>
          </>
        ),
        alert: true,
      };
    case "environment.killed":
      return {
        icon: PowerOff,
        text: (
          <>
            {who} suspended {env}: “{str(e.meta.reason)}”
          </>
        ),
        alert: true,
      };
    case "environment.revived":
      return {
        icon: Power,
        text: (
          <>
            {who} resumed {env}
          </>
        ),
      };
    case "resource.created":
      return {
        icon: Database,
        text: (
          <>
            {who} added {resource} to {env}
          </>
        ),
      };
    case "resource.updated":
      return {
        icon: Database,
        text: (
          <>
            {who} updated {resource}
          </>
        ),
      };
    case "resource.rotated":
      return {
        icon: KeyRound,
        text: (
          <>
            {who} rotated the credentials of {resource}
          </>
        ),
      };
    case "resource.deleted":
      return {
        icon: Database,
        text: (
          <>
            {who} deleted service <B>{target}</B> from {env}
          </>
        ),
        alert: true,
      };
    case "variable.created":
      return {
        icon: KeyRound,
        text: (
          <>
            {who} added <B>{target}</B> to {env}
          </>
        ),
      };
    case "variable.updated":
      return {
        icon: KeyRound,
        text: (
          <>
            {who} changed <B>{target}</B> in {env}
          </>
        ),
      };
    case "variable.deleted":
      return {
        icon: KeyRound,
        text: (
          <>
            {who} deleted <B>{target}</B> from {env}
          </>
        ),
      };
    case "grant.created":
      return {
        icon: ShieldCheck,
        text: (
          <>
            {who} gave <B>{target}</B> access to {env}
            {e.meta.expiresAt ? " (temporary)" : ""}
          </>
        ),
      };
    case "grant.revoked":
      return {
        icon: ShieldOff,
        text: (
          <>
            {who} revoked <B>{target}</B>’s access to {env}
          </>
        ),
        alert: true,
      };
    case "grant.expired":
      return {
        icon: ShieldOff,
        text: (
          <>
            <B>{target}</B>’s temporary access to {env} expired
          </>
        ),
        alert: true,
      };
    case "device.approved":
      return {
        icon: Laptop,
        text: (
          <>
            {who} logged in the CLI on <B>{target}</B>
          </>
        ),
      };
    case "device.revoked":
      return {
        icon: MonitorX,
        text: (
          <>
            {who} revoked device <B>{target}</B>
          </>
        ),
        alert: true,
      };
    case "agent.bootstrap":
      return denied
        ? {
            icon: ShieldOff,
            text: (
              <>
                {who} was blocked from running {env} (
                {str(e.meta.reason).toLowerCase().replaceAll("_", " ") || "denied"})
              </>
            ),
            alert: true,
          }
        : {
            icon: Play,
            text: (
              <>
                {who} started the app on {env}
              </>
            ),
          };
    case "tunnel.opened":
      return {
        icon: Plug,
        text: (
          <>
            {who} connected to {resource}
          </>
        ),
      };
    case "tunnel.closed":
      return {
        icon: Unplug,
        text: (
          <>
            {who} disconnected from {resource} · {bytes(e.meta.bytesIn)} in, {bytes(e.meta.bytesOut)} out
          </>
        ),
      };
    case "tunnel.denied":
      return {
        icon: ShieldOff,
        text: (
          <>
            {who} was refused a connection to {resource}
          </>
        ),
        alert: true,
      };
    case "http.request":
      return {
        icon: Globe,
        text: (
          <>
            {who} called <B>{`${str(e.meta.method)} ${str(e.meta.host)}${str(e.meta.path)}`}</B> →{" "}
            {String(e.meta.status ?? "")}
          </>
        ),
      };
    default:
      return {
        icon: Layers,
        text: (
          <>
            {who} · {e.action.replaceAll(".", " ")}
          </>
        ),
      };
  }
}
