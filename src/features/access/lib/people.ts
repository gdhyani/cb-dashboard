import type { Member } from "@/features/members/types";
import { timeUntil } from "@/shared/lib/format-time";
import type { AccessMatrix, Grant, ProjectAccessInput } from "../types";

export interface PersonAccess {
  member: Member;
  projectGrant?: Grant;
  environmentGrants: Grant[];
}

/** Developers who have any access to the project (owners/admins are listed separately). */
export function peopleWithAccess(m: AccessMatrix): PersonAccess[] {
  return m.members
    .filter((member) => member.role === "developer")
    .map((member) => {
      const mine = m.grants.filter((g) => g.userId === member.userId);
      return {
        member,
        projectGrant: mine.find((g) => g.scope === "project"),
        environmentGrants: mine.filter((g) => g.scope === "environment"),
      };
    })
    .filter((p) => p.projectGrant || p.environmentGrants.length > 0);
}

export const admins = (m: AccessMatrix) => m.members.filter((x) => x.role !== "developer");

/** Developers without any access yet — the people "Add people" offers. */
export const developersWithoutAccess = (m: AccessMatrix) => {
  const withAccess = new Set(m.grants.map((g) => g.userId));
  return m.members.filter((x) => x.role === "developer" && !withAccess.has(x.userId));
};

export function scopeLabel(p: PersonAccess, m: AccessMatrix): string {
  if (p.projectGrant) return "All environments";
  const names = p.environmentGrants
    .map((g) => m.environments.find((e) => e.id === g.environmentId)?.name)
    .filter(Boolean);
  return names.join(", ");
}

const grantsOf = (p: PersonAccess) => (p.projectGrant ? [p.projectGrant] : p.environmentGrants);

export function expiryLabel(p: PersonAccess): string {
  const dates = grantsOf(p)
    .map((g) => g.expiresAt)
    .filter((d): d is string => Boolean(d));
  if (dates.length === 0) return "No expiry";
  const soonest = dates.sort()[0] as string;
  return `Expires ${timeUntil(soonest)}`;
}

export const profileCount = (p: PersonAccess) =>
  new Set(grantsOf(p).flatMap((g) => g.resourceProfiles.map((r) => r.resourceId))).size;

/** Current access as the dialog's starting values. */
export function toInput(p: PersonAccess | undefined): ProjectAccessInput {
  if (!p) return { scope: "project", expiresAt: null, resourceProfiles: [] };
  const g = grantsOf(p);
  return {
    scope: p.projectGrant ? "project" : "environments",
    environmentIds: p.projectGrant ? [] : p.environmentGrants.map((x) => x.environmentId ?? ""),
    expiresAt: g[0]?.expiresAt ?? null,
    resourceProfiles: g[0]?.resourceProfiles ?? [],
  };
}

export interface EnvironmentPerson {
  member: Member;
  via: "project" | "environment";
  grant: Grant;
}

/** Who can use one environment, and where that access comes from (environment grants win for display). */
export function environmentPeople(m: AccessMatrix, envId: string): EnvironmentPerson[] {
  return peopleWithAccess(m)
    .map((p): EnvironmentPerson | undefined => {
      const own = p.environmentGrants.find((g) => g.environmentId === envId);
      if (own) return { member: p.member, via: "environment", grant: own };
      if (p.projectGrant) return { member: p.member, via: "project", grant: p.projectGrant };
      return undefined;
    })
    .filter((x): x is EnvironmentPerson => Boolean(x));
}
