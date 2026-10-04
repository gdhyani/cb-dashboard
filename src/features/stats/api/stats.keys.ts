export const statsKeys = {
  org: (orgId: string) => ["orgs", orgId, "stats"] as const,
};
