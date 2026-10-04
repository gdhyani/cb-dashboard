export const auditKeys = {
  list: (orgId: string, page: number, pageSize: number, category: string) =>
    ["orgs", orgId, "audit", page, pageSize, category] as const,
};
