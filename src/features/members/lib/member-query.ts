import type { Role } from "@/features/auth/types";
import type { Member } from "../types";

/** Most powerful first, so an ascending role sort lists owners at the top. */
export const ROLE_ORDER: Role[] = ["owner", "admin", "developer"];

export const ROLE_LABEL: Record<Role, string> = { owner: "Owner", admin: "Admin", developer: "Developer" };

/** Text a member row is searched by. */
export const memberSearchFields = (m: Member) => [m.name, m.email];

export const memberFilters = {
  role: (m: Member, value: string) => m.role === value,
};

export const memberSorters = {
  name: (a: Member, b: Member) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  role: (a: Member, b: Member) =>
    ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  joined: (a: Member, b: Member) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt),
};

export type MemberSort = keyof typeof memberSorters;
