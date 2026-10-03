export const projectKeys = {
  list: (orgId: string) => ["orgs", orgId, "projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};
