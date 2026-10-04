export const memberKeys = {
  list: (orgId: string) => ["orgs", orgId, "members"] as const,
  invites: (orgId: string) => ["orgs", orgId, "invites"] as const,
};
