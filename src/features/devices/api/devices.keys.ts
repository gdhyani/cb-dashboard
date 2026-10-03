export const deviceKeys = {
  mine: ["me", "devices"] as const,
  org: (orgId: string) => ["orgs", orgId, "devices"] as const,
};
