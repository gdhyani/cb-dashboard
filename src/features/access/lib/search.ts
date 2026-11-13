import type { Member } from "@/features/members/types";

/** Access tables are searched by a person's name and email. */
export const personFields = (row: { member: Member }) => [row.member.name, row.member.email];
