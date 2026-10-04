export const accessKeys = {
  matrix: (projectId: string) => ["projects", projectId, "access"] as const,
  member: (orgId: string, userId: string) => ["orgs", orgId, "members", userId, "access"] as const,
};
